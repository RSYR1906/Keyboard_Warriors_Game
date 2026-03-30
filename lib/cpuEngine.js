// ============================================================
// CPU Simulation Engine
// ============================================================

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
  // Standard: 5 chars = 1 word
  const wordCount = text.length / 5;

  // Base time in ms at the given WPM, with ±10% variance + reaction delay
  const baseTime = (wordCount / wpm) * 60000;
  const totalTime = baseTime * (0.9 + Math.random() * 0.2) + 300 + Math.random() * 900;

  // Simulate whether CPU makes enough errors to "fail" (miss accuracy threshold)
  // The CPU "succeeds" if its accuracy is above 80%
  const simulatedAccuracy = accuracy - (Math.random() * 0.05);
  const success = simulatedAccuracy >= 0.8;

  // Compute effective WPM with variance
  const effectiveWPM = Math.round(wpm * (0.9 + Math.random() * 0.2));

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
