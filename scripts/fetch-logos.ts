// TheSportsDBからクラブバッジを取得し、利用規約に従い改変せずpublic/logos/に保存する（npm run fetch-logos）
import { writeFile, mkdir } from 'node:fs/promises';
import { setTimeout as sleep } from 'node:timers/promises';
import path from 'node:path';
import clubs from '../src/data/clubs.json' with { type: 'json' };

interface Team {
  strCountry?: string | null;
  strBadge?: string | null;
}

const API_KEY = '123'; // TheSportsDB 無料版の共有キー
const OUT_DIR = path.resolve(import.meta.dirname, '../public/logos');
const REQUEST_INTERVAL_MS = 2500; // 無料版レート制限(30req/min)への配慮

async function searchTeam(name: string): Promise<Team | null> {
  const url = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/searchteams.php?t=${encodeURIComponent(name)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error (${res.status})`);
  const data = (await res.json()) as { teams: Team[] | null };
  const teams = data.teams ?? [];
  return teams.find((t) => t.strCountry === 'England') ?? teams[0] ?? null;
}

async function downloadBadge(url: string, destPath: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`badge download failed (${res.status})`);
  await writeFile(destPath, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const failed: string[] = [];

  for (const club of clubs) {
    try {
      const team = await searchTeam(club.name);
      if (!team?.strBadge) {
        console.warn(`[not found] ${club.name}`);
        failed.push(club.id);
      } else {
        await downloadBadge(team.strBadge, path.join(OUT_DIR, `${club.id}.png`));
        console.log(`[ok] ${club.name} -> logos/${club.id}.png (source: ${team.strBadge})`);
      }
    } catch (err) {
      console.error(`[error] ${club.name}: ${err instanceof Error ? err.message : err}`);
      failed.push(club.id);
    }
    await sleep(REQUEST_INTERVAL_MS);
  }

  console.log(`\n完了: ${clubs.length - failed.length}/${clubs.length} 件取得`);
  if (failed.length > 0) console.log('要確認:', failed.join(', '));
}

await main();
