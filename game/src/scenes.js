// The three rooms of "Three Curious Rooms", drawn with plain canvas paths.
// drawScene(ctx, levelIndex, side) paints one panel in panel coordinates
// (600x480). side 0 is the picture as it is; side 1 is the same room with
// every difference of that level changed. A difference's spot always sits
// on the element it names, at the coordinates config.js lists for it.
import { LEVELS } from './config.js';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function ell(ctx, cx, cy, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function line(ctx, x0, y0, x1, y1) {
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
}

/** A little steam curl above (x, y): three wavy strokes. */
function steam(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + i * 10, y + 8);
    ctx.bezierCurveTo(x + i * 10 - 6, y, x + i * 10 + 6, y - 6, x + i * 10, y - 14);
    ctx.stroke();
  }
  ctx.restore();
}

/** Clock face at (x, y) with the hands at hour h and minute m (24h numbers). */
function clockFace(ctx, x, y, r, hour, minute) {
  ctx.save();
  circle(ctx, x, y, r);
  ctx.fillStyle = '#fffdf5';
  ctx.fill();
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 3;
  ctx.stroke();
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    line(ctx, x + Math.cos(a) * (r - 4), y + Math.sin(a) * (r - 4), x + Math.cos(a) * (r - 8), y + Math.sin(a) * (r - 8));
  }
  const ha = (((hour % 12) + minute / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  const ma = (minute / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.lineWidth = 4;
  line(ctx, x, y, x + Math.cos(ha) * r * 0.5, y + Math.sin(ha) * r * 0.5);
  ctx.lineWidth = 3;
  line(ctx, x, y, x + Math.cos(ma) * r * 0.78, y + Math.sin(ma) * r * 0.78);
  circle(ctx, x, y, 3);
  ctx.fillStyle = '#2b2b2b';
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------- kitchen

function drawKitchen(ctx, side) {
  const R = side === 1; // the right panel: every difference changed
  // Wall and floor.
  ctx.fillStyle = '#f6e7c8';
  ctx.fillRect(0, 0, 600, 400);
  ctx.fillStyle = '#c99a63';
  ctx.fillRect(0, 400, 600, 80);
  ctx.strokeStyle = '#a87c4c';
  ctx.lineWidth = 2;
  for (let y = 420; y < 480; y += 20) line(ctx, 0, y, 600, y);
  // Window with the sun.
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(28, 22, 186, 146);
  ctx.fillStyle = '#aed8f0';
  ctx.fillRect(36, 30, 170, 130);
  ctx.fillStyle = '#f7c948';
  circle(ctx, 105, 80, 24);
  ctx.fill();
  if (!R) {
    ctx.strokeStyle = '#f7c948';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      line(ctx, 105 + Math.cos(a) * 30, 80 + Math.sin(a) * 30, 105 + Math.cos(a) * 40, 80 + Math.sin(a) * 40);
    }
  }
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 5;
  line(ctx, 121, 30, 121, 160);
  line(ctx, 36, 95, 206, 95);
  // Curtains.
  ctx.fillStyle = '#c0392b';
  ctx.fillRect(22, 18, 22, 150);
  ctx.fillRect(198, 18, 22, 150);
  ctx.fillStyle = '#f6e7c8';
  ctx.fillRect(28, 168, 186, 8);
  // Wall clock: 9:00 on the left, 3:30 on the right.
  clockFace(ctx, 480, 72, 28, R ? 3 : 9, R ? 30 : 0);
  // Picture: a boat on the left, a sun over hills on the right.
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(348, 28, 94, 68);
  ctx.fillStyle = '#dceefb';
  ctx.fillRect(354, 34, 82, 56);
  if (!R) {
    ctx.fillStyle = '#2e6fb0';
    ctx.fillRect(354, 66, 82, 24);
    ctx.fillStyle = '#6b4a2f';
    poly(ctx, [[372, 66], [418, 66], [410, 78], [380, 78]]);
    ctx.fill();
    ctx.fillStyle = '#f2e8d0';
    poly(ctx, [[388, 64], [388, 40], [410, 64]]);
    ctx.fill();
  } else {
    ctx.fillStyle = '#f7c948';
    circle(ctx, 395, 52, 12);
    ctx.fill();
    ctx.fillStyle = '#5a8a3c';
    poly(ctx, [[354, 90], [380, 62], [406, 90]]);
    ctx.fill();
    poly(ctx, [[384, 90], [412, 66], [436, 90]]);
    ctx.fill();
  }
  // Plant on the sill, with a red flower on the left only.
  ctx.fillStyle = '#b5651d';
  poly(ctx, [[282, 150], [318, 150], [312, 176], [288, 176]]);
  ctx.fill();
  ctx.strokeStyle = '#3d7a2e';
  ctx.lineWidth = 4;
  line(ctx, 300, 150, 288, 128);
  line(ctx, 300, 150, 300, 122);
  line(ctx, 300, 150, 312, 130);
  ctx.fillStyle = '#3d7a2e';
  ell(ctx, 286, 126, 12, 6);
  ctx.fill();
  ell(ctx, 314, 128, 12, 6);
  ctx.fill();
  if (!R) {
    ctx.fillStyle = '#d43d2a';
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      circle(ctx, 300 + Math.cos(a) * 7, 118 + Math.sin(a) * 7, 5);
      ctx.fill();
    }
    ctx.fillStyle = '#f7c948';
    circle(ctx, 300, 118, 4);
    ctx.fill();
  }
  // Table, teapot, mugs and the fruit bowl.
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(110, 300, 380, 16);
  ctx.fillRect(130, 316, 14, 104);
  ctx.fillRect(456, 316, 14, 104);
  ctx.fillStyle = '#5a7a9a';
  ell(ctx, 365, 302, 22, 19);
  ctx.fill();
  ctx.fillStyle = '#4a6a8a';
  circle(ctx, 365, 282, 5);
  ctx.fill();
  poly(ctx, [[384, 296], [400, 282], [398, 298], [384, 304]]);
  ctx.fill();
  ctx.strokeStyle = '#4a6a8a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(344, 300, 9, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  ctx.fillStyle = '#e8e0d0';
  rr(ctx, 296, 306, 22, 18, 3);
  ctx.fill();
  rr(ctx, 326, 306, 22, 18, 3);
  ctx.fill();
  // Fruit bowl: the red apple sits on top on the left only.
  ctx.fillStyle = '#2e6fb0';
  ell(ctx, 235, 300, 34, 12);
  ctx.fill();
  ctx.fillStyle = '#e8a33d';
  circle(ctx, 222, 292, 10);
  ctx.fill();
  ctx.fillStyle = '#7a4a9a';
  circle(ctx, 248, 292, 10);
  ctx.fill();
  if (!R) {
    ctx.fillStyle = '#d43d2a';
    circle(ctx, 235, 280, 11);
    ctx.fill();
    ctx.strokeStyle = '#3d7a2e';
    ctx.lineWidth = 3;
    line(ctx, 235, 270, 240, 262);
  }
  // Stove and kettle, steaming on the left only.
  ctx.fillStyle = '#3a3f4a';
  ctx.fillRect(468, 330, 96, 70);
  ctx.fillStyle = '#22252c';
  ctx.fillRect(478, 340, 76, 8);
  ctx.fillStyle = '#c0c8d0';
  ell(ctx, 490, 312, 24, 16);
  ctx.fill();
  poly(ctx, [[512, 306], [526, 300], [522, 314], [512, 314]]);
  ctx.fill();
  ctx.strokeStyle = '#c0c8d0';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(472, 306, 10, Math.PI * 0.6, Math.PI * 1.6);
  ctx.stroke();
  if (!R) steam(ctx, 490, 282);
  // Chair and cat: tail up on the left, curled down on the right.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(58, 350, 10, 70);
  ctx.fillRect(108, 350, 10, 70);
  ctx.fillRect(54, 344, 68, 10);
  ctx.fillStyle = '#e8a33d';
  ell(ctx, 86, 372, 26, 20);
  ctx.fill();
  circle(ctx, 86, 344, 16);
  ctx.fill();
  poly(ctx, [[74, 334], [78, 316], [86, 330]]);
  ctx.fill();
  poly(ctx, [[88, 330], [96, 316], [100, 334]]);
  ctx.fill();
  ctx.fillStyle = '#2b2b2b';
  circle(ctx, 80, 342, 2);
  ctx.fill();
  circle(ctx, 92, 342, 2);
  ctx.fill();
  ctx.strokeStyle = '#e8a33d';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (!R) {
    ctx.moveTo(108, 380);
    ctx.quadraticCurveTo(128, 370, 122, 344);
  } else {
    ctx.moveTo(108, 382);
    ctx.quadraticCurveTo(126, 392, 110, 398);
  }
  ctx.stroke();
  // Rug: three stripes on the left, two on the right.
  ctx.fillStyle = '#a03028';
  ell(ctx, 300, 448, 115, 20);
  ctx.fill();
  ctx.fillStyle = '#f2e8d0';
  ell(ctx, 300, 448, 88, 14);
  ctx.fill();
  ctx.fillStyle = '#a03028';
  ell(ctx, 300, 448, 58, 9);
  ctx.fill();
  if (!R) {
    ctx.fillStyle = '#f2e8d0';
    ell(ctx, 300, 448, 28, 5);
    ctx.fill();
  }
}

// ---------------------------------------------------------------- garden

function drawGarden(ctx, side) {
  const R = side === 1;
  // Night sky, stars and the moon.
  ctx.fillStyle = '#0e1838';
  ctx.fillRect(0, 0, 600, 480);
  ctx.fillStyle = '#f2e8d0';
  const stars = [[60, 130], [150, 40], [210, 90], [260, 30], [360, 90], [410, 40], [470, 130], [540, 60], [180, 200], [330, 130], [520, 260], [40, 220]];
  for (const [x, y] of stars) {
    circle(ctx, x, y, 2);
    ctx.fill();
  }
  if (!R) {
    ctx.save();
    ctx.translate(300, 50);
    ctx.fillStyle = '#ffffff';
    poly(ctx, [[0, -10], [2, -2], [10, 0], [2, 2], [0, 10], [-2, 2], [-10, 0], [-2, -2]]);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#f5e9b8';
  circle(ctx, 90, 70, 26);
  ctx.fill();
  if (R) {
    // A crescent: the sky bites a circle out of the disc.
    ctx.fillStyle = '#0e1838';
    circle(ctx, 102, 64, 24);
    ctx.fill();
  } else {
    ctx.fillStyle = '#d8c88f';
    circle(ctx, 82, 64, 4);
    ctx.fill();
    circle(ctx, 96, 78, 3);
    ctx.fill();
  }
  // The old tree, with an extra branch on the left.
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  line(ctx, 450, 420, 452, 200);
  line(ctx, 452, 260, 500, 200);
  line(ctx, 452, 300, 410, 240);
  if (!R) {
    line(ctx, 451, 150, 420, 108);
    ctx.fillStyle = '#1d4d2b';
    circle(ctx, 418, 104, 18);
    ctx.fill();
  }
  ctx.fillStyle = '#1d4d2b';
  circle(ctx, 452, 170, 46);
  ctx.fill();
  circle(ctx, 500, 200, 36);
  ctx.fill();
  circle(ctx, 408, 210, 34);
  ctx.fill();
  // Pond with ripples on the left only.
  ctx.fillStyle = '#1d4e6b';
  ell(ctx, 300, 420, 150, 32);
  ctx.fill();
  ctx.strokeStyle = '#7fb3d5';
  ctx.lineWidth = 2;
  if (!R) {
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.ellipse(300, 420, 40 + i * 30, 10 + i * 6, 0, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }
  }
  // Lily pads and the frog, present on the left only.
  ctx.fillStyle = '#2e7d32';
  ell(ctx, 150, 392, 26, 8);
  ctx.fill();
  ell(ctx, 212, 398, 22, 7);
  ctx.fill();
  if (!R) {
    ctx.fillStyle = '#4caf50';
    ell(ctx, 180, 382, 16, 12);
    ctx.fill();
    circle(ctx, 172, 368, 7);
    ctx.fill();
    circle(ctx, 188, 368, 7);
    ctx.fill();
    ctx.fillStyle = '#1b1b1b';
    circle(ctx, 172, 367, 2);
    ctx.fill();
    circle(ctx, 188, 367, 2);
    ctx.fill();
  }
  // Bench with a cushion: red on the left, blue on the right.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(310, 330, 90, 10);
  ctx.fillRect(318, 340, 8, 60);
  ctx.fillRect(384, 340, 8, 60);
  ctx.fillRect(306, 306, 8, 30);
  ctx.fillRect(398, 306, 8, 30);
  ctx.fillStyle = R ? '#2e6fb0' : '#c0392b';
  rr(ctx, 316, 306, 78, 18, 6);
  ctx.fill();
  // Lantern post: flame and glow on the left, dark on the right.
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 5;
  line(ctx, 490, 260, 490, 178);
  ctx.fillStyle = '#2b2b2b';
  rr(ctx, 476, 168, 28, 34, 4);
  ctx.fill();
  if (!R) {
    ctx.fillStyle = 'rgba(247, 201, 72, 0.25)';
    circle(ctx, 490, 185, 30);
    ctx.fill();
    ctx.fillStyle = '#f7c948';
    ell(ctx, 490, 186, 6, 10);
    ctx.fill();
  }
  // Fireflies: one glows on the left and sits dark on the right.
  const flies = [[150, 120], [240, 160], [330, 110], [400, 160], [90, 260]];
  for (const [x, y] of flies) {
    const hot = x === 240 && y === 160;
    if (hot && R) {
      ctx.fillStyle = '#5a5a4a';
      circle(ctx, x, y, 2);
      ctx.fill();
      continue;
    }
    ctx.fillStyle = 'rgba(220, 255, 120, 0.25)';
    circle(ctx, x, y, 10);
    ctx.fill();
    ctx.fillStyle = '#dcff78';
    circle(ctx, x, y, 3);
    ctx.fill();
  }
  // Tulips by the pond: three on the left, two on the right.
  const tulips = [[500, 405], [520, 405], [540, 405]];
  for (let i = 0; i < (R ? 2 : 3); i += 1) {
    const [x, y] = tulips[i];
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 3;
    line(ctx, x, y + 14, x, y - 6);
    ctx.fillStyle = i === 1 ? '#e8a33d' : '#d43d7a';
    circle(ctx, x, y - 8, 7);
    ctx.fill();
  }
  // Garden gate: open on the left, closed on the right.
  ctx.strokeStyle = '#5a4632';
  ctx.lineWidth = 5;
  line(ctx, 20, 260, 20, 340);
  line(ctx, 92, 260, 92, 340);
  line(ctx, 16, 280, 96, 280);
  line(ctx, 16, 320, 96, 320);
  ctx.save();
  ctx.translate(24, 300);
  if (!R) ctx.rotate(-0.35);
  ctx.strokeStyle = '#7a5a3a';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, -18, 62, 36);
  line(ctx, 0, 0, 62, 0);
  ctx.restore();
  // Grass tufts along the bottom.
  ctx.strokeStyle = '#1d4d2b';
  ctx.lineWidth = 3;
  for (const [x, y] of [[40, 470], [140, 462], [260, 472], [380, 464], [470, 470], [560, 462]]) {
    line(ctx, x, y, x - 6, y - 12);
    line(ctx, x, y, x, y - 14);
    line(ctx, x, y, x + 6, y - 12);
  }
}

// ---------------------------------------------------------------- bookshop

function drawBookshop(ctx, side) {
  const R = side === 1;
  // Wall and floor.
  ctx.fillStyle = '#7a5233';
  ctx.fillRect(0, 0, 600, 420);
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(0, 420, 600, 60);
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 2;
  for (let y = 436; y < 480; y += 14) line(ctx, 0, y, 600, y);
  // Bookshelves: three rows of books in a fixed palette.
  const palette = ['#a03028', '#2e6fb0', '#3d7a2e', '#b8860b', '#7a4a9a', '#c06a2e'];
  const rows = [86, 196, 306];
  for (let r = 0; r < 3; r += 1) {
    const top = rows[r];
    ctx.fillStyle = '#5a3a20';
    ctx.fillRect(24, top + 62, 552, 8);
    let x = 30;
    let i = 0;
    while (x < 566) {
      const w = 14 + ((i * 7 + r * 5) % 10);
      const h = 44 + ((i * 11 + r * 3) % 18);
      // The red spine at (420, 220) is blue on the right panel.
      const isTarget = r === 1 && x <= 420 && 420 < x + w;
      ctx.fillStyle = isTarget ? (R ? '#2e6fb0' : '#a03028') : palette[(i + r) % palette.length];
      ctx.fillRect(x, top + 62 - h, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(x, top + 62 - h, 2, h);
      x += w + 2;
      i += 1;
    }
  }
  // Lamp on the desk: green shade on the left, red on the right.
  ctx.strokeStyle = '#2b2b2b';
  ctx.lineWidth = 4;
  line(ctx, 120, 210, 120, 150);
  ctx.fillStyle = '#2b2b2b';
  ell(ctx, 120, 212, 22, 5);
  ctx.fill();
  ctx.fillStyle = R ? '#a03028' : '#3d7a2e';
  poly(ctx, [[100, 150], [140, 150], [132, 118], [108, 118]]);
  ctx.fill();
  ctx.fillStyle = 'rgba(247, 201, 72, 0.3)';
  circle(ctx, 120, 152, 14);
  ctx.fill();
  // Globe on its stand: land on the left, open ocean on the right.
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(476, 176, 8, 22);
  ell(ctx, 480, 202, 20, 4);
  ctx.fill();
  ctx.fillStyle = '#2e6fb0';
  circle(ctx, 480, 150, 26);
  ctx.fill();
  if (!R) {
    ctx.fillStyle = '#3d7a2e';
    ell(ctx, 472, 144, 12, 8);
    ctx.fill();
    ell(ctx, 488, 158, 9, 6);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(480, 150, 26, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
  // Ladder leaning on the shelves: five rungs on the left, four on the right.
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  line(ctx, 282, 384, 312, 120);
  line(ctx, 332, 384, 352, 120);
  ctx.lineWidth = 4;
  for (let i = 0; i < 5; i += 1) {
    if (R && i === 2) continue; // the missing rung
    const y = 150 + i * 46;
    const t = (y - 120) / 264;
    line(ctx, 282 + 30 * t, y, 332 + 20 * t, y);
  }
  // Portrait: eyes look left on the left panel, right on the right.
  ctx.fillStyle = '#b8860b';
  ctx.fillRect(148, 56, 64, 68);
  ctx.fillStyle = '#e8d8b0';
  ctx.fillRect(154, 62, 52, 56);
  ctx.fillStyle = '#d8b890';
  circle(ctx, 180, 88, 14);
  ctx.fill();
  ctx.fillStyle = '#2b2b2b';
  circle(ctx, 174, 86, 2);
  ctx.fill();
  circle(ctx, 186, 86, 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  circle(ctx, 174 + (R ? 1 : -1), 86, 1);
  ctx.fill();
  circle(ctx, 186 + (R ? 1 : -1), 86, 1);
  ctx.fill();
  // Wall clock: noon on the left, six on the right.
  clockFace(ctx, 540, 60, 20, R ? 6 : 12, 0);
  // Desk with inkpot, quill, teacup and the sleeping cat.
  ctx.fillStyle = '#5a3a20';
  ctx.fillRect(80, 384, 440, 12);
  ctx.fillRect(96, 396, 12, 84);
  ctx.fillRect(492, 396, 12, 84);
  // Inkpot and quill: standing in the pot on the left, lying flat on the right.
  ctx.fillStyle = '#1b1b2e';
  ell(ctx, 360, 380, 12, 8);
  ctx.fill();
  ctx.strokeStyle = '#f2e8d0';
  ctx.lineWidth = 3;
  if (!R) {
    ctx.beginPath();
    ctx.moveTo(360, 378);
    ctx.quadraticCurveTo(352, 350, 344, 336);
    ctx.stroke();
    ctx.fillStyle = '#f2e8d0';
    ell(ctx, 344, 334, 5, 12);
    ctx.fill();
  } else {
    line(ctx, 372, 382, 402, 376);
    ctx.fillStyle = '#f2e8d0';
    ell(ctx, 404, 376, 10, 4);
    ctx.fill();
  }
  // Teacup, steaming on the left only.
  ctx.fillStyle = '#e8e0d0';
  ell(ctx, 440, 384, 14, 8);
  ctx.fill();
  ctx.strokeStyle = '#e8e0d0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(454, 382, 6, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  if (!R) steam(ctx, 440, 372);
  // Book stack on the floor: four on the left, three on the right.
  const stack = ['#a03028', '#2e6fb0', '#3d7a2e', '#b8860b'];
  for (let i = 0; i < (R ? 3 : 4); i += 1) {
    ctx.fillStyle = stack[i];
    ctx.fillRect(96, 408 - i * 10, 52 - (i % 2) * 6, 9);
  }
  // The sleeping cat on the rug: both ears up on the left, one folded on the right.
  ctx.fillStyle = '#3a3f4a';
  ell(ctx, 200, 404, 30, 14);
  ctx.fill();
  circle(ctx, 222, 394, 12);
  ctx.fill();
  poly(ctx, [[212, 386], [214, 374], [220, 384]]);
  ctx.fill();
  if (!R) {
    poly(ctx, [[224, 384], [230, 374], [232, 386]]);
    ctx.fill();
  } else {
    poly(ctx, [[226, 386], [234, 380], [232, 390]]);
    ctx.fill();
  }
  ctx.strokeStyle = '#3a3f4a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(172, 408);
  ctx.quadraticCurveTo(156, 414, 158, 402);
  ctx.stroke();
  // Window with its curtain: drawn across on the left, tied back on the right.
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(488, 148, 76, 126);
  ctx.fillStyle = '#0e1838';
  ctx.fillRect(494, 154, 64, 114);
  ctx.fillStyle = '#f5e9b8';
  circle(ctx, 540, 180, 12);
  ctx.fill();
  ctx.fillStyle = '#a03028';
  if (!R) {
    ctx.fillRect(494, 154, 30, 114);
  } else {
    poly(ctx, [[494, 154], [512, 154], [500, 268], [494, 268]]);
    ctx.fill();
  }
  // Rug: a diamond motif on the left, circles on the right.
  ctx.fillStyle = '#5a2e6b';
  ell(ctx, 300, 445, 120, 18);
  ctx.fill();
  ctx.strokeStyle = '#f2e8d0';
  ctx.lineWidth = 2;
  if (!R) {
    for (const dx of [-60, 0, 60]) {
      ctx.save();
      ctx.translate(300 + dx, 445);
      ctx.rotate(Math.PI / 4);
      ctx.strokeRect(-7, -7, 14, 14);
      ctx.restore();
    }
  } else {
    for (const dx of [-60, 0, 60]) {
      circle(ctx, 300 + dx, 445, 7);
      ctx.stroke();
    }
  }
}

/** Paint one panel of level `levelIndex`: side 0 as it is, side 1 changed. */
export function drawScene(ctx, levelIndex, side) {
  ctx.save();
  if (levelIndex === 0) drawKitchen(ctx, side);
  else if (levelIndex === 1) drawGarden(ctx, side);
  else drawBookshop(ctx, side);
  ctx.restore();
}
