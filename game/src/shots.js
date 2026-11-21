// The screenshot scenes behind ?shot=cover|garden|win. Each one stages a
// real game state — the same state the player reaches by clicking — with
// fixed found sets and a fixed clock, so the same URL always paints the
// same frame. The cover shows the first room mid-hunt: three differences
// found and circled, five still hiding, the counter reading 3 / 8.
import { LEVELS } from './config.js';
import { SCREEN_LEVEL_DONE, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, createGameState, startLevel } from './state.js';

/** Mark differences `indices` as found on `state`, scoring them as clicks would. */
function markFound(state, indices, nowMs) {
  const level = state.level;
  for (const i of indices) {
    if (level.found[i]) continue;
    level.found[i] = true;
    level.foundOrder.push(i);
    level.combo += 1;
    level.bestCombo = Math.max(level.bestCombo, level.combo);
    level.levelScore += 100 + (level.combo - 1) * 25;
    level.lastFindAt = nowMs;
  }
}

/** The time bonus a finished level pays, as clickPanel computes it. */
function timeBonus(state) {
  return Math.round(state.level.timeLeftS) * 10;
}

/**
 * Set `state` to the named scene and return the screen to draw and the
 * best score to show. Unknown names fall back to the title screen.
 */
export function stageShot(name, state) {
  if (name === 'garden') {
    startLevel(state, 1);
    state.screen = SCREEN_PLAY;
    markFound(state, [0, 3, 6, 8], 1000);
    state.level.timeLeftS = 118;
    state.level.hintsLeft = 2;
    state.level.hintsUsed = 1;
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'win') {
    // All three rooms cleared: totals as a full run would leave them.
    // Level 3 pays its finds (2850) plus its time bonus (440); the two
    // earlier rooms paid 960 between them, so the header and the overlay
    // agree on the final score of 4250.
    startLevel(state, 2);
    state.screen = SCREEN_WIN;
    markFound(state, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 1000);
    state.level.timeLeftS = 44;
    state.level.levelScore += timeBonus(state);
    state.level.carriedScore = 960;
    state.totalScore = 4250;
    state.levelScores = [480, 480, 3290];
    return { screen: SCREEN_WIN, best: 4250 };
  }
  if (name === 'level-done') {
    startLevel(state, 0);
    state.screen = SCREEN_LEVEL_DONE;
    markFound(state, [0, 1, 2, 3, 4, 5, 6, 7], 1000);
    state.level.timeLeftS = 61;
    state.level.levelScore += timeBonus(state);
    state.totalScore = state.level.levelScore;
    state.levelScores = [state.level.levelScore];
    return { screen: SCREEN_LEVEL_DONE, best: state.level.levelScore };
  }
  // cover: the kitchen, three found, five hiding, 2:41 on the clock.
  startLevel(state, 0);
  state.screen = SCREEN_PLAY;
  markFound(state, [0, 3, 5], 1000);
  state.level.timeLeftS = 161;
  return { screen: SCREEN_PLAY, best: 0 };
}

export { LEVELS, SCREEN_TITLE };
