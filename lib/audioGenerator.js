// ============================================================
// Audio Generator — synthesize all game sounds with Web Audio API
// ============================================================

/**
 * Create a shared AudioContext (lazily, on first user interaction).
 */
let _ctx = null;
export function getAudioContext() {
  if (!_ctx && typeof window !== "undefined") {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return _ctx;
}

/**
 * Resume the AudioContext (required after user gesture on some browsers).
 */
export function resumeAudioContext() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") ctx.resume();
}

// ── Helper: render a function into an AudioBuffer ────────────
function renderBuffer(ctx, duration, fn) {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(duration * sampleRate);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  fn(data, sampleRate, length);
  return buffer;
}

// ── Helper: play a buffer once ───────────────────────────────
export function playBuffer(ctx, buffer, volume = 0.5) {
  if (!ctx || !buffer) return;
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = volume;
  source.buffer = buffer;
  source.connect(gain).connect(ctx.destination);
  source.start();
  return source;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Sound Effects
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** UI click — short mechanical snap */
export function generateClick(ctx) {
  return renderBuffer(ctx, 0.1, (data, sr) => {
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      const env = Math.exp(-t * 60);
      data[i] =
        (Math.sin(2 * Math.PI * 1800 * t) * 0.3 +
          Math.sin(2 * Math.PI * 3200 * t) * 0.15 +
          (Math.random() * 2 - 1) * 0.1) *
        env;
    }
  });
}

/** Keyboard typing — soft key press */
export function generateTyping(ctx) {
  return renderBuffer(ctx, 0.06, (data, sr) => {
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      const env = Math.exp(-t * 90);
      data[i] =
        (Math.sin(2 * Math.PI * 2400 * t) * 0.15 +
          (Math.random() * 2 - 1) * 0.2) *
        env;
    }
  });
}

/** Sword attack — metallic swoosh */
export function generateAttack(ctx) {
  return renderBuffer(ctx, 0.35, (data, sr) => {
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      const progress = i / data.length;
      // Frequency sweep from high to low (swoosh)
      const freq = 2000 - progress * 1600;
      const env = Math.sin(Math.PI * progress) * Math.exp(-t * 4);
      // Metallic harmonic + noise
      data[i] =
        (Math.sin(2 * Math.PI * freq * t) * 0.25 +
          Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.12 +
          Math.sin(2 * Math.PI * freq * 2.5 * t) * 0.06 +
          (Math.random() * 2 - 1) * 0.15) *
        env;
    }
  });
}

/** Hit impact — deep thud with crunch */
export function generateHit(ctx) {
  return renderBuffer(ctx, 0.4, (data, sr) => {
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      // Low impact thud
      const thud = Math.sin(2 * Math.PI * 80 * t) * Math.exp(-t * 8) * 0.5;
      // Mid crunch
      const crunch =
        Math.sin(2 * Math.PI * 300 * t * (1 + t * 2)) *
        Math.exp(-t * 12) *
        0.3;
      // High transient
      const crack = (Math.random() * 2 - 1) * Math.exp(-t * 25) * 0.4;
      data[i] = thud + crunch + crack;
    }
  });
}

