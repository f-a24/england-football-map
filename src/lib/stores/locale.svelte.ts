import type { Club, League } from '../data/types';

type Locale = 'ja' | 'en';

function detectLocale(): Locale {
  const lang = navigator.languages[0] ?? navigator.language;
  return lang.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

const messages = {
  ja: {
    leagueFilterLabel: 'リーグ表示切り替え',
    clubList: 'クラブ一覧',
    backToMap: '地図を見る',
    creditPrefix: 'クラブバッジ提供：',
  },
  en: {
    leagueFilterLabel: 'Toggle leagues',
    clubList: 'Club list',
    backToMap: 'Back to map',
    creditPrefix: 'Club badges via ',
  },
} satisfies Record<Locale, Record<string, string>>;

function createLocaleState() {
  let current = $state<Locale>(detectLocale());
  window.addEventListener('languagechange', () => {
    current = detectLocale();
  });

  return {
    get current() {
      return current;
    },
    get t() {
      return messages[current];
    },
    clubName(club: Club) {
      return current === 'ja' ? club.nameJa : club.name;
    },
    stadiumName(club: Club) {
      return current === 'ja' ? club.stadium.nameJa : club.stadium.name;
    },
    /** リーグ切り替えチップ用の短い表記 */
    leagueLabel(league: League) {
      return current === 'ja' ? league.nameJa : league.shortName;
    },
    leagueName(league: League) {
      return current === 'ja' ? league.nameJa : league.name;
    },
  };
}

export const locale = createLocaleState();
