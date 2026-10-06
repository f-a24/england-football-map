import * as THREE from 'three';

// 白い円を種類ごとに1枚だけ作り、全マーカーで共有してSpriteMaterial.colorで着色する
const cache = new Map<number, THREE.Texture>();

// solidUntil: この半径の割合までは不透明で、外周に向けて透明になる
function createCircleTexture(solidUntil: number): THREE.Texture {
  const cached = cache.get(solidUntil);
  if (cached) return cached;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const center = size / 2;

  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(solidUntil, 'rgba(255,255,255,1)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(center, center, center, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  cache.set(solidUntil, texture);
  return texture;
}

/** 縁がやわらかく滲む円（ホバー時の発光用） */
export function getHaloTexture(): THREE.Texture {
  return createCircleTexture(0.78);
}

/** 縁のくっきりした円（縁取り・白地用） */
export function getDiscTexture(): THREE.Texture {
  return createCircleTexture(0.94);
}
