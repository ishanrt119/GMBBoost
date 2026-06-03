/**
 * auditService.ts
 *
 * Orchestrates the full audit pipeline:
 * 1. Fetch real business data from Google Places API
 * 2. Fetch real nearby competitors from Google Places Nearby Search
 * 3. Fetch real keyword rankings from SERPAPI
 * 4. Feed all real data into Groq for qualitative analysis only
 * 5. Store everything in MongoDB
 */
import dbConnect from '../../lib/mongodb';
import Audit from '../../models/Audit';
import { getGMBProvider } from '../gmb/provider';
import { generateAIAudit } from '../ai/auditEngine';
import {
  fetchNearbyCompetitors,
  fetchKeywordRankings,
  deriveRealMetrics,
} from './realDataService';

export async function processAuditJob(auditId: string) {
  await dbConnect();

  const audit = await Audit.findById(auditId);
  if (!audit) throw new Error(`Audit not found: ${auditId}`);
  if (audit.status !== 'PENDING') {
    console.log(`Audit ${auditId} is already ${audit.status}`);
    return;
  }

  try {
    // ── Step 1: Fetch real business data from Google Places ──────────────────
    const gmbProvider = getGMBProvider();
    const businessData = await gmbProvider.fetchBusinessDetails(
      audit.businessName,
      audit.location,
      audit.gbpUrl
    );

    // ── Step 2: Fetch real competitors via category+location search ─────────
    // Extract a clean city name from the full address so we search
    // "IT training institute in Kolkata" not "IT training institute in
    // 11th Floor, Room 1104, Ambuja Neotia, Sector V, Bidhan Nagar, Kolkata"
    const cityLocation = extractCity(businessData.location) || audit.location;

    let realCompetitors = await fetchNearbyCompetitors(
      businessData.primaryCategory,
      businessData.latitude,
      businessData.longitude,
      businessData.businessName,
      5000,
      businessData.description || businessData.primaryCategory,
      cityLocation
    );

    // Fallback: broaden to full location string if nothing returned
    if (realCompetitors.length === 0) {
      realCompetitors = await fetchNearbyCompetitors(
        businessData.primaryCategory,
        businessData.latitude,
        businessData.longitude,
        businessData.businessName,
        10000,
        businessData.description || businessData.primaryCategory,
        audit.location
      );
    }

    // ── Step 3: Generate AI-suggested keywords, then fetch real rankings ─────
    const serpKeywords = await generateTargetKeywords(
      businessData.businessName,
      cityLocation,
      businessData.primaryCategory,
      businessData.description
    );

    const realKeywordRankings = await fetchKeywordRankings(
      businessData.businessName,
      cityLocation,
      serpKeywords
    );

    // ── Step 4: Full AI analysis (no fabrication) ────────────────────────────
    const aiResult = await generateAIAudit(
      businessData,
      realCompetitors,
      realKeywordRankings
    );

    // ── Step 5: Derive all real metrics ──────────────────────────────────────
    const realMetrics = deriveRealMetrics(
      {
        placeId:         businessData.placeId,
        name:            businessData.businessName,
        rating:          businessData.rating,
        reviewsCount:    businessData.reviewsCount,
        address:         businessData.location,
        phone:           businessData.phone,
        website:         businessData.website,
        latitude:        businessData.latitude,
        longitude:       businessData.longitude,
        categories:      businessData.categories,
        primaryCategory: businessData.primaryCategory,
        businessHours:   businessData.businessHours,
        servicesCount:   0,
        hasPhotos:       businessData.photosCount > 0,
        photosCount:     businessData.photosCount,
        hasDescription:  businessData.hasDescription,
        description:     businessData.description,
        reviews:         businessData.reviews,
      },
      realCompetitors,
      realKeywordRankings.length > 0 ? realKeywordRankings : aiResult.keywords.map(k => ({
        keyword: k, rank: 0, source: 'estimated' as const
      })),
      aiResult.servicesCount,
      aiResult.categoriesCount
    );

    // ── Step 6: Save everything ──────────────────────────────────────────────
    const { overallScore, competitors, recommendations, keywords, servicesCount, categoriesCount, ...auditDataRest } = aiResult;

    audit.overallScore   = overallScore;
    audit.competitors    = competitors;
    audit.recommendations = recommendations;
    audit.realMetrics    = realMetrics;
    audit.auditData      = auditDataRest as any;
    audit.status         = 'COMPLETED';

    await audit.save();
    console.log(`Successfully processed audit: ${auditId}`);

  } catch (error) {
    console.error(`Failed to process audit ${auditId}:`, error);
    audit.status = 'FAILED';
    if (error instanceof Error) audit.metadata = { error: error.message };
    await audit.save();
    throw error;
  }
}

/**
 * Extracts the most meaningful city/area name from a full formatted address.
 *
 * "11th Floor, Ambuja Neotia, Sector V, Bidhan Nagar, Kolkata, West Bengal 700091, India"
 *  → "Kolkata"
 *
 * "81, Mundhwa Road, Koregaon Park Annexe, Pune, Maharashtra 411036, India"
 *  → "Pune"
 */
function extractCity(address: string): string {
  if (!address) return '';

  // Split on commas, reverse, skip country + postal code parts
  const parts = address.split(',').map(p => p.trim()).reverse();

  // Skip "India", PIN codes, state names — take first part that looks like a city
  const skipPatterns = [
    /^india$/i,
    /^\d{5,6}$/,                          // postal codes
    /^(west bengal|maharashtra|karnataka|tamil nadu|delhi|gujarat|rajasthan|kerala|telangana|andhra pradesh|uttar pradesh|bihar|punjab|haryana|madhya pradesh|odisha|jharkhand|chhattisgarh|uttarakhand|himachal pradesh|jammu|kashmir|goa|assam|manipur|meghalaya|mizoram|nagaland|sikkim|tripura|arunachal)$/i,
  ];

  for (const part of parts) {
    const cleaned = part.replace(/\s+\d+.*$/, '').trim(); // remove trailing postal
    if (skipPatterns.some(r => r.test(cleaned))) continue;
    if (cleaned.length > 2) return cleaned;
  }

  // If nothing found, just return the original
  return address.split(',').slice(-3, -1).join(',').trim();
}

/**
 * Quick helper: ask Groq for 5 target keywords for this business.
 * This is a lightweight call separate from the main audit.
 */
async function generateTargetKeywords(
  businessName: string,
  location: string,
  category: string,
  description?: string
): Promise<string[]> {
  try {
    const Groq = (await import('groq-sdk')).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const context = description
      ? `Business description: "${description}". Business category: "${category}".`
      : `Business category: "${category}".`;

    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{
        role: 'user',
        content: `You are an SEO expert. Generate exactly 5 Google search queries that potential customers in "${location}" would type to find a business like "${businessName}".

${context}

Rules:
- Each query must include the city name "${location}"
- Queries must be specific to what this business actually does
- Use natural customer language (e.g. "best digital marketing course in Kolkata")
- Return ONLY a JSON object: { "keywords": ["query1", "query2", "query3", "query4", "query5"] }
- No explanations, no extra fields`,
      }],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const content = res.choices[0].message?.content ?? '{}';
    const parsed  = JSON.parse(content);
    const arr = Array.isArray(parsed) ? parsed : (parsed.keywords ?? parsed.queries ?? Object.values(parsed)[0] ?? []);
    return (arr as string[]).slice(0, 5).map(String).filter(Boolean);
  } catch {
    return [`${category} in ${location}`];
  }
}
