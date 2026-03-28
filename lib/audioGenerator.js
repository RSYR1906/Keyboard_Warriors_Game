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
//  War Menu Music — epic orchestral battle march
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * SpaceMenuBGM — (now epic war theme) aggressive battle march for the landing page.
 *
 * Layers:
 * 1. War drums — pounding kick + snare pattern at 130 BPM
 * 2. Power bass riff — driving sawtooth root notes (Dm)
 * 3. Brass fanfare chord stabs — Dm → Bb → C → Dm progression
 * 4. Heroic horn melody — soaring lead over the progression
 * 5. Battle cry noise bursts — filtered noise impacts on downbeats
 * 6. String tremolo — fast trembling sustain for tension
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

  start(volume = 0.22) {
    if (this.isPlaying) return;
    this.isPlaying = true;
    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Fade in
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(volume, now + 1.5);

    // Layer 1: War drums
    this._startWarDrums();

    // Layer 2: Power bass riff
    this._startPowerBass();

    // Layer 3: Brass chord stabs
    this._startBrassChords();

    // Layer 4: Heroic horn melody
    this._startHornMelody();

    // Layer 5: Battle cry noise hits
    this._startBattleCry();

    // Layer 6: String tremolo tension
    this._startStringTremolo();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    const now = this.ctx.currentTime;

    this.masterGain.gain.linearRampToValueAtTime(0, now + 0.8);

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
    }, 1000);
  }

  // ── Layer 1: War drums — kick + snare + tom fills ────────
  _startWarDrums() {
    const ctx = this.ctx;
    const bpm = 130;
    const beat = (60 / bpm) * 1000;
    // Pattern over 8 8th-notes:
    // kick on 1, 3, 5, 7; snare on 3, 7; tom fill on 8
    const kickPattern =  [1.0, 0, 0.7, 0, 0.9, 0, 0.6, 0];
    const snarePattern = [0, 0, 0.8, 0, 0, 0, 1.0, 0];
    const tomPattern =   [0, 0, 0, 0, 0, 0, 0, 0.5];
    let step = 0;

    const play = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;
      const idx = step % 8;

      // Kick — low sine sweep
      if (kickPattern[idx] > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.15);
        gain.gain.setValueAtTime(kickPattern[idx] * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain).connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.3);
      }

      // Snare — noise burst + body
      if (snarePattern[idx] > 0) {
        const vol = snarePattern[idx] * 0.3;
        // Noise
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 2000;
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        src.connect(hp).connect(g).connect(this.masterGain);
        src.start(now);
        // Body tone
        const osc = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = 180;
        g2.gain.setValueAtTime(vol * 0.6, now);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(g2).connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
      }

      // Tom — mid pitched drum
      if (tomPattern[idx] > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(tomPattern[idx] * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain).connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.3);
      }

      step++;
    };

    play();
    const id = setInterval(play, beat / 2);
    this.intervals.push(id);
  }

  // ── Layer 2: Driving power bass ──────────────────────────
  _startPowerBass() {
    const ctx = this.ctx;
    const bpm = 130;
    const beat = (60 / bpm) * 1000;
    // Dm → Bb → C → Dm (each chord = 2 beats = 4 8ths)
    // Bass notes: D2, Bb1, C2, D2
    const bassNotes = [73.42, 73.42, 73.42, 73.42, 58.27, 58.27, 58.27, 58.27,
                       65.41, 65.41, 65.41, 65.41, 73.42, 73.42, 73.42, 73.42];
    // Rhythm emphasis: 8th-note pattern with octave jumps
    const rhythm = [1.0, 0, 0.6, 0.4, 1.0, 0, 0.6, 0.4,
                    1.0, 0, 0.6, 0.4, 1.0, 0, 0.6, 0.4];
    let step = 0;

    const play = () => {
      if (!this.isPlaying) return;
      const idx = step % 16;
      if (rhythm[idx] > 0) {
        const now = ctx.currentTime;
        const freq = bassNotes[idx];
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = freq;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 300;
        filter.Q.value = 3;

        const vol = rhythm[idx] * 0.18;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(filter).connect(gain).connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.25);
      }
      step++;
    };

    play();
    const id = setInterval(play, beat / 2);
    this.intervals.push(id);
  }

  // ── Layer 3: Brass chord stabs ───────────────────────────
  _startBrassChords() {
    const ctx = this.ctx;
    const bpm = 130;
    const halfBar = (60 / bpm) * 2 * 1000; // 2 beats
    // Dm → Bb → C → Dm
    const chords = [
      [146.83, 174.61, 220.0, 293.66],   // Dm: D3 F3 A3 D4
      [116.54, 146.83, 174.61, 233.08],   // Bb: Bb2 D3 F3 Bb3
      [130.81, 164.81, 196.0, 261.63],    // C: C3 E3 G3 C4
      [146.83, 174.61, 220.0, 293.66],    // Dm: D3 F3 A3 D4
    ];
    let step = 0;

    const play = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;
      const chord = chords[step % 4];

      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = freq;
        osc.detune.value = (i - 1.5) * 5; // slight spread

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1800, now);
        filter.frequency.exponentialRampToValueAtTime(600, now + 0.5);
        filter.Q.value = 1.5;

        // Punchy envelope
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.09, now + 0.02);
        gain.gain.setValueAtTime(0.07, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(filter).connect(gain).connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.8);
      });

      step++;
    };

    // Start after 1 bar (4 beats)
    const t = setTimeout(() => {
      if (!this.isPlaying) return;
      play();
      const id = setInterval(play, halfBar);
      this.intervals.push(id);
    }, (60 / bpm) * 4 * 1000);
    this.timeouts.push(t);
  }

  // ── Layer 4: Heroic horn melody ──────────────────────────
  _startHornMelody() {
    const ctx = this.ctx;
    const bpm = 130;
    const beat = (60 / bpm) * 1000;
    // Epic melody in D minor — each entry is [freq, durationInBeats]
    const melody = [
      [293.66, 1], [349.23, 1], [440.0, 2],           // D4 F4 A4—
      [392.0, 1], [349.23, 0.5], [293.66, 0.5], [329.63, 2],  // G4 F4 D4 E4—
      [293.66, 1], [349.23, 1], [440.0, 1], [523.25, 1], // D4 F4 A4 C5
      [587.33, 2], [523.25, 1], [440.0, 1],            // D5— C5 A4
      [349.23, 1.5], [329.63, 0.5], [293.66, 2],       // F4— E4 D4—
      [0, 2],                                           // rest
    ];

    let noteIdx = 0;

    const playNote = () => {
      if (!this.isPlaying) return;
      const [freq, dur] = melody[noteIdx % melody.length];
      const noteMs = dur * beat;

      if (freq > 0) {
        const now = ctx.currentTime;
        const durSec = (dur * 60) / bpm;

        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc2.type = "square";
        osc.frequency.value = freq;
        osc2.frequency.value = freq;
        osc2.detune.value = 7;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 1500;
        filter.Q.value = 1;

        // Horn-like envelope: attack, sustain, release
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.04);
        gain.gain.setValueAtTime(0.06, now + durSec * 0.3);
        gain.gain.linearRampToValueAtTime(0.001, now + durSec + 0.05);

        const mix = ctx.createGain();
        mix.gain.value = 0.5;
        osc2.connect(mix);

        osc.connect(filter);
        mix.connect(filter);
        filter.connect(gain).connect(this.masterGain);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + durSec + 0.1);
        osc2.stop(now + durSec + 0.1);
      }

      noteIdx++;
      const t = setTimeout(playNote, noteMs);
      this.timeouts.push(t);
    };

    // Melody enters after 2 bars
    const t = setTimeout(() => {
      if (!this.isPlaying) return;
      playNote();
    }, (60 / bpm) * 8 * 1000);
    this.timeouts.push(t);
  }

  // ── Layer 5: Battle cry noise impacts on strong beats ────
  _startBattleCry() {
    const ctx = this.ctx;
    const bpm = 130;
    const barMs = (60 / bpm) * 4 * 1000;

    const hit = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;

      // Filtered noise burst
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
      const src = ctx.createBufferSource();
      src.buffer = buf;

      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 800 + Math.random() * 600;
      bp.Q.value = 2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      src.connect(bp).connect(gain).connect(this.masterGain);
      src.start(now);
    };

    // Hit every 2 bars
    const t = setTimeout(() => {
      if (!this.isPlaying) return;
      hit();
      const id = setInterval(hit, barMs * 2);
      this.intervals.push(id);
    }, barMs);
    this.timeouts.push(t);
  }

  // ── Layer 6: String tremolo for tension ──────────────────
  _startStringTremolo() {
    const ctx = this.ctx;
    // D minor chord sustained with fast tremolo
    const freqs = [293.66, 349.23, 440.0]; // D4 F4 A4

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq * 2; // octave up for brightness
      osc.detune.value = (i - 1) * 8;

      // Fast tremolo LFO
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 8; // fast trembling
      lfoGain.gain.value = 0.015;
      lfo.connect(lfoGain).connect(gain.gain);
      lfo.start();

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 2000;
      filter.Q.value = 0.5;

      gain.gain.value = 0.025;
      osc.connect(filter).connect(gain).connect(this.masterGain);
      osc.start();
      this.nodes.push(osc, lfo);
    });
  }
}
