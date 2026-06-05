# Competitor Selection Engine

## 1. Advanced Business Classification (Phase 4)

Before competitor matching, the engine classifies the target business into one of 6 Tiers to ensure realistic benchmarking. 

### Maturity Metrics Evaluated:
*   Review Count & Review Velocity
*   Average Rating
*   Service & Category Count
*   Website Authority
*   Search Visibility
*   Number of Branches
*   Monthly Lead Volume (estimated)

### The 6 Tiers
*   **Tier 1: Local Starter** (New profiles, < 20 reviews, narrow visibility)
*   **Tier 2: Local Growth** (Established local presence, 20-100 reviews)
*   **Tier 3: Regional Business** (Dominant in a specific suburb, high review velocity)
*   **Tier 4: Regional Leader** (Top rankings across multiple suburbs)
*   **Tier 5: City Leader** (Top 3 in the entire city for primary categories)
*   **Tier 6: Industry Authority** (Enterprise chains, massive visibility, highest review counts)

## 2. Smart Competitor Matching (Phase 5)

Naive competitor matching compares local businesses to national enterprises (e.g., a small tech institute vs. Simplilearn/NIIT). This engine enforces strict similarity filtering.

### Similarity Score Calculation
A prospective competitor discovered via the Places API is scored against the target business using the following weighted formula:

*   **Review Count Proximity**: 30% Weight
*   **Rating Proximity**: 20% Weight
*   **Category Match**: 20% Weight
*   **Location Radius Proximity**: 15% Weight
*   **Search Visibility Match**: 10% Weight
*   **Website Authority Match**: 5% Weight

### Inclusion Threshold
Only competitors achieving a **Similarity Score > 70%** are included in the final audit.

## 3. Competitor Search Rules

The initial geographic sweep for competitors scales dynamically based on the assigned Business Tier:

*   **Radius**: 
    *   5 km (Tier 1 & 2)
    *   10 km (Tier 3)
    *   25 km (Tier 4 & 5)
    *   50 km (Tier 6)

*   **Matching Filters**: Must share core categories/services. If a business is classified as Tier 2, the engine explicitly filters out any competitor classified as Tier 5 or Tier 6, ensuring the analysis remains realistic and actionable.
