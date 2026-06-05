export interface RankGridNode {
  nodeId: number;
  lat: number;
  lng: number;
  rank: number;
}

export interface RankGridResult {
  gridSize: string; // e.g. "3x3", "5x5", "7x7"
  averageRank: number;
  visibilityScore: number;
  shareOfVoice: number;
  nodes: RankGridNode[];
}

export interface IRankTrackingProvider {
  getRankGrid(businessName: string, keyword: string, lat: number, lng: number, radius: number, gridSize: number): Promise<RankGridResult | null>;
}

import { DataForSeoProvider } from './dataforseo';
import { SearchApiProvider } from './searchapi';

export function getRankTrackingProvider(): IRankTrackingProvider {
  if (process.env.SEARCHAPI_API_KEY) {
    return new SearchApiProvider();
  }
  return new DataForSeoProvider();
}
