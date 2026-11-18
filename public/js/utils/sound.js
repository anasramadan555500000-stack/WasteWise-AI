// Subtle Web Audio Chime & Mute Management
let audioCtx = null;

export function isChimeMuted() {
  try {
    return localStorage.getItem('wastewise_chime_muted') === 'true';
  } catch (e) {
    return false;
  }
}

export function setChimeMuted(muted) {
  try {
    localStorage.setItem('wastewise_chime_muted', muted ? 'true' : 'false');
  } catch (e) {}
}

export function toggleChimeMute() {
  const current = isChimeMuted();
  const next = !current;
  setChimeMuted(next);
  return next;
}

/**
 * Plays a pleasant, subtle two-tone notification chime (D5 -> A5)
 * using the browser Web Audio API with zero external assets.
 */
export function playNotificationChime() {
  if (isChimeMuted()) return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Tone 1: 587.33 Hz (D5)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.12, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.23);

    // Tone 2: 880 Hz (A5)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0, now + 0.12);
    gain2.gain.linearRampToValueAtTime(0.15, now + 0.14);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.46);
  } catch (e) {
    // Audio autoplay restrictions or headless environment - gracefully silent
  }
}
