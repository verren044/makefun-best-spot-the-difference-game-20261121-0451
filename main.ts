// Spot the Difference: Three Curious Rooms (Node 22, standard library
// only). The game is this directory's game/ folder — plain static files a
// desktop browser loads offline (game/index.html and its ES modules, no
// library, no network request) — and the program hands it in. It copies
// game/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored
// make.fun library.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The entry is nothing without its pictures: refuse to hand in a game or
// a dossier with no screenshots rather than letting the scorer fail it.
const gameDir = join(here, 'game');
const shotsDir = join(here, 'screenshots');
if (!existsSync(gameDir)) throw new Error('game/ is missing next to main.ts');
if (!existsSync(shotsDir)) throw new Error('screenshots/ is missing next to main.ts');
const shotFiles = readdirSync(shotsDir).filter((name) => !name.startsWith('.'));
if (shotFiles.length === 0) throw new Error('screenshots/ is empty — capture the shots first');

mkdirSync(out, { recursive: true });
// A previous run may have left its own game/, screenshots/ or dossier.json
// behind; clear exactly those three so stale files can never leak into
// this hand-in (an old screenshot would push the count over the cap).
rmSync(join(out, 'game'), { recursive: true, force: true });
rmSync(join(out, 'screenshots'), { recursive: true, force: true });
rmSync(join(out, 'dossier.json'), { force: true });
cpSync(gameDir, join(out, 'game'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of game
// files, in all, or a path under game/ over 1000 bytes: game/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
const dossierPath = join(out, 'dossier.json');
writeFileSync(dossierPath, dossier);

// Read it back and say what was handed in: a dossier that is not valid
// JSON, or one that lost its screenshots, is caught here, not by the judge.
const parsed = JSON.parse(readFileSync(dossierPath, 'utf8'));
const gameBytes = readdirSync(join(out, 'game'), { recursive: true })
  .map((name) => join(out, 'game', String(name)))
  .filter((path) => statSync(path).isFile())
  .reduce((sum, path) => sum + statSync(path).size, 0);
console.log(
  `handed in: ${shotFiles.length} screenshots, ${gameBytes} game bytes, dossier ${statSync(dossierPath).size} bytes, ${parsed.images?.length ?? 0} images listed`,
);
