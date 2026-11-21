// Shared constants for "Three Curious Rooms": a spot-the-difference game in
// three hand-drawn rooms. A panel is one picture; both panels draw the same
// room at this size, so a difference's coordinates are identical on each side.
// The right panel draws the room with each listed spot changed.
export const PANEL_W = 600;
export const PANEL_H = 480;
export const CANVAS_W = 1280;
export const CANVAS_H = 800;

// Layout of the 1280x800 frame, in canvas pixels.
export const LAYOUT = {
  headerH: 68,
  panelY: 84,
  panelGap: 32,
  leftX: 24,
  rightX: 656,
  footerY: 584,
};

// How long a wrong-click cross stays on screen, and its time cost.
export const WRONG_MARK_MS = 700;
export const WRONG_TIME_COST_S = 5;
export const HINT_TIME_COST_S = 15;
export const HINTS_PER_LEVEL = 3;
export const POINTS_PER_FIND = 100;
export const COMBO_BONUS = 25;
export const TIME_BONUS_PER_SECOND = 10;

// A difference is a named, fair, clickable spot: { x, y, r, name } in panel
// coordinates. The scene painter draws the change for that spot on the
// right panel only, at the same coordinates.
export const LEVELS = [
  {
    id: 'kitchen',
    name: 'Sunny Kitchen',
    subtitle: 'Morning light, a kettle, and one very smug cat',
    timeLimitS: 180,
    difficulty: 'Easy',
    differences: [
      { x: 105, y: 80, r: 30, name: 'Sun rays' },
      { x: 480, y: 72, r: 28, name: 'Clock hands' },
      { x: 300, y: 122, r: 22, name: 'Flower on the plant' },
      { x: 235, y: 288, r: 24, name: 'Apple in the bowl' },
      { x: 490, y: 282, r: 26, name: 'Kettle steam' },
      { x: 85, y: 390, r: 26, name: "Cat's tail" },
      { x: 300, y: 448, r: 30, name: 'Rug stripes' },
      { x: 395, y: 62, r: 24, name: 'Picture on the wall' },
    ],
  },
  {
    id: 'garden',
    name: 'Night Garden',
    subtitle: 'Fireflies, a frog, and a moon that changed its mind',
    timeLimitS: 150,
    difficulty: 'Medium',
    differences: [
      { x: 90, y: 70, r: 30, name: 'Moon shape' },
      { x: 300, y: 50, r: 16, name: 'Bright star' },
      { x: 490, y: 205, r: 24, name: 'Lantern flame' },
      { x: 180, y: 385, r: 22, name: 'Frog on the lily pad' },
      { x: 350, y: 320, r: 28, name: 'Bench cushion' },
      { x: 520, y: 405, r: 24, name: 'Tulips by the pond' },
      { x: 240, y: 160, r: 16, name: 'Glowing firefly' },
      { x: 430, y: 110, r: 26, name: 'Branch on the old tree' },
      { x: 300, y: 420, r: 30, name: 'Ripples on the pond' },
      { x: 55, y: 300, r: 26, name: 'Garden gate' },
    ],
  },
  {
    id: 'bookshop',
    name: 'Old Bookshop',
    subtitle: 'Dust, ink, and twelve things out of place',
    timeLimitS: 120,
    difficulty: 'Hard',
    differences: [
      { x: 120, y: 130, r: 26, name: 'Lamp shade' },
      { x: 480, y: 150, r: 30, name: 'Globe' },
      { x: 300, y: 250, r: 22, name: 'Ladder rung' },
      { x: 200, y: 400, r: 22, name: "Cat's ear" },
      { x: 420, y: 220, r: 18, name: 'Red book spine' },
      { x: 540, y: 60, r: 24, name: 'Wall clock' },
      { x: 360, y: 385, r: 20, name: 'Quill in the inkpot' },
      { x: 180, y: 90, r: 22, name: 'Portrait eyes' },
      { x: 440, y: 385, r: 20, name: 'Teacup steam' },
      { x: 120, y: 385, r: 26, name: 'Stack of books' },
      { x: 520, y: 210, r: 26, name: 'Window curtain' },
      { x: 300, y: 445, r: 28, name: 'Rug motif' },
    ],
  },
];