/** Mode select — epic horn blast / chime */
export function generateModeSelect(ctx) {
  return renderBuffer(ctx, 0.6, (data, sr) => {
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      const env =
        Math.min(t * 20, 1) * // attack
        Math.exp(-t * 2.5); // decay
      // Major chord: root + major third + fifth
      const root = Math.sin(2 * Math.PI * 440 * t) * 0.3;
      const third = Math.sin(2 * Math.PI * 554 * t) * 0.2;
      const fifth = Math.sin(2 * Math.PI * 659 * t) * 0.2;
      // Octave shimmer
      const oct = Math.sin(2 * Math.PI * 880 * t) * 0.1 * Math.exp(-t * 5);
      data[i] = (root + third + fifth + oct) * env;
    }
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Background Music Engine
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * EpicBGM — a real-time synthesized battle theme.
 *
 * Uses multiple oscillator layers:
 * 1. Deep bass pulse (war drum feel)
 * 2. Dark pad chord (atmosphere)
 * 3. Rhythmic percussion pattern
 * 4. Melodic arpeggiated lead
 */
export class EpicBGM {
  constructor(ctx) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(ctx.destination);
    this.nodes = [];
    this.intervals = [];
    this.isPlaying = false;
  }

  start(volume = 0.2) {
    if (this.isPlaying) return;
    this.isPlaying = true;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Fade in
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(volume, now + 1.5);

    // ── Layer 1: Bass drone (D minor root) ──────────────
    this._createDrone(73.42, 0.25); // D2
    this._createDrone(110, 0.12); // A2 (fifth)

    // ── Layer 2: Dark pad chord (Dm) ────────────────────
    this._createPad([146.83, 174.61, 220, 293.66], 0.06); // D3, F3, A3, D4

    // ── Layer 3: Rhythmic bass pulse ────────────────────
    this._startBassRhythm();

    // ── Layer 4: Arpeggiated lead melody ────────────────
    this._startArpeggio();

    // ── Layer 5: Atmospheric noise sweep ────────────────
    this._startAtmosphere();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    const now = this.ctx.currentTime;

    // Fade out
    this.masterGain.gain.linearRampToValueAtTime(0, now + 0.5);

    // Clean up after fade
    setTimeout(() => {
      this.nodes.forEach((n) => {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
        try {
          n.disconnect();
        } catch {
          /* already disconnected */
        }
      });
      this.intervals.forEach((id) => clearInterval(id));
      this.nodes = [];
      this.intervals = [];
    }, 600);
  }

  _createDrone(freq, vol) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    gain.gain.value = vol;

    // Slight LFO for movement
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.3;
    lfoGain.gain.value = 2;
    lfo.connect(lfoGain).connect(osc.frequency);
    lfo.start();

    // Low-pass filter for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 200;
    filter.Q.value = 2;

    osc.connect(filter).connect(gain).connect(this.masterGain);
    osc.start();
    this.nodes.push(osc, lfo);
  }

  _createPad(freqs, vol) {
    const ctx = this.ctx;
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      // Slight detune for richness
      osc.detune.value = (i - 1.5) * 4;
      gain.gain.value = vol;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 800;

      osc.connect(filter).connect(gain).connect(this.masterGain);
      osc.start();
      this.nodes.push(osc);
    });
  }

  _startBassRhythm() {
    const ctx = this.ctx;
    const bpm = 100;
    const beatTime = 60 / bpm;

    // War drum pattern: emphasize beats 1 and 3
    const pattern = [1.0, 0.0, 0.4, 0.0, 0.8, 0.0, 0.3, 0.0]; // 8th notes
    let step = 0;

    const play = () => {
      if (!this.isPlaying) return;
      const vol = pattern[step % pattern.length];
      if (vol > 0) {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(55, now); // A1
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
        gain.gain.setValueAtTime(vol * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain).connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.25);
      }
      step++;
    };

    play();
    const id = setInterval(play, (beatTime / 2) * 1000);
    this.intervals.push(id);
  }

  _startArpeggio() {
    const ctx = this.ctx;
    const bpm = 100;
    const noteTime = (60 / bpm / 2) * 1000; // 8th notes

    // D minor scale notes for arpeggio (D4 F4 A4 D5 A4 F4)
    const notes = [293.66, 349.23, 440, 587.33, 440, 349.23, 293.66, 261.63];
    let step = 0;

    const play = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;
      const freq = notes[step % notes.length];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;

      const env = 0.08;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(env, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 2000;

      osc.connect(filter).connect(gain).connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.3);
      step++;
    };

    // Start arpeggio offset from bass
    setTimeout(() => {
      if (!this.isPlaying) return;
      play();
      const id = setInterval(play, noteTime);
      this.intervals.push(id);
    }, 150);
  }

  _startAtmosphere() {
    const ctx = this.ctx;

    // Filtered noise sweep that cycles slowly
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const noise = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      noise[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 5;

    const gain = ctx.createGain();
    gain.gain.value = 0.03;

    // Sweep the filter frequency
    const sweepLFO = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweepLFO.frequency.value = 0.08;
    sweepGain.gain.value = 500;
    sweepLFO.connect(sweepGain).connect(filter.frequency);
    filter.frequency.value = 800;
    sweepLFO.start();

    source.connect(filter).connect(gain).connect(this.masterGain);
    source.start();
    this.nodes.push(source, sweepLFO);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  Space Menu Music — ethereal cosmic ambient theme
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * SpaceMenuBGM — dreamy, epic space-ambient music for the landing page.
 *
 * Layers:
 * 1. Deep sub-bass drone (E1 + B1) with slow LFO
 * 2. Wide ethereal pad chord (Em9 — E3, G3, B3, D4, F#4)
 * 3. Shimmering high-register arpeggios (pentatonic, triangle wave)
 * 4. Cosmic wind — bandpass-filtered noise with slow sweeps
 * 5. Resonant bell pings — random high-pitched harmonics
 */
export class SpaceMenuBGM {
  constructor(ctx) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(ctx.destination);
    this.nodes = [];
    this.intervals = [];
    this.timeouts = [];
    this.isPlaying = false;
  }

  start(volume = 0.18) {
    if (this.isPlaying) return;
    this.isPlaying = true;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Slow fade in
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(volume, now + 3);

    // Layer 1: Sub-bass drones
    this._createDrone(41.2, 0.22);  // E1
    this._createDrone(61.74, 0.10); // B1

    // Layer 2: Ethereal pad chord (Em9)
    this._createPad([164.81, 196.0, 246.94, 293.66, 369.99], 0.045);

    // Layer 3: Shimmering arpeggio
    this._startArpeggio();

    // Layer 4: Cosmic wind
    this._startCosmicWind();

    // Layer 5: Bell pings
    this._startBellPings();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    const now = this.ctx.currentTime;

    this.masterGain.gain.linearRampToValueAtTime(0, now + 1.2);

    setTimeout(() => {
      this.nodes.forEach((n) => {
        try { n.stop(); } catch { /* ok */ }
        try { n.disconnect(); } catch { /* ok */ }
      });
      this.intervals.forEach((id) => clearInterval(id));
      this.timeouts.forEach((id) => clearTimeout(id));
      this.nodes = [];
      this.intervals = [];
      this.timeouts = [];
    }, 1400);
  }

  // ── Sub-bass drone with slow vibrato ─────────────────────
  _createDrone(freq, vol) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.value = vol;

    // Very slow LFO for gentle drift
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.15;
    lfoGain.gain.value = 1.5;
    lfo.connect(lfoGain).connect(osc.frequency);
    lfo.start();

    // Low-pass for warmth
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 120;
    filter.Q.value = 1;

    osc.connect(filter).connect(gain).connect(this.masterGain);
    osc.start();
    this.nodes.push(osc, lfo);
  }

  // ── Wide ethereal pad with slow amplitude modulation ─────
  _createPad(freqs, vol) {
    const ctx = this.ctx;

    // Shared tremolo LFO for the whole pad
    const tremolo = ctx.createOscillator();
    const tremoloGain = ctx.createGain();
    tremolo.frequency.value = 0.12;
    tremoloGain.gain.value = vol * 0.3;
    tremolo.start();

    freqs.forEach((freq, i) => {
      // Two detuned oscillators per note for width
      [-6, 6].forEach((detuneCents) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.detune.value = detuneCents + (i - 2) * 2;
        gain.gain.value = vol;

        // Connect tremolo to this voice's gain
        const tremNode = ctx.createGain();
        tremNode.gain.value = vol * 0.3;
        tremolo.connect(tremNode).connect(gain.gain);

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 1200 + i * 200;
        filter.Q.value = 0.5;

        osc.connect(filter).connect(gain).connect(this.masterGain);
        osc.start();
        this.nodes.push(osc);
      });
    });
    this.nodes.push(tremolo);
  }

  // ── Shimmering pentatonic arpeggio ───────────────────────
  _startArpeggio() {
    const ctx = this.ctx;
    // E minor pentatonic across two octaves (dreamy register)
    const notes = [
      329.63, 392.0, 493.88, 587.33, 659.25,  // E4 G4 B4 D5 E5
      783.99, 987.77, 1174.66,                  // G5 B5 D6
      987.77, 783.99, 659.25, 587.33, 493.88, 392.0, // descend
    ];
    let step = 0;
    const bpm = 56;
    const noteMs = (60 / bpm) * 1000;

    const play = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;
      const freq = notes[step % notes.length];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;

      // Soft envelope: slow attack, long decay
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.055, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      // High-pass to keep it airy
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 250;

      osc.connect(hp).connect(gain).connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.3);
      step++;
    };

    // Start slightly delayed
    const t = setTimeout(() => {
      if (!this.isPlaying) return;
      play();
      const id = setInterval(play, noteMs);
      this.intervals.push(id);
    }, 2000);
    this.timeouts.push(t);
  }

  // ── Cosmic wind — filtered noise ─────────────────────────
  _startCosmicWind() {
    const ctx = this.ctx;
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    // Bandpass with slow sweep for moving cosmic wind
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 600;
    bp.Q.value = 3;

    const sweepLFO = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweepLFO.frequency.value = 0.04; // very slow
    sweepGain.gain.value = 400;
    sweepLFO.connect(sweepGain).connect(bp.frequency);
    sweepLFO.start();

    const gain = ctx.createGain();
    gain.gain.value = 0.025;

    source.connect(bp).connect(gain).connect(this.masterGain);
    source.start();
    this.nodes.push(source, sweepLFO);
  }

  // ── Resonant bell pings — random sparkle ─────────────────
  _startBellPings() {
    const ctx = this.ctx;
    // Harmonic frequencies (overtone series of E)
    const bellFreqs = [1318.5, 1567.98, 1975.53, 2349.32, 2637.02, 3135.96];

    const ping = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;
      const freq = bellFreqs[Math.floor(Math.random() * bellFreqs.length)];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;

      // Bell-like: fast attack, very long exponential decay
      const vol = 0.02 + Math.random() * 0.025;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3);

      osc.connect(gain).connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 3.2);

      // Schedule next ping at random interval (2–5s)
      const next = 2000 + Math.random() * 3000;
      const t = setTimeout(ping, next);
      this.timeouts.push(t);
    };

    // Start after a short delay
    const t = setTimeout(ping, 3000);
    this.timeouts.push(t);
  }
}
