// Renderer: draws the whole 1280x800 frame on one canvas — header with the
// timer, score and found counter; the two panels side by side; the footer
// with the buttons and the list of differences found; and the title, level
// complete, win and game over overlays. Nothing here changes game state.
import { CANVAS_H, CANVAS_W, LAYOUT, LEVELS, PANEL_H, PANEL_W } from './config.js';
import { drawScene } from './scenes.js';
import { SCREEN_LEVEL_DONE, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, formatTime, foundCount } from './state.js';

export const BUTTONS = [
  { id: 'hint', label: 'Hint (H)', x: 24, y: 700, w: 150, h: 52 },
  { id: 'restart', label: 'Restart (R)', x: 190, y: 700, w: 170, h: 52 },
  { id: 'sound', label: 'Sound (M)', x: 376, y: 700, w: 150, h: 52 },
  { id: 'level0', label: '1 · Kitchen', x: 880, y: 700, w: 130, h: 52 },
  { id: 'level1', label: '2 · Garden', x: 1020, y: 700, w: 120, h: 52 },
  { id: 'level2', label: '3 · Bookshop', x: 1150, y: 700, w: 106, h: 52 },
];

export function hitButton(x, y) {
  for (const b of BUTTONS) {
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.id;
  }
  return null;
}

/** Panel rectangle for side 0 (left) or 1 (right), in canvas pixels. */
export function panelRect(side) {
  return {
    x: side === 0 ? LAYOUT.leftX : LAYOUT.rightX,
    y: LAYOUT.panelY,
    w: PANEL_W,
    h: PANEL_H,
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFoundMarker(ctx, x, y, r, nowMs, fresh) {
  const pulse = fresh ? 1 + 0.12 * Math.sin((nowMs % 600) / 600 * Math.PI * 2) : 1;
  ctx.save();
  ctx.strokeStyle = '#2fbf5a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x, y, r * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#2fbf5a';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y);
  ctx.lineTo(x - r * 0.12, y + r * 0.35);
  ctx.lineTo(x + r * 0.5, y - r * 0.35);
  ctx.stroke();
  ctx.restore();
}

function drawWrongMark(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = '#ff4d4d';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 14);
  ctx.lineTo(x + 14, y + 14);
  ctx.moveTo(x + 14, y - 14);
  ctx.lineTo(x - 14, y + 14);
  ctx.stroke();
  ctx.restore();
}

