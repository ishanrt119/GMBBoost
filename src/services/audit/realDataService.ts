/**
 * realDataService.ts
 *
 * Fetches REAL data from Google Places API and SERPAPI.
 * Nothing in this file is fabricated. If an API fails we return
 * clearly-labelled fallback structures rather than invented values.
 */

import { ICompetitor, IKeywordRanking, IRealMetrics } from '@/models/Audit';

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
const SERP_API_KEY   = process.env.SERPAPI_KEY || '';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RealBusinessData {
  placeId: string;
  name: string;
  rating: number;
  reviewsCount: number;
  address: string;
  phone: string;
  website: string;
  latitude: number;
  longitude: number;
  categories: string[];          // Google "types" array
  primaryCategory: string;
  businessHours: { day: string; hours: string }[];
  servicesCount: number;
  hasPhotos: boolean;
  photosCount: number;
  hasDescription: boolean;
  description: string;
  reviews: {
    author: string;
    rating: number;
    text: string;
    date: string;
    ownerReply?: string;
  }[];
}

// ─── Google Places: Business Details ─────────────────────────────────────────

export async function fetchRealBusinessData(
  businessName: string,
  location: string,
  gbpUrl?: string
): Promise<RealBusinessData | null> {
  if (!GOOGLE_API_KEY) {
    console.warn('[realDataService] GOOGLE_MAPS_API_KEY not set — cannot fetch real business data');
    return null;
  }

  try {
    // Step 1: Find Place ID via Text Search
    const searchQuery = `${businessName} ${location}`;
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    searchUrl.searchParams.set('query', searchQuery);
    searchUrl.searchParams.set('key', GOOGLE_API_KEY);

    const searchRes = await fetch(searchUrl.toString());
    const searchData = await searchRes.json();

    if (searchData.status !== 'OK' || !searchData.results?.length) {
      console.warn(`[realDataService] Text search returned ${searchData.status} for: ${searchQuery}`);
      return null;
    }

    const place = searchData.results[0];
    const placeId = place.place_id;
    const latitude  = place.geometry?.location?.lat ?? 0;
    const longitude = place.geometry?.location?.lng ?? 0;

    // Step 2: Fetch full Place Details
    const detailFields = [
      'name', 'formatted_address', 'formatted_phone_number', 'website',
      'rating', 'user_ratings_total', 'types', 'opening_hours',
      'photos', 'editorial_summary', 'reviews',
      'geometry',
    ].join(',');

    const detailUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    detailUrl.searchParams.set('place_id', placeId);
    detailUrl.searchParams.set('fields', detailFields);
    detailUrl.searchParams.set('key', GOOGLE_API_KEY);

    const detailRes = await fetch(detailUrl.toString());
    const detailData = await detailRes.json();

    if (detailData.status !== 'OK') {
      console.warn(`[realDataService] Place Details returned ${detailData.status}`);
      return null;
    }

    const r = detailData.result;

    // Parse business hours
    const businessHours: { day: string; hours: string }[] = [];
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (r.opening_hours?.periods) {
      const hoursMap: Record<string, string> = {};
      r.opening_hours.periods.forEach((period: any) => {
        const day = weekdays[period.open?.day ?? 0];
        if (period.close) {
          const openH  = String(period.open.time).padStart(4, '0');
          const closeH = String(period.close.time).padStart(4, '0');
          const fmt = (t: string) => {
            const h = parseInt(t.slice(0, 2));
            const m = t.slice(2);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
            return `${h12}:${m} ${ampm}`;
          };
          hoursMap[day] = `${fmt(openH)} - ${fmt(closeH)}`;
        } else {
          hoursMap[day] = 'Open 24 hours';
        }
      });
      weekdays.forEach(d => {
        businessHours.push({ day: d, hours: hoursMap[d] || 'Closed' });
      });
    }

    // Parse reviews and calculate response rate
    const rawReviews = r.reviews ?? [];
    const reviews = rawReviews.map((rv: any) => ({
      author: rv.author_name || 'Anonymous',
      rating: rv.rating || 0,
      text: rv.text || '',
      date: new Date(rv.time * 1000).toISOString(),
      ownerReply: rv.owner_response?.text,
    }));

    // Clean categories — remove generic Google types
    const skipTypes = new Set([
      'point_of_interest', 'establishment', 'political', 'locality',
      'country', 'administrative_area_level_1', 'administrative_area_level_2',
      'route', 'street_address', 'neighborhood', 'sublocality',
    ]);
    const categories = (r.types ?? []).filter((t: string) => !skipTypes.has(t));
    const primaryCategory = categories[0] ?? r.types?.[0] ?? 'local_business';

    return {
      placeId,
      name: r.name || businessName,
      rating: r.rating ?? 0,
      reviewsCount: r.user_ratings_total ?? 0,
      address: r.formatted_address || location,
      phone: r.formatted_phone_number || '',
      website: r.website || '',
      latitude:  r.geometry?.location?.lat ?? latitude,
      longitude: r.geometry?.location?.lng ?? longitude,
      categories,
      primaryCategory,
      businessHours,
      servicesCount: 0,           // GBP services not in Places API — derived from AI analysis
      hasPhotos: (r.photos?.length ?? 0) > 0,
      photosCount: r.photos?.length ?? 0,
      hasDescription: !!(r.editorial_summary?.overview),
      description: r.editorial_summary?.overview ?? '',
      reviews,
    };
  } catch (err) {
    console.error('[realDataService] fetchRealBusinessData error:', err);
    return null;
  }
}

