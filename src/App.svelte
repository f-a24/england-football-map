<script lang="ts">
  import { Canvas } from '@threlte/core';
  import Scene from './lib/map/Scene.svelte';
  import LeagueFilter from './lib/ui/LeagueFilter.svelte';
  import ClubInfoPanel from './lib/ui/ClubInfoPanel.svelte';
  import ClubListFallback from './lib/ui/ClubListFallback.svelte';
  import { locale } from './lib/stores/locale.svelte';

  $effect(() => {
    document.documentElement.lang = locale.current;
  });
</script>

<main>
  <ClubListFallback />
  <LeagueFilter />
  <div class="canvas-wrap">
    <Canvas>
      <Scene />
    </Canvas>
  </div>
  <ClubInfoPanel />
  <p class="credit">
    {locale.t.creditPrefix}<a href="https://www.thesportsdb.com/" target="_blank" rel="noreferrer"
      >TheSportsDB</a
    >
  </p>
</main>

<style>
  main {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .canvas-wrap {
    position: absolute;
    inset: 0;
  }

  /* TheSportsDBの利用規約で必須の表示 */
  .credit {
    position: fixed;
    bottom: 16px;
    left: 16px;
    margin: 0;
    padding: 3px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.88);
    font-size: 11px;
    font-weight: 500;
    color: var(--color-ink-muted);
    z-index: 10;
  }

  .credit a {
    color: var(--color-ink);
  }
</style>
