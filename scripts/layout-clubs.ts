// clubs.jsonのpositionを緯度経度から計算し直し、密集地域のマーカーの重なりを減らす（npm run layout-clubs）。
// 近すぎるペアの反発と元の位置への復元力を釣り合わせる。最小距離は0から徐々に広げる（位置関係の逆転を防ぐため）。
// マーカーの大きさ（ClubMarker.svelteのBASE_SCALE）を変えたらMARKER_SIZEを合わせて再実行する。
import { readFile, writeFile } from 'node:fs/promises';
import { toMapPosition } from '../src/lib/data/projection.ts';
import type { Club } from '../src/lib/data/types.ts';

const CLUBS_PATH = new URL('../src/data/clubs.json', import.meta.url);

// PC表示時のロゴの大きさ（地図座標の単位）
const MARKER_SIZE = 40;
// ロゴの端が少し重なるのは許容する
const MIN_DISTANCE = MARKER_SIZE * 0.8125;
const MAX_OFFSET = MARKER_SIZE * 2.5;
// 1回の反復で元の位置とのずれをこの割合だけ戻す。0.1〜0.2で安定した範囲の中ほど（経緯はCLAUDE.md）
const SPRING = 0.12;
const GROW_ITERATIONS = 400;
const SETTLE_ITERATIONS = 400;
// 最後に復元力を外して残った重なりを解消する反復回数の上限
const FINAL_MAX_ITERATIONS = 2000;
// 浮動小数点の誤差で収束しないのを防ぐ
const TOLERANCE = 0.01;

const clubs: Club[] = JSON.parse(await readFile(CLUBS_PATH, 'utf8'));
const origins = clubs.map((club) => toMapPosition(club.location.lat, club.location.lon));
const points = origins.map((p) => ({ ...p }));

// 距離がminDistance未満のペアを押し離し、重なりが残っていたらtrueを返す
function repel(minDistance: number) {
  let overlapping = false;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i];
      const b = points[j];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let d = Math.hypot(dx, dy);
      if (d >= minDistance - TOLERANCE) continue;
      overlapping = true;
      if (d < 1e-6) {
        // 同じ位置なら添字から決まる向きに離す（乱数を使わず結果を再現可能にする）
        const angle = (i * 2.399963) % (Math.PI * 2);
        dx = Math.cos(angle);
        dy = Math.sin(angle);
        d = 1;
      }
      const push = (minDistance - d) / 2;
      const ux = dx / d;
      const uy = dy / d;
      a.x -= ux * push;
      a.y -= uy * push;
      b.x += ux * push;
      b.y += uy * push;
    }
  }
  return overlapping;
}

function restore(spring: number) {
  points.forEach((p, i) => {
    const o = origins[i];
    p.x += (o.x - p.x) * spring;
    p.y += (o.y - p.y) * spring;
    const offset = Math.hypot(p.x - o.x, p.y - o.y);
    if (offset > MAX_OFFSET) {
      p.x = o.x + ((p.x - o.x) / offset) * MAX_OFFSET;
      p.y = o.y + ((p.y - o.y) / offset) * MAX_OFFSET;
    }
  });
}

for (let i = 0; i < GROW_ITERATIONS + SETTLE_ITERATIONS; i++) {
  const growth = Math.min(1, (i + 1) / GROW_ITERATIONS);
  repel(MIN_DISTANCE * growth);
  restore(SPRING);
}
let finalIterations = 0;
while (finalIterations < FINAL_MAX_ITERATIONS && repel(MIN_DISTANCE)) {
  restore(0);
  finalIterations++;
}

const round = (v: number) => Math.round(v * 100) / 100;
clubs.forEach((club, i) => {
  club.position = { x: round(points[i].x), y: round(points[i].y) };
});
await writeFile(CLUBS_PATH, JSON.stringify(clubs, null, 2) + '\n');

// 結果の要約
const offsets = points.map((p, i) => Math.hypot(p.x - origins[i].x, p.y - origins[i].y));
const moved = offsets.filter((d) => d > 0.5);
let remaining = 0;
let minPair = Infinity;
// 元の位置で近くにあったペアのうち、向きが90°以上変わったもの
let flipped = 0;
for (let i = 0; i < points.length; i++) {
  for (let j = i + 1; j < points.length; j++) {
    const dx = points[j].x - points[i].x;
    const dy = points[j].y - points[i].y;
    const d = Math.hypot(dx, dy);
    minPair = Math.min(minPair, d);
    if (d < MIN_DISTANCE - TOLERANCE) remaining++;
    const ox = origins[j].x - origins[i].x;
    const oy = origins[j].y - origins[i].y;
    if (Math.hypot(ox, oy) < MIN_DISTANCE * 2 && dx * ox + dy * oy < 0) flipped++;
  }
}
console.log(`仕上げの反復回数: ${finalIterations}（上限 ${FINAL_MAX_ITERATIONS}）`);
console.log(
  `最小距離 ${MIN_DISTANCE} 未満のペア: ${remaining}（最も近いペア ${minPair.toFixed(2)}）`,
);
console.log(
  `移動したクラブ: ${moved.length} / ${clubs.length}` +
    `（平均 ${(moved.reduce((s, d) => s + d, 0) / Math.max(moved.length, 1)).toFixed(1)}、` +
    `最大 ${Math.max(...offsets).toFixed(1)}、上限 ${MAX_OFFSET}）`,
);
console.log(`元の位置で近くにあったペアのうち、向きが逆転したもの: ${flipped}`);
