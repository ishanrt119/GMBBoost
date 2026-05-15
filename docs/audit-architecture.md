# AI GMB Audit Engine: Backend & Architecture

This document outlines the technical architecture for the GMB Audit Engine.

## 1. System Architecture

### API Flow
1. **Request**: Frontend sends `businessName` + `location` or `gbpUrl` to `/api/audit/run`.
2. **Scraper/API Service**: 
   - Uses **Google Business Profile API** (or a Puppeteer-based scraper if API is limited) to fetch metadata.
   - Fetches recent 50-100 reviews.
   - Captures posting history and photo counts.
3. **AI Engine (Gemini)**:
   - Processes review text for sentiment and keyword extraction.
   - Analyzes business description and services against SEO best practices.
   - Compares data with known competitor benchmarks.
4. **Scoring Service**: Calculates weighted scores for SEO, Reviews, Engagement, and Content.
5. **Response**: Returns a structured JSON containing the audit report.

## 2. Database Schema (Prisma/SQL)

### `Business`
- `id`: UUID
- `name`: String
- `placeId`: String (Unique)
- `url`: String
- `location`: Json (lat, lng, address)

### `Audit`
- `id`: UUID
- `businessId`: UUID
- `overallScore`: Integer
- `seoScore`: Integer
- `reviewScore`: Integer
- `contentScore`: Integer
- `data`: Json (Full audit report dump)
- `createdAt`: DateTime

### `Recommendation`
- `id`: UUID
- `auditId`: UUID
- `priority`: Enum (High, Medium, Low)
- `type`: String (SEO, Reviews, Photos, etc.)
- `content`: Text
- `impact`: String
- `difficulty`: String

## 3. Service Layer Structure

```typescript
// src/services/audit/
├── fetcher.ts       // Integration with Google APIs
├── analyzer.ts      // AI processing logic (Gemini/GPT)
├── scorer.ts        // Algorithmic scoring logic
├── competitor.ts    // Proximity search for competitors
└── exporter.ts      // PDF/CSV generation
```

## 4. Background Jobs
- **Scheduled Re-audits**: Weekly audits for "Growth" and "Enterprise" clients.
- **Alert Triggers**: Notifications when a score drops or a negative review is detected.
