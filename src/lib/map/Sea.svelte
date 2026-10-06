<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import * as THREE from 'three';

  const SIZE = 20000;

  const uniforms = {
    uTime: { value: 0 },
    uDeep: { value: new THREE.Color('#1e9bd7') },
    uShallow: { value: new THREE.Color('#38c4ea') },
  };

  const vertexShader = /* glsl */ `
    varying vec2 vWorld;
    void main() {
      vec4 world = modelMatrix * vec4(position, 1.0);
      vWorld = world.xz;
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `;

  // 波長は数十〜約300単位（長すぎると波ではなく色むらに見える）
  const fragmentShader = /* glsl */ `
    uniform float uTime;
    uniform vec3 uDeep;
    uniform vec3 uShallow;
    varying vec2 vWorld;

    void main() {
      vec2 p = vWorld;
      float t = uTime;
      float w = 0.5 * sin(p.x * 0.021 + p.y * 0.008 + t * 0.9)
              + 0.5 * sin(-p.x * 0.011 + p.y * 0.024 + t * 0.7)
              + 0.3 * sin((p.x + p.y) * 0.047 - t * 1.4);
      float crest = smoothstep(0.75, 1.15, w);
      float depth = smoothstep(500.0, 2200.0, length(p));
      vec3 color = mix(uShallow, uDeep, depth);
      color += w * 0.025 + crest * 0.05;
      gl_FragColor = vec4(color, 1.0);
      // これがないと指定色より暗く出る
      #include <colorspace_fragment>
    }
  `;

  useTask((delta) => {
    uniforms.uTime.value += delta;
  });
</script>

<T.Mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
  <T.PlaneGeometry args={[SIZE, SIZE]} />
  <T.ShaderMaterial {uniforms} {vertexShader} {fragmentShader} />
</T.Mesh>
