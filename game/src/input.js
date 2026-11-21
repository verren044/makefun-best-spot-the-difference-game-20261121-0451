// Input: pointer clicks on the panels and the footer buttons, plus the
// keyboard. Clicks are mapped from canvas pixels into panel coordinates;
// a click anywhere else on an overlay screen is a confirm.
import { LAYOUT, PANEL_H, PANEL_W } from './config.js';
import { hitButton, panelRect } from './render.js';

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_RESTART = 8;
export const ACTION_SOUND = 16;
export const ACTION_LEVEL0 = 32;
export const ACTION_LEVEL1 = 64;
export const ACTION_LEVEL2 = 128;

/** Which panel, if any, holds canvas point (x, y)? Returns { side, x, y } in panel coordinates, or null. */
export function panelAt(x, y) {
  for (let side = 0; side < 2; side += 1) {
    const rect = panelRect(side);
    if (x >= rect.x && x < rect.x + rect.w && y >= rect.y && y < rect.y + rect.h) {
      return { side, x: x - rect.x, y: y - rect.y };
    }
  }
  return null;
}

/** Wire the canvas and keyboard to `state`. Returns a detach function. */
export function createInput(canvas, hooks) {
  let actions = 0;
  let click = null; // { x, y } in canvas pixels, consumed by takeClick

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function onPointer(event) {
    event.preventDefault();
    const point = canvasPoint(event);
    const button = hitButton(point.x, point.y);
    if (button === 'hint') actions |= ACTION_HINT;
    else if (button === 'restart') actions |= ACTION_RESTART;
    else if (button === 'sound') actions |= ACTION_SOUND;
    else if (button === 'level0') actions |= ACTION_LEVEL0;
    else if (button === 'level1') actions |= ACTION_LEVEL1;
    else if (button === 'level2') actions |= ACTION_LEVEL2;
    else click = point;
    hooks.onGesture();
  }

  function onKey(event) {
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'enter') {
      event.preventDefault();
      actions |= ACTION_CONFIRM;
    } else if (key === 'p' || key === 'escape') {
      actions |= ACTION_PAUSE;
    } else if (key === 'h') {
      actions |= ACTION_HINT;
    } else if (key === 'r') {
      actions |= ACTION_RESTART;
    } else if (key === 'm') {
      actions |= ACTION_SOUND;
    } else if (key === '1') {
      actions |= ACTION_LEVEL0;
    } else if (key === '2') {
      actions |= ACTION_LEVEL1;
    } else if (key === '3') {
      actions |= ACTION_LEVEL2;
    }
    hooks.onGesture();
  }

  canvas.addEventListener('pointerdown', onPointer);
  window.addEventListener('keydown', onKey);

  return {
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeClick() {
      const taken = click;
      click = null;
      return taken;
    },
    detach() {
      canvas.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onKey);
    },
  };
}

export { LAYOUT, PANEL_H, PANEL_W };
