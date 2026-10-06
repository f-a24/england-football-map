<script lang="ts">
  import { allClubs, mapState } from '../stores/mapState.svelte';
  import { toWorldXZ, LAND_Y } from './mapTransform';
  import ClubMarker from './ClubMarker.svelte';

  const clubs = $derived(allClubs.filter((c) => mapState.selectedLeagues.has(c.league.id)));

  // 南（画面手前）のクラブほど上に重ねる
  const stackOrder = new Map(
    allClubs.toSorted((a, b) => a.position.y - b.position.y).map((club, i) => [club.id, i]),
  );
</script>

{#each clubs as club (club.id)}
  {@const [wx, wz] = toWorldXZ(club.position.x, club.position.y)}
  <ClubMarker
    {club}
    worldX={wx}
    worldY={LAND_Y + 6}
    worldZ={wz}
    stackOrder={stackOrder.get(club.id) ?? 0}
  />
{/each}
