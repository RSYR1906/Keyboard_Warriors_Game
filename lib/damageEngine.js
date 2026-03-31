// ============================================================
// Damage Calculation Engine
// ============================================================

import { BASE_DAMAGE, FIXED_ROUND_DAMAGE } from "@/lib/cpuDifficulty";

// ── Damage formula tuning constants ─────────────────────────
const WPM_THRESHOLD = 20;        // WPM below this yields no bonus
const WPM_BONUS_PER_10 = 3;      // Bonus damage per 10 WPM above threshold
const ACC_FLOOR = 0.5;           // Minimum accuracy multiplier
const ACC_SCALE = 1.5;           // Maximum accuracy multiplier (at 100%)
const COMBO_MAX_BONUS = 0.5;     // Maximum combo bonus (+50%)
const COMBO_DIVISOR = 40;        // Combo streak ÷ this = bonus fraction
const MIN_DAMAGE = 1;

/**
 * Calculate damage dealt based on mode and typing performance.
 *
 * - Sentence Mode: fixed damage (winner takes the round, not HP-based)
 * - Word Mode:     damage scales with WPM, accuracy, and combo
 * - Story Mode:    damage scales with WPM, accuracy, and combo
 *
 * @param {string} mode         - "story" | "sentence" | "word"
 * @param {Object} stats
 * @param {number} stats.wpm      - typing speed
 * @param {number} stats.accuracy - accuracy percentage (0–100)
 * @param {number} [stats.maxCombo=0] - longest combo streak
 * @returns {number} damage amount
 */
export function calcDamage(mode, { wpm, accuracy, maxCombo = 0 }) {
  if (mode === "sentence") {
    return FIXED_ROUND_DAMAGE;
  }

  const wpmBonus = Math.max(0, (wpm - WPM_THRESHOLD) / 10) * WPM_BONUS_PER_10;
  const accMultiplier = Math.max(ACC_FLOOR, (accuracy / 100) * ACC_SCALE);
  const comboBonus = 1 + Math.min(maxCombo / COMBO_DIVISOR, COMBO_MAX_BONUS);

  const damage = Math.round((BASE_DAMAGE + wpmBonus) * accMultiplier * comboBonus);

  return Math.max(MIN_DAMAGE, damage);
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
