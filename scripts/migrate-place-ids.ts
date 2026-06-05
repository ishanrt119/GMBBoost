import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      let key = match[1];
      let val = match[2].replace(/^["'](.*)["']$/, '$1'); // remove quotes
      process.env[key] = val;
    }
  });
}

// Minimum schema to fetch/update
const BusinessSchema = new mongoose.Schema({
  name: String,
  address: String,
  placeId: String,
  googlePlaceId: String,
  googleRating: Number,
  googleReviewCount: Number,
}, { strict: false });

const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchGooglePlace(name: string, address: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error('Missing GOOGLE_MAPS_API_KEY');

  const query = `${name} ${address || ''}`.trim();
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.append('query', query);
  url.searchParams.append('key', apiKey);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.status === 'OK' && data.results && data.results.length > 0) {
    return data.results[0]; // best match
  }
  return null;
}

async function main() {
  if (!process.env.MONGODB_URI) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const businesses = await Business.find({});
  console.log(`Found ${businesses.length} businesses. Starting migration...`);

  let migratedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const b of businesses) {
    let needsSave = false;

    // 1. Copy placeId to googlePlaceId if legacy data exists
    if (b.placeId && !b.googlePlaceId) {
      console.log(`[MIGRATE] Copied legacy placeId for: ${b.name}`);
      b.googlePlaceId = b.placeId;
      needsSave = true;
    }

    // 2. Attempt automatic recovery if no googlePlaceId at all
    if (!b.googlePlaceId) {
      console.log(`[RECOVER] Missing googlePlaceId for: ${b.name}. Searching Google...`);
      try {
        const match = await searchGooglePlace(b.name, b.address);
        if (match && match.place_id) {
          b.googlePlaceId = match.place_id;
          b.googleRating = match.rating || 0;
          b.googleReviewCount = match.user_ratings_total || 0;
          b.formattedAddress = match.formatted_address || b.address;
          b.latitude = match.geometry?.location?.lat;
          b.longitude = match.geometry?.location?.lng;
          console.log(`  -> Found match! Place ID: ${match.place_id}`);
          needsSave = true;
        } else {
          console.log(`  -> No match found.`);
        }
        await sleep(500); // Respect Google API rate limits
      } catch (e: any) {
        console.error(`  -> Failed to search: ${e.message}`);
        failedCount++;
      }
    }

    if (needsSave) {
      await b.save();
      migratedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log("\n--- Migration Complete ---");
  console.log(`Successfully migrated/recovered: ${migratedCount}`);
  console.log(`Skipped (already fine or unrecoverable): ${skippedCount}`);
  console.log(`Failed due to API errors: ${failedCount}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(console.error);
