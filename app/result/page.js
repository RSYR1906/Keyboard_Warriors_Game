"use client";

import GameLayout from "@/components/GameLayout";
import { useAudio } from "@/hooks/useAudio";
import { MAX_HP } from "@/lib/cpuDifficulty";
import { calculateStars, saveStageStars, unlockNextStage } from "@/lib/stageProgress";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { memo, Suspense, useEffect, useMemo, useState } from "react";

// ── Star Rating Display ─────────────────────────────────────
const StarRating = memo(function StarRating({ stars, delay = 0.5 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: delay + i * 0.15, type: "spring", bounce: 0.5 }}
          className={`text-3xl ${i <= stars ? "drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" : "opacity-30"}`}
        >
          {i <= stars ? "⭐" : "☆"}
        </motion.span>
      ))}
    </div>
  );
});

// ── Animated Stat Card ──────────────────────────────────────
const StatCard = memo(function StatCard({ label, value, unit = "", icon, color, delay }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const target = typeof value === "number" ? value : 0;
    if (target === 0) { queueMicrotask(() => setDisplayed(0)); return; }
    const duration = 800;
    const start = Date.now();
    let rafId;
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayed(Math.round(target * eased));
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    const timer = setTimeout(() => { rafId = requestAnimationFrame(animate); }, delay * 1000);
    return () => { clearTimeout(timer); cancelAnimationFrame(rafId); };
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: "spring", bounce: 0.3 }}
      className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm flex flex-col items-center gap-1 min-w-25"
    >
      <span className="text-lg">{icon}</span>
      <span className={`text-2xl font-black ${color}`}>
        {displayed}{unit}
      </span>
      <span className="text-xs text-gray-400 font-mono uppercase tracking-wider">{label}</span>
    </motion.div>
  );
});

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { playClick, triggerVictoryFanfare, triggerDefeatDirge } = useAudio();

  const mode = searchParams.get("mode") || "word";
  const result = searchParams.get("result") || "lose";
  const stage = parseInt(searchParams.get("stage") || "1", 10);
  const difficulty = searchParams.get("difficulty") || "medium";

  // Parse battle stats from URL
  const avgWpm = parseInt(searchParams.get("wpm") || "0", 10);
  const avgAcc = parseInt(searchParams.get("acc") || "0", 10);
  const totalDealt = parseInt(searchParams.get("dealt") || "0", 10);
  const totalTaken = parseInt(searchParams.get("taken") || "0", 10);
  const bestCombo = parseInt(searchParams.get("combo") || "0", 10);
  const roundsPlayed = parseInt(searchParams.get("rounds") || "0", 10);
  const endlessScore = parseInt(searchParams.get("score") || "0", 10);
  const timeSurvived = parseInt(searchParams.get("survived") || "0", 10);
  const hasStats = roundsPlayed > 0 || endlessScore > 0;

  const isEndless = mode === "endless";
  const isWin = result === "win";
  const isStoryVictory = mode === "story" && stage === 10 && isWin;
  const isStoryWin = mode === "story" && isWin && !isStoryVictory;

  // Calculate star rating
  const stars = useMemo(() => {
    if (!hasStats) return isWin ? 1 : 0;
    const hpRemaining = mode !== "sentence" ? MAX_HP - totalTaken : null;
    return calculateStars({
      isWin,
      avgAccuracy: avgAcc,
      hpRemaining,
      cleanSweep: mode === "sentence" && totalTaken === 0 && isWin,
    });
  }, [isWin, hasStats, avgAcc, totalTaken, mode]);

  // Save progress + stars when story stage is won
  useEffect(() => {
    if (mode === "story" && isWin) {
      unlockNextStage(stage);
      if (hasStats) saveStageStars(stage, stars);
    }
  }, [mode, isWin, stage, hasStats, stars]);

  // Play victory/defeat jingle
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isWin) {
        triggerVictoryFanfare();
      } else {
        triggerDefeatDirge();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
            className="text-gray-500 text-sm text-center max-w-md mb-6 font-mono"
          >
            The kingdom is saved. Your typing prowess is legendary.
          </motion.p>

          {/* Star rating */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="mb-4">
            <StarRating stars={stars} delay={1.2} />
          </motion.div>

          {/* Battle stats */}
          {hasStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="grid grid-cols-3 gap-3 mb-8"
            >
              <StatCard label="WPM" value={avgWpm} icon="⚡" color="text-cyan-400" delay={1.4} />
              <StatCard label="Accuracy" value={avgAcc} unit="%" icon="🎯" color="text-emerald-400" delay={1.5} />
              <StatCard label="Best Combo" value={bestCombo} icon="🔥" color="text-orange-400" delay={1.6} />
            </motion.div>
          )}

          {/* Decorative stars */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
            className="flex gap-2 mb-8"
          >
            {[...Array(5)].map((_, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.8 + i * 0.1, type: "spring" }}
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
            transition={{ delay: 2.3 }}
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
          className="text-7xl mb-4"
        >
          {isEndless ? "⏰" : isWin ? "🎉" : "💀"}
        </motion.div>

        {/* Result text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-4xl md:text-5xl font-bold mb-2 ${
            isEndless ? "text-rose-400" : isWin ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isEndless ? "Time's Up!" : isWin ? "You Win!" : "You Lose"}
        </motion.h1>

        {/* Mode context */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 text-sm font-mono mb-3"
        >
          {mode === "story" && `Story Mode — Stage ${stage}`}
          {mode === "sentence" && `Sentence Mode — ${difficulty}`}
          {mode === "word" && `Word Mode — ${difficulty}`}
          {mode === "endless" && `Endless Battle — ${difficulty}`}
        </motion.p>

        {/* Star rating */}
        {isWin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mb-4">
            <StarRating stars={stars} delay={0.7} />
          </motion.div>
        )}

        {/* Battle Stats Grid */}
        {hasStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 max-w-md w-full"
          >
            {isEndless && (
              <>
                <StatCard label="Score" value={endlessScore} icon="🏆" color="text-yellow-400" delay={0.9} />
                <StatCard label="Survived" value={timeSurvived} unit="s" icon="⏱️" color="text-rose-400" delay={1.0} />
              </>
            )}
            <StatCard label="WPM" value={avgWpm} icon="⚡" color="text-cyan-400" delay={isEndless ? 1.1 : 0.9} />
            <StatCard label="Accuracy" value={avgAcc} unit="%" icon="🎯" color="text-emerald-400" delay={isEndless ? 1.2 : 1.0} />
            <StatCard label="Best Combo" value={bestCombo} icon="🔥" color="text-orange-400" delay={isEndless ? 1.3 : 1.1} />
            {!isEndless && mode !== "sentence" && (
              <>
                <StatCard label="Dmg Dealt" value={totalDealt} icon="⚔️" color="text-yellow-400" delay={1.2} />
                <StatCard label="Dmg Taken" value={totalTaken} icon="🛡️" color="text-red-400" delay={1.3} />
              </>
            )}
            {!isEndless && <StatCard label="Rounds" value={roundsPlayed} icon="🔄" color="text-purple-400" delay={1.4} />}
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: hasStats ? 1.6 : 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {/* Retry button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            className="px-6 py-3 rounded-xl border-2 border-cyan-500/50 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold transition-colors cursor-pointer"
          >
            {mode === "story" ? "Retry Stage" : mode === "endless" ? "Play Again" : "Retry"}
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