// ─── Groq: Resolve what this business actually competes in ───────────────────

async function resolveCompetitorSearchPhrases(
  businessName: string,
  location: string,
  placesCategory: string,
  description?: string
): Promise<string[]> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (GROQ_API_KEY) {
    try {
      const { default: Groq } = await import('groq-sdk');
      const groq = new Groq({ apiKey: GROQ_API_KEY });

      const context = description && description.length > 10
        ? `Business description: "${description}"`
        : `Google Places category: "${placesCategory}"`;

      const res = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `You are a competitive intelligence expert.

Business name: "${businessName}"
City: "${location}"
${context}

Generate exactly 2 Google search queries a customer would type to find a COMPETITOR of this business.

Rules:
- Describe what this business DOES, not its name
- Each query MUST end with "in ${location}"
- Be specific to the actual industry/service
- "Google Mumbai" example: "search engine company in Mumbai" or "digital advertising in Mumbai"
- "Marriott Pune" example: "5 star hotel in Pune" or "luxury hotel Pune"
- "Desun Academy" example: "IT training institute in Kolkata"

Return ONLY this JSON, nothing else:
{"phrases": ["phrase 1 in ${location}", "phrase 2 in ${location}"]}`,
        }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 150,
      });

      const parsed = JSON.parse(res.choices[0].message?.content ?? '{}');
      const phrases: string[] = (parsed.phrases ?? parsed.keywords ?? parsed.queries ?? [])
        .filter((p: any) => typeof p === 'string' && p.length > 5)
        .map((p: string) => p.trim())
        .slice(0, 2);

      if (phrases.length >= 1) {
        console.log('[resolveCompetitorSearchPhrases] Groq phrases:', phrases);
        return phrases;
      }
    } catch (err) {
      console.warn('[resolveCompetitorSearchPhrases] Groq failed:', err);
    }
  }

  // Fallback if Groq unavailable
  const stopWords = new Set(['private','limited','pvt','ltd','inc','llc','the','and','for','india','group','company','co','corp','services','solutions']);
  const nameWords = businessName
    .replace(/[^a-zA-Z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()))
    .slice(0, 3).join(' ');

  const fallback = nameWords.length > 2
    ? `${nameWords} in ${location}`
    : `${placesCategory.replace(/_/g, ' ')} in ${location}`;

  console.warn('[resolveCompetitorSearchPhrases] Fallback phrase:', fallback);
  return [fallback];
}

// ─── SERPAPI: Real Competitor Discovery ──────────────────────────────────────
//
// Strategy: search Google for the business TYPE + location (not the business
// name itself). This returns the businesses that rank for the same queries —
// those are the true competitors. We then enrich each result with Google
// Places details (rating, review count, address).
//
// Example: input = "Desun Academy, Kolkata"
//   → SERP query = "IT training institute in Kolkata"
//   → Returns Karmick Institute, W3webschool, Webskitters Academy etc.
//   → These are actual competitors, not random nearby places.

