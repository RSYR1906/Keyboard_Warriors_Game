// ============================================================
// Typing Engine — WPM & accuracy calculations
// ============================================================

/**
 * Compute words-per-minute.
 * Standard: 1 word = 5 characters (including spaces).
 * @param {number} startTime - timestamp (ms) when typing began
 * @param {number} endTime   - timestamp (ms) when typing ended
 * @param {number} charCount - total characters typed
 * @returns {number} WPM rounded to 1 decimal
 */
export function computeWPM(startTime, endTime, charCount) {
  const elapsedMin = (endTime - startTime) / 60000;
  if (elapsedMin <= 0) return 0;
  const words = charCount / 5;
  return Math.round((words / elapsedMin) * 10) / 10;
}

/**
 * Compute accuracy as a percentage.
 * @param {string} input  - what the user typed
 * @param {string} target - the expected text
 * @returns {number} accuracy 0–100
 */
export function computeAccuracy(input, target) {
  if (!input.length) return 0;
  let correct = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === target[i]) correct++;
  }
  return Math.round((correct / target.length) * 100 * 10) / 10;
}

/**
 * Get per-character correctness array.
 * @param {string} input  - current user input
 * @param {string} target - expected text
 * @returns {Array<'correct'|'incorrect'|'pending'>}
 */
export function getCharStates(input, target) {
  return target.split("").map((char, i) => {
    if (i >= input.length) return "pending";
    return input[i] === char ? "correct" : "incorrect";
  });
}
