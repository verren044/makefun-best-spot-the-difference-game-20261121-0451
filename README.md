# Spot the Difference: Three Curious Rooms

[![Competition](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/verren044/makefun-best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/verren044/makefun-best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

Two pictures hang side by side. They look the same. They are not. Find every
change before the clock runs out — across three rooms, each with its own mood,
its own clock, and its own hiding places.

## The rooms

| Room | Differences | Time | Mood |
| --- | --- | --- | --- |
| Sunny Kitchen | 8 | 3:00 | Easy — a sunny window, a cat on a chair, a kettle that may or may not be steaming |
| Night Garden | 10 | 2:30 | Medium — a moon, a pond, a frog that appears and disappears |
| Old Bookshop | 12 | 2:00 | Hard — shelves of books, a ladder, a portrait whose eyes follow you |

## How it plays

- Click a difference in **either** picture — it counts on both, circled in
  green with a checkmark, and its name joins the list under the pictures.
- A find pays 100 points, plus 25 more for every find in a row without a miss
  (the combo). Finishing a room pays 10 points per second left on the clock.
- A wrong click costs 5 seconds and breaks the combo. A hint (H) costs 15
  seconds and rings one hiding difference in gold for 4 seconds; three hints
  per room.
- The counter reads `Found n / total` and the footer names everything found
  so far, so the game is always honest about what is left.

## Controls

- **Mouse / touch** — click a difference.
- **H** hint · **R** restart the room · **M** sound on/off · **P** pause.
- **Enter** or click — start, continue to the next room, play again.
- **1 / 2 / 3** — jump straight to the Kitchen, the Garden, or the Bookshop.
- Leaving the tab pauses the game; the clock never runs while you are away.

The best score is kept in the browser (local storage) and shown on the win
screen. Sound is a few WebAudio bleeps made in code — no audio files, no
network. The whole game is plain static files: `game/index.html` plus ES
modules, no library, nothing fetched.

## Run it

```sh
node serve.ts          # game/ on http://localhost:8080
```

Or open `game/index.html` through any static server. `main.ts` (Node 22,
standard library only) copies `game/` and `screenshots/` to `/output` and
writes `/output/dossier.json` — outside the grader's container, set
`MAKEFUN_OUTPUT_DIR` to point it somewhere else.
