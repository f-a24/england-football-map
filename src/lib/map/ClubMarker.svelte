<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import * as THREE from 'three';
  import type { IntersectionEvent } from '@threlte/extras';
  import { mapState } from '../stores/mapState.svelte';
  import { viewport } from '../stores/viewport.svelte';
  import { INK } from '../ui/color';
  import { getDiscTexture, getHaloTexture } from './haloTexture';
  import { isMostlyLight } from './logoTone';
  import type { ClubInSeason } from '../data/types';

  let {
    club,
    worldX,
    worldY,
    worldZ,
    stackOrder,
  }: {
    club: ClubInSeason;
    worldX: number;
    worldY: number;
    worldZ: number;
    stackOrder: number;
  } = $props();

  // scripts/layout-clubs.tsのMARKER_SIZEと揃える
  const BASE_SCALE = $derived(viewport.isMobile ? 52 : 40);

  let texture = $state<THREE.Texture | null>(null);
  let discColor = $state('#ffffff');
  $effect(() => {
    let disposed = false;
    new THREE.TextureLoader().load(club.logo, (tex) => {
      if (disposed) return;
      // 指定しないとリニア扱いになり白っぽく褪せる
      tex.colorSpace = THREE.SRGBColorSpace;
      // 白一色のロゴは白地に溶けるため、背後の円を濃紺にする
      discColor = isMostlyLight(tex.image) ? INK : '#ffffff';
      texture = tex;
    });
    return () => {
      disposed = true;
    };
  });

  const isHovered = $derived(mapState.hoveredClubId === club.id);
  const isDimmed = $derived(mapState.hoveredClubId !== null && !isHovered);

  let hoverT = $state(0);
  let dimT = $state(0);
  useTask((delta) => {
    const speed = Math.min(1, delta * 10);
    hoverT += ((isHovered ? 1 : 0) - hoverT) * speed;
    dimT += ((isDimmed ? 1 : 0) - dimT) * speed;
  });

  const scale = $derived(BASE_SCALE * (1 + hoverT * 0.4));
  const glowScale = $derived(scale * (1.7 + hoverT * 0.9));
  const lift = $derived(hoverT * 15);
  const fade = $derived(1 - dimT * 0.75);
  const haloTexture = getHaloTexture();
  const discTexture = getDiscTexture();

  // 縁取り・白地・ロゴをマーカー単位で重ねる（層ごとにまとめると隣の白地が縁取りを隠す）
  const MARKER_LAYERS = 3;
  const HOVERED_STACK = 100_000;
  const stackBase = $derived(1 + (isHovered ? HOVERED_STACK : stackOrder) * MARKER_LAYERS);
</script>

<!-- toneMapped={false}：Threlte既定のトーンマッピングで色がくすむのを防ぐ -->
{#if texture}
  <T.Sprite
    position={[worldX, worldY + lift - 0.2, worldZ]}
    scale={[glowScale, glowScale, 1]}
    renderOrder={0}
  >
    <T.SpriteMaterial
      map={haloTexture}
      color={club.league.color}
      blending={THREE.AdditiveBlending}
      depthTest={false}
      opacity={hoverT * 0.8 * fade}
      toneMapped={false}
    />
  </T.Sprite>

  <T.Sprite
    position={[worldX, worldY + lift - 0.1, worldZ]}
    scale={[scale * 1.38, scale * 1.38, 1]}
    renderOrder={stackBase}
  >
    <T.SpriteMaterial
      map={discTexture}
      color={club.league.color}
      transparent
      depthTest={false}
      opacity={fade}
      toneMapped={false}
    />
  </T.Sprite>
  <T.Sprite
    position={[worldX, worldY + lift - 0.05, worldZ]}
    scale={[scale * 1.18, scale * 1.18, 1]}
    renderOrder={stackBase + 1}
  >
    <T.SpriteMaterial
      map={discTexture}
      color={discColor}
      transparent
      depthTest={false}
      opacity={fade}
      toneMapped={false}
    />
  </T.Sprite>
  <T.Sprite
    position={[worldX, worldY + lift, worldZ]}
    scale={[scale, scale, 1]}
    renderOrder={stackBase + 2}
    onpointerenter={() => mapState.setHovered(club.id)}
    onpointerleave={() => mapState.setHovered(null)}
    onclick={(e: IntersectionEvent<MouseEvent>) => {
      e.stopPropagation();
      mapState.setHovered(club.id);
    }}
  >
    <T.SpriteMaterial
      map={texture}
      transparent
      depthTest={false}
      opacity={fade}
      toneMapped={false}
    />
  </T.Sprite>
{/if}
