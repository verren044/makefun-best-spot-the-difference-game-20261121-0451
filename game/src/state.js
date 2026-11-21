// Game state: one level at a time, pure logic with no rendering in it.
// A find is a click inside a difference's circle on either panel; the same
// spot is marked on both. Wrong clicks cost time, hints cost time, finds
// build a combo that pays a bonus. Time runs only while the screen is PLAY.
import {
  COMBO_BONUS,
  HINTS_PER_LEVEL,
  HINT_TIME_COST_S,
  LEVELS,
  POINTS_PER_FIND,
  TIME_BONUS_PER_SECOND,
  WRONG_TIME_COST_S,
} from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_DONE = 'level-done';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';

/** Fresh state for one level: which spots are found, time left, score so far. */
export function createLevelState(levelIndex, carriedScore) {
  const level = LEVELS[levelIndex];
  return {
    levelIndex,
    found: new Array(level.differences.length).fill(false),
    foundOrder: [],
    hintsLeft: HINTS_PER_LEVEL,
    hintsUsed: 0,
    wrongClicks: 0,
    combo: 0,
    bestCombo: 0,
    timeLeftS: level.timeLimitS,
    levelScore: 0,
    carriedScore,
    wrongMark: null, // { x, y, panel, expiresAt } in panel coordinates
    hintMark: null, // { index, expiresAt }
    lastFindAt: 0,
  };
}

export function createGameState() {
  return {
    screen: SCREEN_TITLE,
    level: createLevelState(0, 0),
    totalScore: 0,
    levelScores: [],
    muted: false,
    message: '',
    messageAt: 0,
  };
}

export function startLevel(state, levelIndex) {
  state.level = createLevelState(levelIndex, state.totalScore);
  state.screen = SCREEN_PLAY;
  state.message = '';
}

/** Which difference, if any, sits under panel point (x, y)? -1 when none. */
export function differenceAt(levelIndex, x, y) {
  const diffs = LEVELS[levelIndex].differences;
  for (let i = 0; i < diffs.length; i += 1) {
    const d = diffs[i];
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) return i;
  }
  return -1;
}

/**
 * Handle a click on a panel. Returns 'found' | 'already' | 'miss'.
 * A find scores 100 plus a combo bonus; a miss costs 5 seconds.
 */
export function clickPanel(state, x, y, panel, nowMs) {
  const level = state.level;
  const index = differenceAt(level.levelIndex, x, y);
  if (index === -1) {
    level.wrongClicks += 1;
    level.combo = 0;
    level.timeLeftS = Math.max(0, level.timeLeftS - WRONG_TIME_COST_S);
    level.wrongMark = { x, y, panel, expiresAt: nowMs + 700 };
    return 'miss';
  }
  if (level.found[index]) return 'already';
  level.found[index] = true;
  level.foundOrder.push(index);
  level.combo += 1;
  level.bestCombo = Math.max(level.bestCombo, level.combo);
  const points = POINTS_PER_FIND + (level.combo - 1) * COMBO_BONUS;
  level.levelScore += points;
  level.lastFindAt = nowMs;
  level.hintMark = null;
  if (level.found.every(Boolean)) {
    const bonus = Math.round(level.timeLeftS) * TIME_BONUS_PER_SECOND;
    level.levelScore += bonus;
    state.totalScore = level.carriedScore + level.levelScore;
    state.levelScores[level.levelIndex] = level.levelScore;
    state.screen = level.levelIndex === LEVELS.length - 1 ? SCREEN_WIN : SCREEN_LEVEL_DONE;
  }
  return 'found';
}

/** Reveal the first still-hidden difference for 15 seconds of time. */
export function useHint(state, nowMs) {
  const level = state.level;
  if (level.hintsLeft <= 0) return null;
  for (let i = 0; i < level.found.length; i += 1) {
    if (!level.found[i]) {
      level.hintsLeft -= 1;
      level.hintsUsed += 1;
      level.timeLeftS = Math.max(0, level.timeLeftS - HINT_TIME_COST_S);
      level.hintMark = { index: i, expiresAt: nowMs + 4000 };
      return i;
    }
  }
  return null;
}

/** Advance the clock by dt seconds; returns true when time just ran out. */
export function tick(state, dtS, nowMs) {
  const level = state.level;
  if (state.screen !== SCREEN_PLAY) return false;
  level.timeLeftS -= dtS;
  if (level.wrongMark && nowMs > level.wrongMark.expiresAt) level.wrongMark = null;
  if (level.hintMark && nowMs > level.hintMark.expiresAt) level.hintMark = null;
  if (level.timeLeftS <= 0) {
    level.timeLeftS = 0;
    state.screen = SCREEN_OVER;
    return true;
  }
  return false;
}

export function foundCount(level) {
  return level.found.filter(Boolean).length;
}

export function totalFoundCount(state) {
  return state.levelScores.length === 0
    ? foundCount(state.level)
    : LEVELS.slice(0, state.level.levelIndex).reduce((n, l) => n + l.differences.length, 0) + foundCount(state.level);
}

/** Format seconds as M:SS for the timer. */
export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