function drawHintRing(ctx, x, y, r, nowMs) {
  const pulse = 1 + 0.15 * Math.sin(nowMs / 180);
  ctx.save();
  ctx.strokeStyle = '#ffd94d';
  ctx.lineWidth = 3.5;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(x, y, r * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawPanel(ctx, state, side, nowMs) {
  const level = state.level;
  const rect = panelRect(side);
  ctx.save();
  ctx.beginPath();
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
  ctx.clip();
  ctx.translate(rect.x, rect.y);
  drawScene(ctx, level.levelIndex, side);
  // Found differences are circled on both panels.
  const diffs = LEVELS[level.levelIndex].differences;
  for (let i = 0; i < diffs.length; i += 1) {
    if (!level.found[i]) continue;
    const fresh = level.foundOrder[level.foundOrder.length - 1] === i && nowMs - level.lastFindAt < 900;
    drawFoundMarker(ctx, diffs[i].x, diffs[i].y, diffs[i].r, nowMs, fresh);
  }
  if (level.hintMark) {
    const d = diffs[level.hintMark.index];
    drawHintRing(ctx, d.x, d.y, d.r, nowMs);
  }
  if (level.wrongMark && level.wrongMark.panel === side) {
    drawWrongMark(ctx, level.wrongMark.x, level.wrongMark.y);
  }
  ctx.restore();
  // Frame and tab.
  ctx.save();
  ctx.strokeStyle = '#f2e8d0';
  ctx.lineWidth = 3;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = '#f2e8d0';
  roundRect(ctx, rect.x, rect.y - 2, 92, 26, 6);
  ctx.fill();
  ctx.fillStyle = '#2b3a4a';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(side === 0 ? 'PICTURE A' : 'PICTURE B', rect.x + 46, rect.y + 16);
  ctx.restore();
}

function drawHeader(ctx, state) {
  const level = state.level;
  const meta = LEVELS[level.levelIndex];
  ctx.save();
  ctx.fillStyle = '#1c2340';
  ctx.fillRect(0, 0, CANVAS_W, LAYOUT.headerH);
  ctx.fillStyle = '#f2e8d0';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('SPOT THE DIFFERENCE', 24, 30);
  ctx.font = '15px sans-serif';
  ctx.fillStyle = '#9fb4d8';
  ctx.fillText(`${meta.name}  ·  ${meta.difficulty}`, 24, 54);
  // Found counter, big and central.
  const found = foundCount(level);
  const total = meta.differences.length;
  ctx.textAlign = 'center';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = found === total ? '#7ae08a' : '#f2e8d0';
  ctx.fillText(`Found ${found} / ${total}`, 640, 30);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#9fb4d8';
  ctx.fillText(`${total - found} still hiding`, 640, 52);
  // Timer, coloured by urgency.
  const urgent = level.timeLeftS <= 30 && state.screen === SCREEN_PLAY;
  ctx.font = 'bold 30px monospace';
  ctx.fillStyle = urgent ? '#ff5a5a' : '#ffd94d';
  ctx.textAlign = 'right';
  ctx.fillText(formatTime(level.timeLeftS), 1080, 36);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#9fb4d8';
  ctx.fillText('time left', 1080, 56);
  ctx.font = 'bold 20px sans-serif';
  ctx.fillStyle = '#f2e8d0';
  ctx.textAlign = 'right';
  ctx.fillText(`Score ${level.carriedScore + level.levelScore}`, 1256, 30);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = '#9fb4d8';
  ctx.fillText(`combo x${level.combo}`, 1256, 52);
  ctx.restore();
}

function drawFooter(ctx, state, nowMs) {
  const level = state.level;
  const meta = LEVELS[level.levelIndex];
  ctx.save();
  ctx.fillStyle = '#141a2e';
  ctx.fillRect(0, LAYOUT.footerY, CANVAS_W, CANVAS_H - LAYOUT.footerY);
  // Found names, so the player sees what they caught.
  ctx.font = '15px sans-serif';
  ctx.fillStyle = '#9fb4d8';
  ctx.textAlign = 'left';
  const names = level.foundOrder.map((i) => meta.differences[i].name);
  const line = names.length === 0 ? 'Click a difference in either picture — the same spot counts on both.' : `Found: ${names.join(' · ')}`;
  ctx.fillText(line.slice(0, 110), 24, 616);
  ctx.fillStyle = state.message ? '#ffd94d' : '#9fb4d8';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(state.message, 24, 646);
  // Timer bar.
  const frac = Math.max(0, level.timeLeftS / meta.timeLimitS);
  ctx.fillStyle = '#2a3352';
  roundRect(ctx, 24, 668, 500, 10, 5);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#2fbf5a' : frac > 0.25 ? '#ffd94d' : '#ff5a5a';
  if (frac > 0) {
    roundRect(ctx, 24, 668, 500 * frac, 10, 5);
    ctx.fill();
  }
  // Buttons.
  for (const b of BUTTONS) {
    const active = b.id === `level${level.levelIndex}`;
    ctx.fillStyle = active ? '#ffd94d' : '#2a3352';
    roundRect(ctx, b.x, b.y, b.w, b.h, 8);
    ctx.fill();
    ctx.fillStyle = active ? '#1c2340' : '#f2e8d0';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.label, b.x + b.w / 2, b.y + 33);
  }
  // Rules reminder, in the gap between the action buttons and the level
  // buttons, so it never sits under either row.
  ctx.fillStyle = '#9fb4d8';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Hints: ${level.hintsLeft}  ·  Wrong: ${level.wrongClicks}  ·  H hint · R restart · M sound`, 544, 718);
  ctx.fillText('Wrong click −5s · Hint −15s, rings the spot 4s', 544, 740);
  void nowMs;
  ctx.restore();
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.save();
  ctx.fillStyle = 'rgba(12,16,32,0.82)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = 'bold 52px sans-serif';
  ctx.fillText(title, CANVAS_W / 2, 300);
  ctx.fillStyle = '#f2e8d0';
  ctx.font = '20px sans-serif';
  lines.forEach((line, i) => ctx.fillText(line, CANVAS_W / 2, 360 + i * 34));
  ctx.restore();
}

/** Draw the whole frame for `state` at time `nowMs`. */
export function render(ctx, state, nowMs) {
  ctx.save();
  ctx.fillStyle = '#0e1220';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  drawHeader(ctx, state);
  drawPanel(ctx, state, 0, nowMs);
  drawPanel(ctx, state, 1, nowMs);
  drawFooter(ctx, state, nowMs);

  if (state.screen === SCREEN_TITLE) {
    drawOverlay(ctx, 'SPOT THE DIFFERENCE', [
      'Two pictures, a few sneaky changes. Find them all before the clock runs out.',
      'Click a difference in EITHER picture — it counts on both. Wrong clicks cost 5 seconds.',
      'Three rooms: Sunny Kitchen (8), Night Garden (10), Old Bookshop (12).',
      '',
      'Click anywhere or press Enter to start',
    ], '#ffd94d');
  } else if (state.screen === SCREEN_PAUSED) {
    drawOverlay(ctx, 'PAUSED', [
      'The rooms wait. The clock is stopped.',
      '',
      'Press P or click to keep looking',
    ], '#9fb4d8');
  } else if (state.screen === SCREEN_LEVEL_DONE) {
    const level = state.level;
    const next = LEVELS[level.levelIndex + 1];
    drawOverlay(ctx, 'ROOM COMPLETE!', [
      `${LEVELS[level.levelIndex].name} — all ${LEVELS[level.levelIndex].differences.length} differences found.`,
      `Level score ${level.levelScore}  ·  Total ${state.totalScore}  ·  Best combo x${level.bestCombo}`,
      `Next: ${next.name} — ${next.differences.length} differences, ${formatTime(next.timeLimitS)} on the clock.`,
      '',
      'Click anywhere or press Enter for the next room',
    ], '#7ae08a');
  } else if (state.screen === SCREEN_WIN) {
    const total = LEVELS.reduce((n, l) => n + l.differences.length, 0);
    drawOverlay(ctx, 'YOU FOUND THEM ALL!', [
      `All ${total} differences across three rooms.`,
      `Final score ${state.totalScore}  ·  Wrong clicks ${state.level.wrongClicks}  ·  Hints used ${state.level.hintsUsed}`,
      'A true eagle eye. Play again to beat your score.',
      '',
      'Click anywhere or press Enter to play again',
    ], '#ffd94d');
  } else if (state.screen === SCREEN_OVER) {
    const level = state.level;
    const meta = LEVELS[level.levelIndex];
    const missed = meta.differences.filter((d, i) => !level.found[i]).map((d) => d.name);
    const shown = missed.slice(0, 6);
    const rest = missed.length - shown.length;
    drawOverlay(ctx, "TIME'S UP!", [
      `${meta.name}: you found ${foundCount(level)} of ${meta.differences.length}.`,
      `You missed: ${shown.join(' · ')}${rest > 0 ? ` — and ${rest} more` : ''}`,
      '',
      'Click anywhere or press R to try this room again',
    ], '#ff5a5a');
  }
  ctx.restore();
}
