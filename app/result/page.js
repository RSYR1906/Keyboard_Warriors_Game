"use client";

import GameLayout from "@/components/GameLayout";
import { useAudio } from "@/hooks/useAudio";
import { unlockNextStage } from "@/lib/stageProgress";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { playClick } = useAudio();

  const mode = searchParams.get("mode") || "word";
  const result = searchParams.get("result") || "lose";
  const stage = parseInt(searchParams.get("stage") || "1", 10);
  const difficulty = searchParams.get("difficulty") || "medium";

  const isWin = result === "win";
  const isStoryVictory = mode === "story" && stage === 10 && isWin;
  const isStoryWin = mode === "story" && isWin && !isStoryVictory;

  // Save progress when story stage is won
  useEffect(() => {
    if (mode === "story" && isWin) {
      unlockNextStage(stage);
    }
  }, [mode, isWin, stage]);

  const handleRetry = () => {
    playClick();
    if (mode === "story") {
      router.push(`/battle?mode=story&stage=${stage}`);
    } else {
      router.push(`/battle?mode=${mode}&difficulty=${difficulty}`);
    }
  };

  const handleNextStage = () => {
    playClick();
    router.push(`/battle?mode=story&stage=${stage + 1}`);
  };

  const handleStageSelect = () => {
    playClick();
    router.push("/stages");
  };

  const handleMenu = () => {
    playClick();
    router.push("/");
  };

  // ── Story Victory Screen (cleared all 10 stages) ─────────
  if (isStoryVictory) {
    return (
      <GameLayout>
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          {/* Trophy animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 1, bounce: 0.4 }}
            className="text-8xl mb-6"
          >
            🏆
          </motion.div>

          {/* Congratulations */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold text-yellow-400 mb-4 text-center"
          >
            Victory!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-300 text-lg text-center max-w-md mb-2"
          >
            You have conquered all 10 stages and defeated the Tyrant!
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="text-gray-500 text-sm text-center max-w-md mb-8 font-mono"
          >
            The kingdom is saved. Your typing prowess is legendary.
          </motion.p>

          {/* Decorative stars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex gap-2 mb-8"
          >
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.3 + i * 0.1, type: "spring" }}
                className="text-2xl text-yellow-400"
              >
                ⭐
              </motion.span>
            ))}
          </motion.div>

          {/* Back to Menu only */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMenu}
            className="px-8 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold text-lg transition-colors cursor-pointer"
          >
            Back to Menu
          </motion.button>
        </div>
      </GameLayout>
    );
  }

  // ── Normal Result Screen ──────────────────────────────────
  return (
    <GameLayout>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Result icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.5 }}
          className="text-7xl mb-6"
        >
          {isWin ? "🎉" : "💀"}
        </motion.div>

        {/* Result text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-4xl md:text-5xl font-bold mb-3 ${
            isWin ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isWin ? "You Win!" : "You Lose"}
        </motion.h1>

        {/* Mode context */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 text-sm font-mono mb-8"
        >
          {mode === "story" && `Story Mode — Stage ${stage}`}
          {mode === "sentence" && `Sentence Mode — ${difficulty}`}
          {mode === "word" && `Word Mode — ${difficulty}`}
        </motion.p>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {/* Retry button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            className="px-6 py-3 rounded-xl border-2 border-cyan-500/50 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold transition-colors cursor-pointer"
          >
            {mode === "story" ? "Retry Stage" : "Retry"}
          </motion.button>

          {/* Next Stage button (story mode win only, stages 1–9) */}
          {isStoryWin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextStage}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-900 font-bold transition-colors cursor-pointer"
            >
              Next Stage →
            </motion.button>
          )}

          {/* Stage Select (story mode only) */}
          {mode === "story" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStageSelect}
              className="px-6 py-3 rounded-xl border-2 border-purple-500/50 hover:border-purple-400 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold transition-colors cursor-pointer"
            >
              Stage Select
            </motion.button>
          )}

          {/* Back to Menu */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMenu}
            className="px-6 py-3 rounded-xl border-2 border-gray-600 hover:border-gray-400 text-gray-400 hover:text-gray-200 font-bold transition-colors cursor-pointer"
          >
            Back to Menu
          </motion.button>
        </motion.div>
      </div>
    </GameLayout>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <GameLayout>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-400 font-mono">Loading...</div>
          </div>
        </GameLayout>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