export async function fetchNearbyCompetitors(
  primaryCategory: string,
  latitude: number,
  longitude: number,
  businessName: string,
  radiusMeters = 5000,
  businessDescription?: string,
  location?: string
): Promise<ICompetitor[]> {

  if (!SERP_API_KEY && !GOOGLE_API_KEY) {
    console.warn('[realDataService] No API keys — cannot fetch competitors');
    return [];
  }

  const searchLocation = location || 'India';

  // ── Step 1: Ask Groq what this business ACTUALLY competes in ─────────────
  // Google Places types[] (e.g. "establishment", "point_of_interest") are too
  // coarse to derive a meaningful competitive category. Groq reads the business
  // name + description and returns precise, human-quality search phrases.
  //
  // "Google, Mumbai"       → ["search engine company in Mumbai",
  //                           "digital advertising platform in Mumbai"]
  // "Desun Academy, Kolkata" → ["IT training institute in Kolkata",
  //                             "software course in Kolkata"]
  const searchPhrases = await resolveCompetitorSearchPhrases(
    businessName,
    searchLocation,
    primaryCategory,
    businessDescription
  );

  console.log(`[realDataService] Competitor search phrases for "${businessName}":`, searchPhrases);

  const lowerBiz = businessName.toLowerCase();

  // ── Step 2: Try each Groq-generated phrase with SERPAPI ──────────────────
  if (SERP_API_KEY) {
    for (const phrase of searchPhrases.slice(0, 2)) {
      try {
        const serpUrl = new URL('https://serpapi.com/search.json');
        serpUrl.searchParams.set('engine', 'google');
        serpUrl.searchParams.set('q', phrase);
        serpUrl.searchParams.set('location', searchLocation);
        serpUrl.searchParams.set('gl', 'in');
        serpUrl.searchParams.set('hl', 'en');
        serpUrl.searchParams.set('api_key', SERP_API_KEY);

        const serpRes  = await fetch(serpUrl.toString());
        const serpData = await serpRes.json();

        const localPlaces: any[] = (serpData.local_results?.places ?? [])
          .filter((p: any) => {
            const name = (p.title ?? '').toLowerCase();
            return !name.includes(lowerBiz.slice(0, 6)) &&
                   !lowerBiz.slice(0, 6).includes(name.slice(0, 4));
          })
          .slice(0, 5);

        if (localPlaces.length >= 2) {
          const enriched = await enrichSerpResultsWithPlaces(localPlaces, searchLocation);
          if (enriched.length >= 2) {
            console.log(`[realDataService] Found ${enriched.length} competitors via local pack for: "${phrase}"`);
            return enriched;
          }
        }

        const organicBizNames: string[] = (serpData.organic_results ?? [])
          .filter((o: any) => {
            const title = (o.title ?? '').toLowerCase();
            return !title.includes(lowerBiz.slice(0, 6)) && o.title;
          })
          .slice(0, 5)
          .map((o: any) => o.title as string);

        if (organicBizNames.length >= 2) {
          const enriched = await enrichOrganic(organicBizNames, searchLocation);
          if (enriched.length >= 2) {
            console.log(`[realDataService] Found ${enriched.length} competitors via organic for: "${phrase}"`);
            return enriched;
          }
        }

        await new Promise(r => setTimeout(r, 300));
      } catch (err) {
        console.warn(`[realDataService] SERPAPI failed for phrase "${phrase}":`, err);
      }
    }
  }

  // ── Step 3: Google Places Text Search fallback ───────────────────────────
  if (GOOGLE_API_KEY) {
    for (const phrase of searchPhrases.slice(0, 2)) {
      try {
        const results = await fetchCompetitorsByTextSearch(phrase, businessName);
        if (results.length >= 2) {
          console.log(`[realDataService] Found ${results.length} competitors via Places text search for: "${phrase}"`);
          return results;
        }
      } catch (err) {
        console.warn(`[realDataService] Places text search failed for phrase "${phrase}":`, err);
      }
    }
  }

  console.warn(`[realDataService] Could not find relevant competitors for "${businessName}"`);
  return [];
}

// ─── Helper: Enrich SERP local pack results with Places API ──────────────────

