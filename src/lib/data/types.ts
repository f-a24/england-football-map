export interface League {
  id: string;
  name: string;
  nameJa: string;
  shortName: string;
  order: number;
  color: string;
}

export interface Stadium {
  name: string;
  nameJa: string;
  capacity?: number;
}

export interface ClubColors {
  primary: string;
  secondary?: string;
}

/** 地図座標。密集地域の重なりを避けるため`npm run layout-clubs`で緯度経度から調整済み。 */
export interface MapPosition {
  x: number;
  y: number;
}

export interface Club {
  id: string;
  name: string;
  nameJa: string;
  shortName: string;
  city: string;
  stadium: Stadium;
  colors?: ClubColors;
  /** public/ ルートからの絶対パス */
  logo: string;
  website?: string;
  location: { lat: number; lon: number };
  position: MapPosition;
}

export interface SeasonAssignment {
  clubId: string;
  leagueId: string;
}

export interface Season {
  season: string;
  assignments: SeasonAssignment[];
}

export interface ClubInSeason extends Club {
  league: League;
}
