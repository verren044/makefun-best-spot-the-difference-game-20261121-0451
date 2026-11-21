# Build log — Spot the Difference: Three Curious Rooms

Built fresh in one session (2026-11-21, session started after the competition
opened at 04:51 UTC), from the brief in the kit's `RULES.txt` and
`competition.yaml` only. No file from any earlier build was read, copied, or
re-typed.

## Approach

- **Game** (`game/`): plain static files, ES modules, no libraries, no network.
  `game/index.html` hosts one full-window canvas and a visually hidden status
  line (`role="status"`, `aria-live="polite"`) that announces screen changes
  and each find. `game/src/` is split by job: `config.js` (layout, scoring,
  the three rooms and every difference's coordinates), `scenes.js` (the room
  painters — each difference is one conditional branch, so the two pictures
  are drawn by the same code), `state.js` (pure game logic: screens, clicks,
  hints, timer, scoring), `render.js` (header, panels, markers, footer,
  overlays), `input.js` (pointer + keyboard), `audio.js` (lazy WebAudio
  bleeps), `main.js` (boot, the one loop, `?shot=` staging), `shots.js`
  (deterministic staged states for the screenshots).
- **Entrypoint** (`main.ts`): Node 22, standard library only. Copies `game/`
  and `screenshots/` to `/output` (clearing its own previous `game/`,
  `screenshots/`, `dossier.json` first, so a stale file can never leak into
  the hand-in), then writes `/output/dossier.json` with the vendored
  `buildDossier` and the scorer's caps. It refuses to run with no
  `screenshots/` and reads the dossier back to print what was handed in.
  Written once, then revised in a later message: the guards and the summary
  print were added, and the output cleanup was added after a stale
  `screenshots/` from an old `/tmp` run pushed the count over the 4-image cap.
- **Server** (`serve.ts`): a tiny static server for local play
  (`node serve.ts`, http://localhost:8080), MIME types included, paths
  confined to `game/`.
- **Screenshots** (`shots.json`): `1-cover.jpg` (`?shot=cover`, kitchen 3/8
  found, 2:41 left), `2-garden.jpg` (`?shot=garden`, 4/10 found, 1:58 left),
  `3-win.jpg` (`?shot=win`, all 30 found, final score 4250). Staged states
  are built by the same `markFound` path real clicks use, and the staged
  scores include the time bonus, so the header and the overlay agree.

## Verification

- **Syntax**: every module (`game/src/*.js`, `main.ts`, `serve.ts`) parses
  clean under `node --check`.
- **Playtest** (headless Chromium via CDP, 2026-11-21 ~13:50 WIB): title →
  click to start → wrong click at empty wall counted (`wrong 1`, −5 s) →
  hint (H) spent one hint and ringed difference 0 → clicked all 8 kitchen
  differences, all 10 garden, all 12 bookshop, counter advancing 1-by-1 each
  time → `level-done` between rooms, `win` at the end with total score
  10735 → Enter restarted, key `3` jumped to the Bookshop → P paused and
  the clock froze, P resumed. Zero page errors (after an inline `data:,`
  favicon silenced the automatic favicon 404).
- **Screenshots**: 1280×800 JPEG each — `1-cover.jpg` 79,407 B (sha256
  `b5efac06…`), `2-garden.jpg` 72,439 B (`4d07b74b…`), `3-win.jpg` 68,946 B
  (`6de709e0…`). All within the caps (≤256 KiB, long side ≤1280, short side
  ≥480). Visually checked: both pictures, found markers with checkmarks,
  several unfound, counter and names in the footer. Two polish fixes after
  the first look: the teapot redrawn (it read as a fish), the garden gate
  redrawn (the swung-open panel read as a fallen fence); both shots re-taken.
- **Determinism**: `MAKEFUN_OUTPUT_DIR=/tmp/sd1 node main.ts` and
  `/tmp/sd2` — `diff -r` clean. Dossier sha256
  `2f3c87df3a033590c27edfdad6a7051cf7e3a86e0fb60222f7aa94a330d9b9ca`
  (351,173 B, schema `makefun/dossier/v1`, cover 0, 3 images, text 54,562 B
  under the 163,840 cap). Game: 9 source files, 53,902 bytes.

## Files written

- `game/index.html`, `game/src/config.js`, `game/src/scenes.js`,
  `game/src/state.js`, `game/src/render.js`, `game/src/input.js`,
  `game/src/audio.js`, `game/src/main.js`, `game/src/shots.js`
- `main.ts`, `serve.ts`, `shots.json`, `README.md`, `BUILD_LOG.md`
- `screenshots/1-cover.jpg`, `screenshots/2-garden.jpg`,
  `screenshots/3-win.jpg`
- `vendor/makefun-game.ts` — the kit's library, copied unchanged (required by
  the rules; vendored files are excluded from the transcript count).
