# Audit Engine V2 Architecture

## 1. System Overview

The Audit Engine V2 transitions the platform from a manual reporting tool into an **Enterprise-Grade GBP Intelligence Platform**, designed to outperform tools like Grexa, BrightLocal, Local Falcon, and Uberall. It operates on a zero-input model, automatically extracting context from connected accounts to generate deep, multi-dimensional local SEO intelligence.

## 2. Zero-Input Workflow (Phase 1)

The system completely eliminates manual data entry (Business Name, Location, GBP URL).

### Execution Flow:
1.  **Trigger**: User clicks "Run Audit" in the dashboard.
2.  **Context Loading**: System automatically reads the active business context.
3.  **Authentication**: Pulls the Google Place ID and authenticated Google OAuth Connection from the Business Document.
4.  **Data Ingestion**: Fetches live data via APIs.
5.  **Analysis Execution**: Runs the intelligence engines (Scoring, Competitors, Rank Tracking, Revenue Opportunity).
6.  **Report Generation**: Generates the 14-section dashboard and PDF report.

## 3. Data Source Integration (Phase 15)

The engine orchestrates data from five primary sources:
*   **Google Business Profile API**: For profile completeness, posts, and native metrics.
*   **Google Reviews API**: For Review Intelligence analysis.
*   **Google OAuth**: Authenticated token access for deep profile insights.
*   **Rank Tracking Provider Layer**: For exact keyword and grid tracking.
*   **Internal Business Database**: Context caching and historical comparison.

## 4. Architectural Components

1.  **Audit Controller**: Orchestrates the pipeline and API calls.
2.  **Tier Classification Engine**: Evaluates business maturity (Tier 1 to 6).
3.  **Competitor Selection Engine**: Finds scale-appropriate competitors using a proprietary Similarity Score.
4.  **Scoring Engine**: Calculates the 0-100 GBP Health Score and the new Revenue Opportunity Score.
5.  **Rank Tracking Provider Layer**: An abstracted module supporting DataForSEO (preferred), SerpAPI, and ValueSERP.
6.  **Review Intelligence Engine**: AI-powered qualitative analysis of customer feedback.
7.  **AI Growth Roadmap Generator**: Produces 30/60/90-Day action plans.
8.  **Report Builder**: Compiles the data into the 14-section UI and premium PDF formats.

## 5. Audit Dashboard UI Layout (Phase 13)

The UI is structured into 14 premium dashboard sections:
1.  Executive Summary
2.  Business Snapshot
3.  GBP Health Score
4.  Competitor Intelligence
5.  Keyword Rankings
6.  Local Visibility Grid
7.  Review Intelligence
8.  Competitor Gap Analysis
9.  Keyword Gap Analysis
10. Conversion Intelligence
11. Profile Completion
12. Revenue Opportunity Score
13. Growth Roadmap
14. Industry Benchmarking
