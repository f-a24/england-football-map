<script lang="ts">
  import { leagues } from '../data/loadSeason';
  import { allClubs, mapState } from '../stores/mapState.svelte';
  import { locale } from '../stores/locale.svelte';

  const groups = $derived(
    leagues
      .filter((league) => mapState.selectedLeagues.has(league.id))
      .map((league) => ({
        league,
        clubs: allClubs.filter((c) => c.league.id === league.id),
      })),
  );

  let listOpen = $state(false);
  // クリック確定時のblur()で直後にonblurのクリアが走らないよう、その間だけ抑制する
  let committing = false;
</script>

<button
  type="button"
  class="pill-button list-toggle"
  aria-expanded={listOpen}
  onclick={() => (listOpen = !listOpen)}
>
  {listOpen ? locale.t.backToMap : locale.t.clubList}
</button>

<!-- WebGL上のマーカーの代替（キーボード・スクリーンリーダー・タップしにくい密集地域用）。フォーカスかボタンで開く -->
<nav aria-label={locale.t.clubList} class="club-list-fallback" class:open={listOpen}>
  {#each groups as { league, clubs } (league.id)}
    <section aria-labelledby="league-{league.id}">
      <h2 id="league-{league.id}" style="--league-color: {league.color}">
        {locale.leagueName(league)}
      </h2>
      <ul>
        {#each clubs as club (club.id)}
          <li>
            <button
              type="button"
              onfocus={() => mapState.setHovered(club.id)}
              onblur={() => {
                if (!committing) mapState.setHovered(null);
              }}
              onclick={(e: MouseEvent) => {
                committing = true;
                mapState.setHovered(club.id);
                listOpen = false;
                (e.currentTarget as HTMLElement).blur();
                requestAnimationFrame(() => {
                  committing = false;
                });
              }}
            >
              <img src={club.logo} alt="" width="28" height="28" loading="lazy" />
              <span class="text">
                <span class="name">{locale.clubName(club)}</span>
                <span class="stadium">{locale.stadiumName(club)}</span>
                <!-- Tabで行だけを移動する場合にも所属リーグが伝わるように -->
                <span class="visually-hidden">{locale.leagueName(league)}</span>
              </span>
            </button>
          </li>
        {/each}
      </ul>
    </section>
  {/each}
</nav>

<style>
  .list-toggle {
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 21;
    min-height: 40px;
    padding: 0 18px;
    color: var(--color-ink);
  }

  @media (max-width: 639px) {
    .list-toggle {
      min-height: 44px;
    }
  }

  .club-list-fallback,
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  /* スマホはボトムシート、PCは左側のパネル */
  .club-list-fallback.open,
  .club-list-fallback:focus-within {
    position: fixed;
    left: 16px;
    right: 16px;
    bottom: 72px;
    width: auto;
    height: auto;
    max-height: calc(100dvh - 200px);
    overflow-y: auto;
    overscroll-behavior: contain;
    clip: auto;
    white-space: normal;
    background: var(--color-paper);
    border-radius: 16px;
    box-shadow: var(--panel-shadow);
    padding: 0 8px 8px;
    z-index: 20;
    scrollbar-width: thin;
    scrollbar-color: #b8c7d3 transparent;
  }

  @media (min-width: 640px) {
    .club-list-fallback.open,
    .club-list-fallback:focus-within {
      top: 70px;
      right: auto;
      width: 300px;
      max-height: none;
    }
  }

  h2 {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    padding: 14px 8px 8px;
    background: var(--color-paper);
    color: var(--color-ink);
    font-size: 13px;
    font-weight: 800;
  }

  h2::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--league-color);
    flex: none;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .club-list-fallback button {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    color: var(--color-ink);
    padding: 6px 8px;
    cursor: pointer;
    border-radius: 10px;
  }

  .club-list-fallback button:hover {
    background: var(--color-tint);
  }

  .club-list-fallback button:focus-visible {
    outline-offset: -3px;
  }

  img {
    object-fit: contain;
    flex: none;
  }

  .text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .name {
    font-size: 14px;
    font-weight: 700;
    line-height: 1.35;
  }

  .stadium {
    font-size: 12px;
    font-weight: 500;
    line-height: 1.4;
    color: var(--color-ink-muted);
  }
</style>
