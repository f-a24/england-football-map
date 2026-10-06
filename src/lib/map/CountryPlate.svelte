<script lang="ts">
  import { T } from '@threlte/core';
  import * as THREE from 'three';
  import { CENTER_X, CENTER_Y, LAND_Y } from './mapTransform';
  import { mapState } from '../stores/mapState.svelte';
  import { publicUrl } from '../data/publicUrl';

  let {
    url,
    color,
    layer = 0,
    seamWidth = 0,
  }: {
    url: string;
    color: string;
    /** 国境を共有する地域どうしのちらつき防止に、重ね順に応じて高さをずらす */
    layer?: number;
    /** 隣国と国境線がずれて見える隙間を、輪郭に沿った同色の帯で埋める幅 */
    seamWidth?: number;
  } = $props();

  let shapes = $state<THREE.Shape[] | null>(null);
  let seam = $state<THREE.BufferGeometry | null>(null);

  $effect(() => {
    let cancelled = false;
    fetch(publicUrl(url))
      .then((res) => res.json())
      .then((data: { polygons: [number, number][][] }) => {
        if (cancelled) return;
        const rings = data.polygons.map((ring) =>
          ring.map(([x, y]) => [x - CENTER_X, CENTER_Y - y] as [number, number]),
        );
        shapes = rings.map((ring) => {
          const s = new THREE.Shape();
          ring.forEach(([lx, ly], i) => (i === 0 ? s.moveTo(lx, ly) : s.lineTo(lx, ly)));
          return s;
        });
        seam = seamWidth > 0 ? buildSeamGeometry(rings, seamWidth) : null;
      });
    return () => {
      cancelled = true;
      seam?.dispose();
    };
  });

  // 各辺を両端へwidth/2ずつ延ばした長方形にし、延長分の重なりで角の継ぎ目を埋める
  function buildSeamGeometry(rings: [number, number][][], width: number) {
    const half = width / 2;
    const positions: number[] = [];
    for (const ring of rings) {
      for (let i = 0; i < ring.length; i++) {
        const [ax, ay] = ring[i];
        const [bx, by] = ring[(i + 1) % ring.length];
        const len = Math.hypot(bx - ax, by - ay);
        if (len === 0) continue;
        const ux = ((bx - ax) / len) * half;
        const uy = ((by - ay) / len) * half;
        const p0 = [ax - ux - uy, ay - uy + ux];
        const p1 = [ax - ux + uy, ay - uy - ux];
        const p2 = [bx + ux + uy, by + uy - ux];
        const p3 = [bx + ux - uy, by + uy + ux];
        positions.push(...p0, 0, ...p1, 0, ...p2, 0, ...p0, 0, ...p2, 0, ...p3, 0);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }
</script>

<!-- toneMapped={false}：Threlte既定のトーンマッピングで色がくすむのを防ぐ -->
<T.Group rotation={[-Math.PI / 2, 0, 0]} position={[0, LAND_Y + layer * 0.1, 0]}>
  {#if shapes}
    <T.Mesh
      onclick={() => mapState.setHovered(null)}
      onpointermissed={() => mapState.setHovered(null)}
    >
      <T.ShapeGeometry args={[shapes]} />
      <T.MeshBasicMaterial {color} side={THREE.DoubleSide} toneMapped={false} />
    </T.Mesh>
  {/if}
  {#if seam}
    <T.Mesh>
      <T is={seam} />
      <T.MeshBasicMaterial {color} side={THREE.DoubleSide} toneMapped={false} />
    </T.Mesh>
  {/if}
</T.Group>
