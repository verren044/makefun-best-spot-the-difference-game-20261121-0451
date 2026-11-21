// Sound: tiny WebAudio bleeps, generated in code — no sound files, no
// network. Created lazily on the first user gesture; every call is safe
// before that and when the tab has no audio.
let ctx = null;
let muted = false;

function audio() {
  if (ctx === null) {
    try {
      const AC = window.AudioContext ?? window.webkitAudioContext;
      ctx = new AC();
    } catch {
      ctx = undefined;
    }
  }
  return ctx ?? null;
}

/** Resume the context after a user gesture (browsers start it suspended). */
export function unlockAudio() {
  const ac = audio();
  if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function beep(freq, at, dur, type, gain) {
  const ac = audio();
  if (!ac || muted) return;
  try {
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0.0001, ac.currentTime + at);
    amp.gain.exponentialRampToValueAtTime(gain, ac.currentTime + at + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + at + dur);
    osc.connect(amp);
    amp.connect(ac.destination);
    osc.start(ac.currentTime + at);
    osc.stop(ac.currentTime + at + dur + 0.05);
  } catch {
    // Audio is decoration: a failure never breaks the game.
  }
}

/** Two rising notes on a find. */
export function soundFind() {
  beep(660, 0, 0.12, 'sine', 0.18);
  beep(880, 0.09, 0.16, 'sine', 0.18);
}

/** A low buzz on a wrong click. */
export function soundMiss() {
  beep(160, 0, 0.18, 'square', 0.08);
}

/** A soft chime when a hint is used. */
export function soundHint() {
  beep(1180, 0, 0.1, 'sine', 0.1);
  beep(1560, 0.07, 0.14, 'sine', 0.1);
}

/** A little arpeggio on a level complete or a win. */
export function soundWin() {
  beep(523, 0, 0.14, 'sine', 0.16);
  beep(659, 0.12, 0.14, 'sine', 0.16);
  beep(784, 0.24, 0.2, 'sine', 0.16);
  beep(1047, 0.36, 0.28, 'sine', 0.16);
}
