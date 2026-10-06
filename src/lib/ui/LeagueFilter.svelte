<script lang="ts">
  import { leagues } from '../data/loadSeason';
  import { mapState } from '../stores/mapState.svelte';
  import { locale } from '../stores/locale.svelte';
  import { readableTextOn } from './color';
</script>

<div class="league-filter" role="group" aria-label={locale.t.leagueFilterLabel}>
  {#each leagues as league (league.id)}
    <button
      type="button"
      class="pill-button chip"
      class:active={mapState.selectedLeagues.has(league.id)}
      style="--league-color: {league.color}; --league-on-color: {readableTextOn(league.color)}"
      aria-pressed={mapState.selectedLeagues.has(league.id)}
      onclick={() => mapState.toggleLeague(league.id)}
    >
      <!-- オン/オフを色だけでなく形（塗りつぶし／リング）でも示す -->
      <span class="dot" aria-hidden="true"></span>
      {locale.leagueLabel(league)}
    </button>
  {/each}
</div>

<style>
  .league-filter {
    position: fixed;
    top: 16px;
    left: 16px;
    right: 16px;
    display: flex;
    gap: 8px;
    z-index: 10;
    flex-wrap: wrap;
    pointer-events: none;
  }

  .chip {
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    padding: 0 16px 0 12px;
    color: var(--color-ink-muted);
    transition:
      background 0.15s,
      color 0.15s,
      transform 0.15s,
      box-shadow 0.15s;
  }

  .chip.active {
    background: var(--league-color);
    color: var(--league-on-color);
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 3px solid var(--league-color);
    flex: none;
  }

  .chip.active .dot {
    border-color: var(--league-on-color);
    background: var(--league-on-color);
  }

  @media (max-width: 639px) {
    .chip {
      min-height: 44px;
    }
  }
</style>
