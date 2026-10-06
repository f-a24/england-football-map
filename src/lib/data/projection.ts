/** 緯度経度 → 地図座標（UK全体を収める範囲）。clubs.jsonと海岸線データで共通。 */
export const PROJECTION = {
  latMin: 49.8,
  latMax: 59.0,
  lonMin: -8.7,
  lonMax: 2.3,
  width: 1100,
  height: 1600,
} as const;

export function toMapPosition(lat: number, lon: number): { x: number; y: number } {
  const { latMin, latMax, lonMin, lonMax, width, height } = PROJECTION;
  const x = ((lon - lonMin) / (lonMax - lonMin)) * width;
  const y = ((latMax - lat) / (latMax - latMin)) * height;
  return { x, y };
}
