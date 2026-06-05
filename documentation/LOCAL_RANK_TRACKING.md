# Local Rank Tracking Architecture

## 1. Rank Tracking Provider Layer (Phase 2)

**CRITICAL IMPERATIVE**: The Google Places API is insufficient for accurate local rank tracking, visibility grids, and share of voice calculations. 

We are implementing an abstracted **Rank Tracking Provider Layer** to interface with dedicated SERP APIs.
*   **Location**: `src/services/rank-tracking/`
*   **Providers Supported**: 
    1.  `dataforseo.ts` (Preferred Provider)
    2.  `serpapi.ts`
    3.  `valueserp.ts`
*   **Engine**: `rankTrackingEngine.ts` orchestrates the calls via a unified interface, allowing the platform to hot-swap providers without breaking the core application logic.

## 2. Real Local Grid Rank Tracking (Phase 3)

The system maps the geographical area around the business to simulate real user searches from different physical locations.

### Grid Generation
*   **Sizes**: 3x3 (9 nodes), 5x5 (25 nodes), 7x7 (49 nodes).
*   **Spacing**: Dynamically generated based on the business's Tier and geographic density (e.g., tight grids for NYC, wide grids for rural areas).
*   **Execution**: For every target keyword, the Rank Tracking Provider is queried using the exact GPS coordinates of each grid node.

### Return Metrics per Keyword Grid
*   **Rank at each coordinate**: Exact map position (1-20+).
*   **Visibility Score**: A composite percentage of how often the business appears in the Top 3 across the grid.
*   **Average Rank**: The mean rank across all nodes.
*   **Share of Voice (SOV)**: Percentage of the map pack dominated compared to the selected competitors.

### Visualization
The data is visualized in the dashboard and PDF as an interactive map grid overlay with color-coded nodes (Green for Top 3, Yellow for 4-10, Red for 11+), directly inspired by industry leaders like Local Falcon and Local Viking.
