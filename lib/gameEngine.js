// ============================================================
// Game Engine — text selection & round management
// ============================================================

import { wordBank } from "@/lib/wordBank";

/**
 * Get a random item from an array.
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Get the text prompt for the current round.
 *
 * @param {string} mode       - "story" | "sentence" | "word"
 * @param {Object} opts
 * @param {string} opts.difficulty  - "easy" | "medium" | "hard"
 * @param {number} opts.stage       - 1–10 (story mode)
 * @param {number} opts.sentenceIdx - which sentence in the stage (story mode)
 * @returns {string}
 */
export function getPromptText(mode, { difficulty, stage, sentenceIdx }) {
  if (mode === "word") {
    const pool = wordBank.words[difficulty] || wordBank.words.medium;
    return pickRandom(pool);
  }

  if (mode === "sentence") {
    const pool = wordBank.sentences[difficulty] || wordBank.sentences.medium;
    return pickRandom(pool);
  }

  if (mode === "story") {
    const stageData = wordBank.storyMode[stage - 1];
    if (!stageData) return "The end.";
    const idx = sentenceIdx ?? 0;
    return stageData.sentences[idx] || stageData.sentences[0];
  }

  return "Type this text.";
}

/**
 * Get the number of sentences (sub-rounds) in a story stage.
 */
export function getStageSentenceCount(stage) {
  const stageData = wordBank.storyMode[stage - 1];
  return stageData ? stageData.sentences.length : 0;
}

/**
 * Get story stage metadata.
 */
export function getStageInfo(stage) {
  const stageData = wordBank.storyMode[stage - 1];
  if (!stageData) return { title: "Unknown", stage };
  return { title: stageData.title, stage: stageData.stage };
}
