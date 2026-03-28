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
  // Characters in the text
  const charCount = text.length;

  // Standard: 5 chars = 1 word
  const wordCount = charCount / 5;

  // Time in ms the CPU takes to "type" at the given WPM
  const baseTime = (wordCount / wpm) * 60000;

  // Add a small random delay (0.3s–1.2s) to simulate "reaction time"
  const reactionDelay = 300 + Math.random() * 900;

  // Add slight variance (±10%) to make it feel natural
  const variance = baseTime * (0.9 + Math.random() * 0.2);

  const totalTime = variance + reactionDelay;

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