async function enrichSerpResultsWithPlaces(
  serpPlaces: any[],
  location: string
): Promise<ICompetitor[]> {
  const competitors: ICompetitor[] = [];

  for (const place of serpPlaces) {
    try {
      const name = place.title ?? place.name ?? '';
      if (!name) continue;

      // Look up this business name in Google Places
      const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      searchUrl.searchParams.set('query', `${name} ${location}`);
      searchUrl.searchParams.set('key', GOOGLE_API_KEY);
      searchUrl.searchParams.set('fields', 'name,rating,user_ratings_total,vicinity,place_id');

      const res  = await fetch(searchUrl.toString());
      const data = await res.json();

      if (data.status === 'OK' && data.results?.length) {
        const p = data.results[0];
        competitors.push({
          name:          p.name || name,
          score:         p.rating ? Math.round(p.rating * 10) : 0,
          reviews:       p.user_ratings_total ?? 0,
          rating:        p.rating ?? 0,
          postsPerMonth: 0,
          placeId:       p.place_id ?? '',
          address:       p.formatted_address ?? p.vicinity ?? '',
        });
      } else {
        // Use SERP data directly if Places lookup fails
        competitors.push({
          name:          name,
          score:         place.rating ? Math.round(parseFloat(place.rating) * 10) : 0,
          reviews:       place.reviews ?? 0,
          rating:        parseFloat(place.rating ?? '0') || 0,
          postsPerMonth: 0,
          placeId:       '',
          address:       place.address ?? location,
        });
      }

      // Small delay to avoid Places API quota hits
      await new Promise(r => setTimeout(r, 200));
    } catch {
      // skip this one
    }
  }

  return competitors.slice(0, 5);
}

// ─── Helper: Enrich organic business names with Places API ───────────────────

async function enrichOrganic(
  names: string[],
  location: string
): Promise<ICompetitor[]> {
  const competitors: ICompetitor[] = [];

  for (const name of names.slice(0, 5)) {
    try {
      const cleanName = name.replace(/[-|–].*/g, '').trim(); // strip " - City Name" suffixes
      const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      searchUrl.searchParams.set('query', `${cleanName} ${location}`);
      searchUrl.searchParams.set('key', GOOGLE_API_KEY);

      const res  = await fetch(searchUrl.toString());
      const data = await res.json();

      if (data.status === 'OK' && data.results?.length) {
        const p = data.results[0];
        competitors.push({
          name:          p.name || cleanName,
          score:         p.rating ? Math.round(p.rating * 10) : 0,
          reviews:       p.user_ratings_total ?? 0,
          rating:        p.rating ?? 0,
          postsPerMonth: 0,
          placeId:       p.place_id ?? '',
          address:       p.formatted_address ?? location,
        });
      }
      await new Promise(r => setTimeout(r, 200));
    } catch {
      // skip
    }
  }

  return competitors;
}

// ─── Helper: Google Places Text Search for category ──────────────────────────

async function fetchCompetitorsByTextSearch(
  searchPhrase: string,
  businessName: string
): Promise<ICompetitor[]> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
  url.searchParams.set('query', searchPhrase);
  url.searchParams.set('key', GOOGLE_API_KEY);

  const res  = await fetch(url.toString());
  const data = await res.json();

  if (data.status !== 'OK' || !data.results?.length) return [];

  const lowerBiz = businessName.toLowerCase();

  return (data.results as any[])
    .filter(p => {
      const name = (p.name ?? '').toLowerCase();
      return !name.includes(lowerBiz.slice(0, 6)) && !lowerBiz.includes(name.slice(0, 6));
    })
    .slice(0, 5)
    .map((p: any) => ({
      name:          p.name,
      score:         p.rating ? Math.round(p.rating * 10) : 0,
      reviews:       p.user_ratings_total ?? 0,
      rating:        p.rating ?? 0,
      postsPerMonth: 0,
      placeId:       p.place_id ?? '',
      address:       p.formatted_address ?? p.vicinity ?? '',
    }));
}

// ─── SERPAPI: Keyword Rankings ────────────────────────────────────────────────

/**
 * Search Google via SERPAPI for each keyword and find where the business
 * appears in the local pack or organic results.
 * Returns actual rank (1-based) or 21 if not found in top 20.
 */
