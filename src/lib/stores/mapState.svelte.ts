import { SvelteSet } from 'svelte/reactivity';
import { leagues, loadSeason } from '../data/loadSeason';

export const allClubs = loadSeason('2026-27');

function createMapState() {
  const selectedLeagues = new SvelteSet<string>(leagues.map((l) => l.id));
  let hoveredClubId = $state<string | null>(null);

  return {
    get selectedLeagues(): ReadonlySet<string> {
      return selectedLeagues;
    },
    get hoveredClubId() {
      return hoveredClubId;
    },
    setHovered(id: string | null) {
      hoveredClubId = id;
    },
    toggleLeague(id: string) {
      if (selectedLeagues.has(id)) selectedLeagues.delete(id);
      else selectedLeagues.add(id);
    },
  };
}

export const mapState = createMapState();
