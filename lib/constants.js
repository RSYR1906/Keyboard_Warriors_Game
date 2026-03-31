// ============================================================
// Shared constants used across multiple pages / components
// ============================================================

/** localStorage key for the player's display name. */
export const PLAYER_NAME_KEY = "typebattle_player_name";

// ── Endless Mode ─────────────────────────────────────────────
/** Starting time in seconds for endless battle. */
export const ENDLESS_START_TIME_S = 60;
/** Seconds added when a word is typed correctly (100 % accuracy). */
export const ENDLESS_CORRECT_BONUS_S = 5;
/** Seconds deducted when a word is typed incorrectly. */
export const ENDLESS_WRONG_PENALTY_S = 3;
/** Minimum accuracy required to count as "correct" in endless mode. */
export const ENDLESS_ACCURACY_THRESHOLD = 100;