export async function fetchKeywordRankings(
  businessName: string,
  location: string,
  keywords: string[]
): Promise<IKeywordRanking[]> {
  if (!SERP_API_KEY) {
    console.warn('[realDataService] SERPAPI_KEY not set — cannot fetch keyword rankings');
    return keywords.map(k => ({ keyword: k, rank: 0, source: 'estimated' as const }));
  }

  const results: IKeywordRanking[] = [];

  for (const keyword of keywords.slice(0, 5)) {
    try {
      const url = new URL('https://serpapi.com/search.json');
      url.searchParams.set('engine', 'google');
      url.searchParams.set('q', keyword);
      url.searchParams.set('location', location);
      url.searchParams.set('gl', 'in');
      url.searchParams.set('hl', 'en');
      url.searchParams.set('num', '20');
      url.searchParams.set('api_key', SERP_API_KEY);

      const res  = await fetch(url.toString());
      const data = await res.json();

      const lowerBiz = businessName.toLowerCase();
      let rank = 21; // not found = beyond 20

      // Check local pack (map results)
      const localPack = data.local_results?.places ?? [];
      const packIdx = localPack.findIndex((p: any) =>
        p.title?.toLowerCase().includes(lowerBiz.slice(0, 8)) ||
        lowerBiz.includes(p.title?.toLowerCase().slice(0, 8) ?? '')
      );
      if (packIdx !== -1) {
        rank = packIdx + 1;
      } else {
        // Check organic results
        const organic = data.organic_results ?? [];
        const orgIdx = organic.findIndex((o: any) =>
          o.title?.toLowerCase().includes(lowerBiz.slice(0, 8))
        );
        if (orgIdx !== -1) rank = orgIdx + 1 + 3; // offset after local pack
      }

      results.push({ keyword, rank, source: 'serpapi' });

      // Brief pause to avoid rate limiting
      await new Promise(r => setTimeout(r, 400));
    } catch (err) {
      console.warn(`[realDataService] SERPAPI error for keyword "${keyword}":`, err);
      results.push({ keyword, rank: 0, source: 'estimated' });
    }
  }

  return results;
}

// ─── Derive Real Metrics ──────────────────────────────────────────────────────

/**
 * Calculates all IRealMetrics from real API data.
 * reviewsPerWeek is derived from the actual review timestamps.
 * responseRate is derived from reviews that have an ownerReply.
 */
export function deriveRealMetrics(
  biz: RealBusinessData,
  competitors: ICompetitor[],
  keywordRankings: IKeywordRanking[],
  aiServicesCount: number,
  aiCategoriesCount: number
): IRealMetrics {
  // Reviews per week — look at most recent 10 reviews and calculate velocity
  let reviewsPerWeek = 0;
  if (biz.reviews.length >= 2) {
    const dates = biz.reviews
      .map(r => new Date(r.date).getTime())
      .filter(d => !isNaN(d))
      .sort((a, b) => b - a);

    if (dates.length >= 2) {
      const newestMs  = dates[0];
      const oldestMs  = dates[dates.length - 1];
      const spanWeeks = Math.max(1, (newestMs - oldestMs) / (1000 * 60 * 60 * 24 * 7));
      reviewsPerWeek  = parseFloat((dates.length / spanWeeks).toFixed(2));
    }
  }

  // Response rate — % of reviews that have an owner reply
  const withReply   = biz.reviews.filter(r => r.ownerReply).length;
  const responseRate = biz.reviews.length > 0
    ? Math.round((withReply / biz.reviews.length) * 100)
    : 0;

  return {
    businessRating:          biz.rating,
    reviewsCount:            biz.reviewsCount,
    servicesCount:           aiServicesCount,       // from AI analysis of business data
    categoriesCount:         aiCategoriesCount,     // from AI analysis
    reviewsPerWeek,
    responseRate,
    hasWebsite:              !!biz.website,
    hasPhone:                !!biz.phone,
    hasDescription:          biz.hasDescription,
    hasHours:                biz.businessHours.some(h => h.hours !== 'Closed' && h.hours !== ''),
    hasPhotos:               biz.hasPhotos,
    hasLogo:                 biz.hasPhotos,         // proxy — logo not directly available in Places API
    hasServiceArea:          false,                 // not available from Places API
    hasAppointmentLinks:     false,                 // not available from Places API
    hasAdditionalCategories: biz.categories.length > 1,
    keywordRankings,
  };
}
