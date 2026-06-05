import mongoose from 'mongoose';
import Business from '../src/models/Business';
import { GooglePlacesService } from '../src/services/google/places';
import { resolveCategory } from '../src/services/audit-v3/categoryResolver';

async function syncBusinesses() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const businesses = await Business.find({});
  console.log(`Found ${businesses.length} businesses to sync.`);

  for (const b of businesses) {
    console.log(`\nProcessing: ${b.name} (${b._id})`);
    
    let placeId = b.googlePlaceId;

    // If no placeId, try to find one using autocomplete
    if (!placeId) {
      console.log(`  No placeId found, searching via autocomplete for "${b.name} ${b.address}"...`);
      try {
        const results = await GooglePlacesService.autocomplete(`${b.name} ${b.address}`);
        if (results && results.length > 0) {
          placeId = results[0].placeId;
          console.log(`  Found placeId: ${placeId}`);
        } else {
          console.log(`  No placeId found via search.`);
        }
      } catch (err: any) {
        console.error(`  Autocomplete error: ${err.message}`);
      }
    }

    if (placeId) {
      try {
        const details = await GooglePlacesService.getDetails(placeId);
        if (details) {
          b.googlePlaceId = placeId;
          
          if (details.categories && details.categories.length > 0) {
            const rawTypes = details.categories;
            const resolvedPrimary = resolveCategory(rawTypes);
            
            // Still format for UI display
            const formattedCategories = rawTypes.map(c => 
              c.replace(/_/g, ' ')
               .split(' ')
               .map(w => w.charAt(0).toUpperCase() + w.slice(1))
               .join(' ')
            );
            b.categories = formattedCategories;
            // Update primary category using the true resolved category
            b.category = resolvedPrimary.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            console.log(`  Resolved Primary Category:`, b.category);
          }

          if (details.latitude && details.longitude) {
            b.latitude = details.latitude;
            b.longitude = details.longitude;
            console.log(`  Updated Coordinates: ${b.latitude}, ${b.longitude}`);
          }

          if (details.city) b.city = details.city;
          if (details.state) b.state = details.state;
          if (details.country) b.country = details.country;
          if (details.postalCode) b.postalCode = details.postalCode;
          
          if (details.city || details.state) {
            console.log(`  Updated Location: ${b.city}, ${b.state} ${b.postalCode} ${b.country}`);
          }

          await b.save();
          console.log(`  Successfully synced ${b.name}.`);
        }
      } catch (err: any) {
        console.error(`  Failed to get details for placeId ${placeId}: ${err.message}`);
      }
    } else {
      console.log(`  Skipping ${b.name} - No Place ID to fetch authentic data from.`);
    }
  }

  console.log('\nSync Complete!');
  process.exit(0);
}

syncBusinesses().catch(console.error);
