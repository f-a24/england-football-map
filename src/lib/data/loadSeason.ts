import leaguesData from '../../data/leagues.json';
import clubsData from '../../data/clubs.json';
import { publicUrl } from './publicUrl';
import type { Club, ClubInSeason, League, Season } from './types';

export const leagues = (leaguesData as League[]).toSorted((a, b) => a.order - b.order);
const clubs = (clubsData as Club[]).map((club) => ({ ...club, logo: publicUrl(club.logo) }));

const seasonModules = import.meta.glob('../../data/seasons/*.json', {
  eager: true,
}) as Record<string, { default: Season }>;
const seasonsById = new Map(
  Object.values(seasonModules).map(({ default: season }) => [season.season, season]),
);

export function loadSeason(seasonId: string): ClubInSeason[] {
  const season = seasonsById.get(seasonId);
  if (!season) throw new Error(`Unknown season: ${seasonId}`);

  const clubsById = new Map(clubs.map((club) => [club.id, club]));
  const leaguesById = new Map(leagues.map((league) => [league.id, league]));

  return season.assignments.map(({ clubId, leagueId }) => {
    const club = clubsById.get(clubId);
    if (!club) throw new Error(`Unknown clubId in season "${seasonId}": ${clubId}`);

    const league = leaguesById.get(leagueId);
    if (!league) throw new Error(`Unknown leagueId in season "${seasonId}": ${leagueId}`);

    return { ...club, league };
  });
}
