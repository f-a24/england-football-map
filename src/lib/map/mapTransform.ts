import { PROJECTION, toMapPosition } from '../data/projection';

export const LAND_Y = 0;

export const CENTER_X = PROJECTION.width / 2;
export const CENTER_Y = PROJECTION.height / 2;

/**
 * 地図座標(x, y)をワールド座標のX/Zに変換する（北ほどZが負で、画面上は北が上になる）。
 * 符号を変える場合はCountryPlate.svelteのShape構築も一緒に直すこと。
 */
export function toWorldXZ(x: number, y: number): [number, number] {
  return [x - CENTER_X, y - CENTER_Y];
}

/** イングランド本土のおおよその範囲。パン範囲とズームアウト限界の計算に使う。 */
export const ENGLAND_BOUNDS = (() => {
  const northWest = toMapPosition(55.8, -5.7);
  const southEast = toMapPosition(50.0, 1.8);
  const [minX, minZ] = toWorldXZ(northWest.x, northWest.y);
  const [maxX, maxZ] = toWorldXZ(southEast.x, southEast.y);
  return {
    minX,
    maxX,
    minZ,
    maxZ,
    centerX: (minX + maxX) / 2,
    centerZ: (minZ + maxZ) / 2,
    width: maxX - minX,
    depth: maxZ - minZ,
  };
})();
