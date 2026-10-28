<script lang="ts">
  import type { Component } from 'svelte';
  import LeagueFilter from './lib/ui/LeagueFilter.svelte';
  import ClubInfoPanel from './lib/ui/ClubInfoPanel.svelte';
  import ClubListFallback from './lib/ui/ClubListFallback.svelte';
  import { locale } from './lib/stores/locale.svelte';

  $effect(() => {
    document.documentElement.lang = locale.current;
  });

  // 3D部分（three.js・Threlte）は別チャンクにし、DOMのUIを描画してから読み込む。
  // 初期化の重い処理で最初の描画（FCP/LCP）が遅れるのを防ぐため
  let MapCanvas = $state<Component | null>(null);
  $effect(() => {
    // requestAnimationFrame + setTimeoutで、最初のフレームが描画された後に始める
    requestAnimationFrame(() =>
      setTimeout(async () => {
        MapCanvas = (await import('./lib/map/MapCanvas.svelte')).default;
      }),
    );
  });
</script>

<main>
  <ClubListFallback />
  <LeagueFilter />
  <div class="canvas-wrap">
    {#if MapCanvas}
      <MapCanvas />
    {/if}
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
