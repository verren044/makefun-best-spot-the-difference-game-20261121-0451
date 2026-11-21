// Boot and the one loop: input is read every frame, the clock advances in
// real seconds while the screen is PLAY, and the renderer paints what is
// there. The game moves between six screens: title, play, paused,
// level done, win and game over. state.screen is the single source of
// truth for which screen is showing.
//
// ?shot=cover|garden|win|level-done stages that scene instead of running
// the loop, paints it twice and sets window.__shotReady for a screenshot.
import { LEVELS } from './config.js';
import {
  SCREEN_LEVEL_DONE,
  SCREEN_OVER,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_TITLE,
  SCREEN_WIN,
  clickPanel,
  createGameState,
  startLevel,
  tick,
  useHint,
} from './state.js';
import { render } from './render.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_LEVEL0, ACTION_LEVEL1, ACTION_LEVEL2, ACTION_PAUSE, ACTION_RESTART, ACTION_SOUND, createInput, panelAt } from './input.js';
import { isMuted, setMuted, soundFind, soundHint, soundMiss, soundWin, unlockAudio } from './audio.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const state = createGameState();
const input = createInput(canvas, { onGesture: unlockAudio });
// For the playtest and the shot staging: the live state, read-only from outside.
window.__game = state;

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem('rooms-best') ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem('rooms-best', String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  stageShot(name, state);
  let painted = 0;
  function paint() {
    render(canvas.getContext('2d'), state, 5000);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let best = readBest();
  let last = performance.now();

  // Screen readers (and anyone watching the page's text) hear the screen changes and each find.
  function announce(message) {
    status.textContent = message;
  }

  function beginLevel(index) {
    startLevel(state, index);
    announce(`Playing ${LEVELS[index].name}. ${LEVELS[index].differences.length} differences.`);
  }

  /** Side effects of finishing a level or the whole game, once. */
  function finishLevel() {
    if (state.screen === SCREEN_WIN) {
      if (state.totalScore > best) {
        best = state.totalScore;
        saveBest(best);
      }
      soundWin();
      announce(`You found them all! Final score ${state.totalScore}. Best ${best}.`);
    } else {
      soundWin();
      announce(`${LEVELS[state.level.levelIndex].name} complete. Score ${state.totalScore}.`);
    }
  }

  function finishOver() {
    soundMiss();
    announce(`Time's up in ${LEVELS[state.level.levelIndex].name}.`);
  }

  function advanceFromOverlay() {
    if (state.screen === SCREEN_LEVEL_DONE) beginLevel(state.level.levelIndex + 1);
    else if (state.screen === SCREEN_OVER) beginLevel(state.level.levelIndex);
    else beginLevel(0);
  }

  function handleClick(point) {
    const panel = panelAt(point.x, point.y);
    if (!panel) return;
    const before = state.screen;
    const result = clickPanel(state, panel.x, panel.y, panel.side, performance.now());
    if (result === 'found') {
      soundFind();
      const d = LEVELS[state.level.levelIndex].differences[state.level.foundOrder[state.level.foundOrder.length - 1]];
      state.message = `Found: ${d.name}! +${100 + (state.level.combo - 1) * 25}`;
      state.messageAt = performance.now();
      announce(`Found ${d.name}.`);
      if (before === SCREEN_PLAY && (state.screen === SCREEN_LEVEL_DONE || state.screen === SCREEN_WIN)) finishLevel();
    } else if (result === 'miss') {
      soundMiss();
      state.message = 'Nothing there — 5 seconds lost.';
      state.messageAt = performance.now();
      announce('Nothing there.');
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_SOUND) {
      setMuted(!isMuted());
      state.message = isMuted() ? 'Sound off.' : 'Sound on.';
      state.messageAt = performance.now();
    }
    if (state.screen === SCREEN_TITLE || state.screen === SCREEN_LEVEL_DONE || state.screen === SCREEN_WIN || state.screen === SCREEN_OVER) {
      if (actions & ACTION_CONFIRM) advanceFromOverlay();
      return;
    }
    if (state.screen === SCREEN_PAUSED) {
      if (actions & (ACTION_PAUSE | ACTION_CONFIRM)) {
        state.screen = SCREEN_PLAY;
        announce('Playing.');
      }
      return;
    }
    // SCREEN_PLAY from here on.
    if (actions & ACTION_PAUSE) {
      state.screen = SCREEN_PAUSED;
      announce('Paused.');
      return;
    }
    if (actions & ACTION_HINT) {
      const found = useHint(state, performance.now());
      if (found !== null) {
        soundHint();
        state.message = 'Hint: look at the gold ring.';
        state.messageAt = performance.now();
      } else {
        state.message = 'No hints left in this room.';
        state.messageAt = performance.now();
      }
    }
    if (actions & ACTION_RESTART) beginLevel(state.level.levelIndex);
    if (actions & ACTION_LEVEL0) beginLevel(0);
    if (actions & ACTION_LEVEL1) beginLevel(1);
    if (actions & ACTION_LEVEL2) beginLevel(2);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    handleActions();
    const click = input.takeClick();
    if (click) {
      if (state.screen === SCREEN_TITLE || state.screen === SCREEN_LEVEL_DONE || state.screen === SCREEN_WIN || state.screen === SCREEN_OVER) {
        advanceFromOverlay();
      } else if (state.screen === SCREEN_PAUSED) {
        state.screen = SCREEN_PLAY;
        announce('Playing.');
      } else if (state.screen === SCREEN_PLAY) {
        handleClick(click);
      }
    }
    if (state.screen === SCREEN_PLAY && tick(state, dt, now)) finishOver();
    if (state.message && now - state.messageAt > 2500) state.message = '';
    render(canvas.getContext('2d'), state, now);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.screen === SCREEN_PLAY) {
      state.screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Spot the Difference: Three Curious Rooms. Press Enter or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
