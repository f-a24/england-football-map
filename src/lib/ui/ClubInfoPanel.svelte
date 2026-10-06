<script lang="ts">
  import { allClubs, mapState } from '../stores/mapState.svelte';
  import { locale } from '../stores/locale.svelte';

  const club = $derived(allClubs.find((c) => c.id === mapState.hoveredClubId));
</script>

{#if club}
  <div class="info-panel" role="status">
    <strong>{locale.clubName(club)}</strong>
    <span>{locale.stadiumName(club)}</span>
  </div>
{/if}

<style>
  .info-panel {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    /* left: 50% のままだと幅が画面の右半分に制限され、長い名前が細かく折り返される */
    width: max-content;
    max-width: calc(100vw - 32px);
    background: var(--color-paper);
    color: var(--color-ink);
    padding: 10px 22px 12px;
    border-radius: 16px;
    box-shadow: var(--panel-shadow);
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: center;
    z-index: 10;
    pointer-events: none;
  }

  strong {
    font-size: 17px;
    font-weight: 800;
    line-height: 1.3;
  }

  span {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-ink-muted);
  }

  /* 右下の「クラブ一覧」ボタンの上に出す */
  @media (max-width: 639px) {
    .info-panel {
      bottom: 72px;
    }
  }
</style>
