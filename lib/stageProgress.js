// ============================================================
// Stage Progress — localStorage helpers for story mode
// ============================================================

const STORAGE_KEY = "typebattle_stage_progress";
const STARS_KEY = "typebattle_stage_stars";

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
 * Get the star rating (0–3) for a stage.
 */
export function getStageStars(stage) {
  if (typeof window === "undefined") return 0;
  try {
    const data = JSON.parse(localStorage.getItem(STARS_KEY) || "{}");
    return data[stage] || 0;
  } catch {
    return 0;
  }
}

/**
 * Save a star rating for a stage. Only saves if better than current best.
 * @returns {number} the saved (best) star count
 */
export function saveStageStars(stage, stars) {
  if (typeof window === "undefined") return stars;
  try {
    const data = JSON.parse(localStorage.getItem(STARS_KEY) || "{}");
    const current = data[stage] || 0;
    if (stars > current) {
      data[stage] = stars;
      localStorage.setItem(STARS_KEY, JSON.stringify(data));
      return stars;
    }
    return current;
  } catch {
    return stars;
  }
}

// ── Star rating thresholds ──────────────────────────────────
const STAR3_ACC = 95;     // Accuracy needed for 3 stars
const STAR3_HP = 70;      // HP remaining needed for 3 stars
const STAR2_ACC = 85;     // Accuracy needed for 2 stars
const STAR2_HP = 40;      // HP remaining needed for 2 stars

/**
 * Calculate star rating based on battle performance.
 * @param {Object} opts
 * @param {boolean} opts.isWin
 * @param {number}  opts.avgAccuracy - average accuracy (0–100)
 * @param {number}  opts.hpRemaining - player HP at end (0–100), or null for sentence mode
 * @param {boolean} opts.cleanSweep  - sentence mode: won 2-0
 * @returns {number} 0–3
 */
export function calculateStars({ isWin, avgAccuracy, hpRemaining = null, cleanSweep = false }) {
  if (!isWin) return 0;

  // If HP-based mode (story/word)
  if (hpRemaining !== null) {
    if (avgAccuracy >= STAR3_ACC && hpRemaining >= STAR3_HP) return 3;
    if (avgAccuracy >= STAR2_ACC && hpRemaining >= STAR2_HP) return 2;
    return 1;
  }

  // Sentence mode
  if (avgAccuracy >= STAR3_ACC && cleanSweep) return 3;
  if (avgAccuracy >= STAR2_ACC) return 2;
  return 1;
}

/**
 * Reset all progress (for testing / menu option).
 */
export function resetProgress() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STARS_KEY);
  } catch {
    // Silently ignore
  }
}
