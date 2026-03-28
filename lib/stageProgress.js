// ============================================================
// Stage Progress — localStorage helpers for story mode
// ============================================================

const STORAGE_KEY = "typebattle_stage_progress";

/**
 * Get the highest unlocked stage (1-based).
 * Stage 1 is always unlocked. If a player has beaten stage N,
 * stage N+1 becomes unlocked.
 */
export function getUnlockedStage() {
  if (typeof window === "undefined") return 1;
  try {
    const val = parseInt(localStorage.getItem(STORAGE_KEY), 10);
    return isNaN(val) || val < 1 ? 1 : val;
  } catch {
    return 1;
  }
}

/**
 * Mark a stage as beaten, unlocking the next one.
 * Only moves forward — never decreases progress.
 */
export function unlockNextStage(clearedStage) {
  if (typeof window === "undefined") return;
  try {
    const current = getUnlockedStage();
    const next = clearedStage + 1;
    if (next > current) {
      localStorage.setItem(STORAGE_KEY, String(next));
    }
  } catch {
    // Silently ignore storage errors
  }
}

/**
 * Check if a specific stage is unlocked.
 */
export function isStageUnlocked(stage) {
  return stage <= getUnlockedStage();
}

/**
 * Reset all progress (for testing / menu option).
 */
export function resetProgress() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently ignore
  }
}
