import { IRankTrackingProvider, RankGridResult, RankGridNode } from './index';

export class SearchApiProvider implements IRankTrackingProvider {
  async getRankGrid(businessName: string, keyword: string, lat: number, lng: number, radius: number, gridSize: number): Promise<RankGridResult | null> {
    const apiKey = process.env.SEARCHAPI_API_KEY;
    
    if (!apiKey) {
      console.warn("Rank Tracking Not Configured: Missing SEARCHAPI_API_KEY credentials.");
      return null;
    }

    const nodesCount = gridSize * gridSize;
    const nodes: RankGridNode[] = [];
    
    // Calculate grid step size based on radius in meters.
    // 1 degree of latitude is ~111,111 meters.
    // The grid should cover an area roughly equal to 2 * radius across.
    const latStep = (radius / 111111) / (gridSize > 1 ? (gridSize - 1) : 1);
    const lngStep = latStep / Math.cos(lat * Math.PI / 180);

    const startLat = lat - (latStep * Math.floor(gridSize / 2));
    const startLng = lng - (lngStep * Math.floor(gridSize / 2));

    let totalRank = 0;
    let top3Count = 0;
    let top10Count = 0;

    const fetchNode = async (nodeId: number, nodeLat: number, nodeLng: number): Promise<RankGridNode> => {
      try {
        const url = new URL("https://www.searchapi.io/api/v1/search");
        url.searchParams.append("engine", "google_local");
        url.searchParams.append("q", keyword);
        url.searchParams.append("ll", `@${nodeLat},${nodeLng},14z`); // 14z zoom level
        url.searchParams.append("api_key", apiKey);

        const response = await fetch(url.toString());
        const data = await response.json();

        const places = data.local_results || [];
        
        // Match business by name (case insensitive)
        const normalizedTargetName = businessName.toLowerCase().trim();
        const rankIndex = places.findIndex((p: any) => p.title && p.title.toLowerCase().trim() === normalizedTargetName);
        
        // If not found in local pack, assign rank 21 (11+ category)
        const rank = rankIndex !== -1 ? rankIndex + 1 : 21;

        return {
          nodeId,
          lat: nodeLat,
          lng: nodeLng,
          rank
        };
      } catch (e) {
        console.error(`Error fetching rank grid node ${nodeId}:`, e);
        return { nodeId, lat: nodeLat, lng: nodeLng, rank: 21 }; 
      }
    };

    // Execute node fetches concurrently to speed up the grid generation
    const fetchPromises = [];
    for (let i = 0; i < nodesCount; i++) {
      const row = Math.floor(i / gridSize);
      const col = i % gridSize;
      const nodeLat = startLat + (row * latStep);
      const nodeLng = startLng + (col * lngStep);
      fetchPromises.push(fetchNode(i, nodeLat, nodeLng));
    }

    const completedNodes = await Promise.all(fetchPromises);

    for (const node of completedNodes) {
      nodes.push(node);
      totalRank += node.rank;
      if (node.rank <= 3) top3Count++;
      if (node.rank <= 10) top10Count++;
    }

    const averageRank = Number((totalRank / nodesCount).toFixed(1));
    const visibilityScore = Math.round((top3Count / nodesCount) * 100);
    const shareOfVoice = Math.round((top10Count / nodesCount) * 100);

    return {
      gridSize: `${gridSize}x${gridSize}`,
      averageRank,
      visibilityScore,
      shareOfVoice,
      nodes
    };
  }
}
