// ============================================================
// Battle Resolver — pure logic for round resolution
// ============================================================
//
// Extracts the shared decision-making from the battle page:
//   • Who won the round?
//   • How much damage was dealt?
//   • Is the game over? Where do we navigate?
//   • Or do we continue to the next round/sentence?
//
// No React, no side-effects — just data in → plan out.

import { calcDamage, determineRoundWinner } from "@/lib/damageEngine";
import { getStageSentenceCount } from "@/lib/gameEngine";

/** Rounds needed to win in sentence mode (best-of-3 → need 2). */
const SENTENCE_WINS_REQUIRED = 2;

/**
 * @typedef {Object} RoundResolution
 * @property {"player"|"cpu"} winner
 * @property {string}         message       - display text for the round
 * @property {string|null}    navigateTo    - URL to push (game over), or null to continue
 * @property {boolean}        shouldStopBGM - whether to stop background music
 * @property {"sentence"|"hp"} type         - resolution type
 *
 * HP-type extras:
 * @property {number}         [damage]       - amount dealt
 * @property {"player"|"cpu"} [damageTarget] - who takes the hit
 *
 * Sentence-type extras:
 * @property {number}         [nextSentenceIdx] - only for sentence/continue
 */

/**
 * Resolve a completed round, returning a plan the UI should execute.
 *
 * @param {Object} opts
 * @param {string}  opts.mode           - "story" | "sentence" | "word"
 * @param {Object}  opts.playerResult   - { wpm, accuracy, completionTime }
 * @param {Object}  opts.cpuResult      - { wpm, accuracy, completionTime }
 * @param {Object}  opts.gameState      - current GameContext snapshot
 * @param {string}  opts.urlDifficulty
 * @param {number}  opts.urlStage
 * @param {number}  opts.sentenceIdx    - current sentence index (story mode)
 * @returns {RoundResolution}
 */
export function resolveBattleRound({
  mode,
  playerResult,
  cpuResult,
  gameState,
  urlDifficulty,
  urlStage,
  sentenceIdx,
}) {
  const winner = determineRoundWinner(playerResult, cpuResult);

  // ── Sentence mode: best-of-3 round tracking ────────────
  if (mode === "sentence") {
    const newPlayerWins = gameState.playerWins + (winner === "player" ? 1 : 0);
    const newCpuWins = gameState.cpuWins + (winner === "cpu" ? 1 : 0);

    const message =
      winner === "player"
        ? `Round ${gameState.round}: You win! 🎉`
        : `Round ${gameState.round}: CPU wins! 💀`;

    let navigateTo = null;
    let shouldStopBGM = false;

    if (newPlayerWins >= SENTENCE_WINS_REQUIRED) {
      navigateTo = `/result?mode=sentence&difficulty=${urlDifficulty}&result=win`;
      shouldStopBGM = true;
    } else if (newCpuWins >= SENTENCE_WINS_REQUIRED) {
      navigateTo = `/result?mode=sentence&difficulty=${urlDifficulty}&result=lose`;
      shouldStopBGM = true;
    }

    return { winner, message, navigateTo, shouldStopBGM, type: "sentence" };
  }

  // ── HP-based modes: word & story ───────────────────────
  const playerDamage = calcDamage(mode, playerResult);
  const cpuDamage = calcDamage(mode, cpuResult);

  const damage = winner === "player" ? playerDamage : cpuDamage;
  const damageTarget = winner === "player" ? "cpu" : "player";

  const expectedCpuHP =
    winner === "player"
      ? Math.max(0, gameState.cpuHP - playerDamage)
      : gameState.cpuHP;
  const expectedPlayerHP =
    winner === "cpu"
      ? Math.max(0, gameState.playerHP - cpuDamage)
      : gameState.playerHP;

  const message =
    winner === "player"
      ? `💥 You dealt ${playerDamage} damage!`
      : `😵 CPU dealt ${cpuDamage} damage!`;

  let navigateTo = null;
  let shouldStopBGM = false;

  if (expectedCpuHP <= 0) {
    shouldStopBGM = true;
    navigateTo =
      mode === "story"
        ? `/result?mode=story&stage=${urlStage}&result=win`
        : `/result?mode=word&difficulty=${urlDifficulty}&result=win`;
  } else if (expectedPlayerHP <= 0) {
    shouldStopBGM = true;
    navigateTo =
      mode === "story"
        ? `/result?mode=story&stage=${urlStage}&result=lose`
        : `/result?mode=word&difficulty=${urlDifficulty}&result=lose`;
  }

  // Story mode: compute next sentence index when continuing
  let nextSentenceIdx = sentenceIdx + 1;
  if (mode === "story" && !navigateTo) {
    const totalSentences = getStageSentenceCount(urlStage);
    if (nextSentenceIdx >= totalSentences) {
      nextSentenceIdx = 0; // cycle back to start
    }
  }

  return {
    winner,
    message,
    navigateTo,
    shouldStopBGM,
    type: "hp",
    damage,
    damageTarget,
    nextSentenceIdx,
  };
}
