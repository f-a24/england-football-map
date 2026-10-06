<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core';
  import { OrbitControls, interactivity } from '@threlte/extras';
  import * as THREE from 'three';
  import type { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
  import Terrain from './Terrain.svelte';
  import ClubMarkers from './ClubMarkers.svelte';
  import Sea from './Sea.svelte';
  import { ENGLAND_BOUNDS } from './mapTransform';

  interactivity();

  const { size } = useThrelte();

  // 正投影なので距離は見た目に影響しない。ズームアウト時に海面がnear面で切れないよう離している
  const CAMERA_OFFSET_Y = 4500;
  const CAMERA_OFFSET_Z = 3000;
  // 斜めに見下ろすため、南北方向は画面上で sin(仰角) 倍に縮む
  const GROUND_DEPTH_SCALE = CAMERA_OFFSET_Y / Math.hypot(CAMERA_OFFSET_Y, CAMERA_OFFSET_Z);
  const FIT_MARGIN = 1.15;

  // イングランド全体が収まるズーム（初期表示かつズームアウトの限界）
  const fitZoom = $derived(
    Math.min(
      $size.width / (ENGLAND_BOUNDS.width * FIT_MARGIN),
      $size.height / (ENGLAND_BOUNDS.depth * GROUND_DEPTH_SCALE * FIT_MARGIN),
    ),
  );

  let camera: THREE.OrthographicCamera | undefined = $state();
  let zoomInitialized = false;
  $effect(() => {
    const z = fitZoom;
    if (!camera || !Number.isFinite(z) || z <= 0) return;
    if (!zoomInitialized || camera.zoom < z) {
      camera.zoom = z;
      camera.updateProjectionMatrix();
      zoomInitialized = true;
    }
  });

  // 操作していない間、注視点をごく僅かに漂わせる
  let controls: OrbitControlsImpl | undefined = $state();
  let interacting = false;
  let idleTime = 0;
  let prevOffsetX = 0;
  let prevOffsetZ = 0;
  useTask((delta) => {
    if (!controls || interacting) return;
    idleTime += delta;
    const offsetX = Math.sin(idleTime * 0.15) * 14;
    const offsetZ = Math.cos(idleTime * 0.11) * 9;
    controls.target.x += offsetX - prevOffsetX;
    controls.target.z += offsetZ - prevOffsetZ;
    prevOffsetX = offsetX;
    prevOffsetZ = offsetZ;
  });

  // 注視点を範囲内に戻し、カメラも同じだけ動かして見下ろす角度を保つ
  function clampPan() {
    if (!controls) return;
    const { target, object: camera } = controls;
    const dx = THREE.MathUtils.clamp(target.x, ENGLAND_BOUNDS.minX, ENGLAND_BOUNDS.maxX) - target.x;
    const dz = THREE.MathUtils.clamp(target.z, ENGLAND_BOUNDS.minZ, ENGLAND_BOUNDS.maxZ) - target.z;
    if (dx === 0 && dz === 0) return;
    target.x += dx;
    target.z += dz;
    camera.position.x += dx;
    camera.position.z += dz;
  }
</script>

<T.OrthographicCamera
  bind:ref={camera}
  makeDefault
  position={[ENGLAND_BOUNDS.centerX, CAMERA_OFFSET_Y, ENGLAND_BOUNDS.centerZ + CAMERA_OFFSET_Z]}
  near={0.1}
  far={15000}
  oncreate={(ref) => ref.lookAt(ENGLAND_BOUNDS.centerX, 0, ENGLAND_BOUNDS.centerZ)}
>
  <!-- screenSpacePanning={false}：既定の画面基準パンでは注視点が高さ方向に動き、範囲制限をすり抜ける -->
  <OrbitControls
    bind:ref={controls}
    target={[ENGLAND_BOUNDS.centerX, 0, ENGLAND_BOUNDS.centerZ]}
    enableDamping
    enableRotate={false}
    screenSpacePanning={false}
    mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
    touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN }}
    minZoom={fitZoom}
    maxZoom={fitZoom * 4}
    onstart={() => (interacting = true)}
    onend={() => (interacting = false)}
    onchange={clampPan}
  />
</T.OrthographicCamera>

<Sea />
<Terrain />
<ClubMarkers />
