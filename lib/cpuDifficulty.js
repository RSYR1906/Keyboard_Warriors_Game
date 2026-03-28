// ============================================================
// CPU Difficulty Configurations
// ============================================================

// ── Story Mode: per-stage scaling ───────────────────────────
export const CPU_STAGES = [
  { stage: 1,  wpm: 25, accuracy: 0.92, title: "The Awakening" },
  { stage: 2,  wpm: 30, accuracy: 0.93, title: "The Forest Path" },
  { stage: 3,  wpm: 37, accuracy: 0.94, title: "The Dark Cavern" },
  { stage: 4,  wpm: 44, accuracy: 0.95, title: "The Ruined Bridge" },
  { stage: 5,  wpm: 52, accuracy: 0.95, title: "The Sorcerer's Tower" },
  { stage: 6,  wpm: 58, accuracy: 0.96, title: "The Frozen Wastes" },
  { stage: 7,  wpm: 65, accuracy: 0.96, title: "The Labyrinth of Echoes" },
  { stage: 8,  wpm: 72, accuracy: 0.97, title: "The Volcanic Forge" },
  { stage: 9,  wpm: 80, accuracy: 0.97, title: "The Shadow Realm" },
  { stage: 10, wpm: 90, accuracy: 0.98, title: "The Throne of the Tyrant" },
];

// ── Word Mode: difficulty → CPU config ──────────────────────
export const WORD_MODE_CPU = {
  easy:   { wpm: 35, accuracy: 0.89 },
  medium: { wpm: 55, accuracy: 0.94 },
  hard:   { wpm: 80, accuracy: 0.98 },
};

// ── Sentence Mode: difficulty → CPU config ──────────────────
// Slightly lower WPM than Word Mode (sustained typing on longer text)
export const SENTENCE_MODE_CPU = {
  easy:   { wpm: 30, accuracy: 0.86 },
  medium: { wpm: 50, accuracy: 0.92 },
  hard:   { wpm: 72, accuracy: 0.97 },
};

// ── HP & Damage Constants ───────────────────────────────────
export const MAX_HP = 100;
export const FIXED_ROUND_DAMAGE = 34; // Sentence mode: ~3 rounds to win
export const BASE_DAMAGE = 15;        // Base damage for word/story mode

// ── Get CPU config for any mode ─────────────────────────────
export function getCpuConfig(mode, { stage, difficulty }) {
  if (mode === "story") {
    return CPU_STAGES[stage - 1] || CPU_STAGES[0];
  }
  if (mode === "word") {
    return WORD_MODE_CPU[difficulty] || WORD_MODE_CPU.medium;
  }
  if (mode === "sentence") {
    return SENTENCE_MODE_CPU[difficulty] || SENTENCE_MODE_CPU.medium;
  }
  return { wpm: 40, accuracy: 0.90 };
}
