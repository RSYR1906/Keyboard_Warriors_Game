// ============================================================
// Damage Calculation Engine
// ============================================================

import { BASE_DAMAGE, FIXED_ROUND_DAMAGE } from "@/lib/cpuDifficulty";

/**
 * Calculate damage dealt based on mode and typing performance.
 *
 * - Sentence Mode: fixed damage (winner takes the round, not HP-based)
 * - Word Mode:     damage scales with WPM and accuracy
 * - Story Mode:    damage scales with WPM and accuracy
 *
 * @param {string} mode         - "story" | "sentence" | "word"
 * @param {Object} stats
 * @param {number} stats.wpm      - typing speed
 * @param {number} stats.accuracy - accuracy percentage (0–100)
 * @returns {number} damage amount
 */
export function calcDamage(mode, { wpm, accuracy }) {
  if (mode === "sentence") {
    return FIXED_ROUND_DAMAGE;
  }

  // Damage formula: base + (WPM bonus) × accuracy multiplier
  // WPM bonus: every 10 WPM above 20 adds 3 damage
  const wpmBonus = Math.max(0, (wpm - 20) / 10) * 3;

  // Accuracy multiplier: 100% = 1.5x, 80% = 1.0x, below 60% = 0.5x
  const accMultiplier = Math.max(0.5, (accuracy / 100) * 1.5);

  const damage = Math.round((BASE_DAMAGE + wpmBonus) * accMultiplier);

  return Math.max(1, damage); // minimum 1 damage
}

/**
 * Determine the winner of a round based on who typed faster with sufficient accuracy.
 *
 * @param {Object} player - { wpm, accuracy, completionTime }
 * @param {Object} cpu    - { wpm, accuracy, completionTime }
 * @returns {"player" | "cpu"}
 */
export function determineRoundWinner(player, cpu) {
  // If player finished but CPU hasn't (or vice versa) — finished player wins
  // If both finished, faster completion time wins
  // Tie-break: higher accuracy wins
  if (player.completionTime <= cpu.completionTime) {
    return "player";
  }
  if (cpu.completionTime < player.completionTime) {
    return "cpu";
  }
  // Exact tie (extremely rare): accuracy tiebreak
  return player.accuracy >= cpu.accuracy ? "player" : "cpu";
}
