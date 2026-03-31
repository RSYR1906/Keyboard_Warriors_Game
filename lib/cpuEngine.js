// ============================================================
// CPU Simulation Engine
// ============================================================

// ── CPU simulation tuning constants ─────────────────────────
const CHARS_PER_WORD = 5;
const SPEED_VARIANCE = 0.2;       // ±10% (0.9 – 1.1)
const SPEED_BASE = 0.9;           // Lower bound of speed variance
const REACTION_MIN_MS = 300;      // Minimum reaction delay
const REACTION_RANGE_MS = 900;    // Extra random reaction delay range
const ACCURACY_JITTER = 0.05;     // Random accuracy reduction
const SUCCESS_THRESHOLD = 0.8;    // Minimum accuracy to count as "success"

/**
 * Simulate a CPU typing a given text at the specified WPM & accuracy.
 * Returns a Promise that resolves after the simulated typing duration.
 *
 * @param {Object} opts
 * @param {number} opts.wpm       - CPU words per minute
 * @param {number} opts.accuracy  - CPU accuracy (0–1)
 * @param {string} opts.text      - the text to "type"
 * @returns {Promise<{completionTime: number, wpm: number, accuracy: number, success: boolean}>}
 */
export function simulateCPU({ wpm, accuracy, text }) {
  const wordCount = text.length / CHARS_PER_WORD;

  const baseTime = (wordCount / wpm) * 60000;
  const speedFactor = SPEED_BASE + Math.random() * SPEED_VARIANCE;
  const totalTime = baseTime * speedFactor + REACTION_MIN_MS + Math.random() * REACTION_RANGE_MS;

  const simulatedAccuracy = accuracy - (Math.random() * ACCURACY_JITTER);
  const success = simulatedAccuracy >= SUCCESS_THRESHOLD;

  const effectiveWPM = Math.round(wpm * (SPEED_BASE + Math.random() * SPEED_VARIANCE));

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        completionTime: totalTime,
        wpm: effectiveWPM,
        accuracy: Math.round(simulatedAccuracy * 100 * 10) / 10,
        success,
      });
    }, totalTime);
  });
}
