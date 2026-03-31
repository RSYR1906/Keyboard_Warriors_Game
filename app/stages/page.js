"use client";

import { STORY_ENEMIES } from "@/components/characters/EnemyCharacter";
import GameLayout from "@/components/GameLayout";
import { useAudio } from "@/hooks/useAudio";
import { CPU_STAGES } from "@/lib/cpuDifficulty";
import { getStageStars, getUnlockedStage } from "@/lib/stageProgress";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ── Enemy icons for each stage ────────────────────────────────
const STAGE_ICONS = ["🐺", "👻", "🦇", "🗿", "🧙", "🧊", "🐂", "🐉", "👤", "👑"];
const STAGE_COLORS = [
  { bg: "from-gray-700 to-gray-800", border: "border-gray-500/50", text: "text-gray-300" },
  { bg: "from-emerald-900 to-emerald-950", border: "border-emerald-500/50", text: "text-emerald-300" },
  { bg: "from-purple-900 to-purple-950", border: "border-purple-500/50", text: "text-purple-300" },
  { bg: "from-stone-700 to-stone-800", border: "border-stone-400/50", text: "text-stone-300" },
  { bg: "from-violet-900 to-violet-950", border: "border-violet-500/50", text: "text-violet-300" },
  { bg: "from-cyan-900 to-cyan-950", border: "border-cyan-500/50", text: "text-cyan-300" },
  { bg: "from-orange-900 to-orange-950", border: "border-orange-500/50", text: "text-orange-300" },
  { bg: "from-red-900 to-red-950", border: "border-red-500/50", text: "text-red-300" },
  { bg: "from-indigo-900 to-indigo-950", border: "border-indigo-400/50", text: "text-indigo-300" },
  { bg: "from-yellow-800 to-yellow-950", border: "border-yellow-500/50", text: "text-yellow-300" },
];

export default function StageSelect() {
  const router = useRouter();
  const { playClick, playModeSelect } = useAudio();
  const [unlockedStage, setUnlockedStage] = useState(1);
  const [stageStars, setStageStars] = useState({});

  useEffect(() => {
    setUnlockedStage(getUnlockedStage());
    // Load star ratings for all stages
    const stars = {};
    for (let i = 1; i <= 10; i++) {
      stars[i] = getStageStars(i);
    }
    setStageStars(stars);
  }, []);

  const handleStageClick = (stage) => {
    if (stage > unlockedStage) return;
    playModeSelect();
    router.push(`/battle?mode=story&stage=${stage}`);
  };

  const handleBack = () => {
    playClick();
    router.push("/");
  };

  return (
    <GameLayout>
      <div className="flex-1 flex flex-col items-center px-4 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-2">
            <span className="text-cyan-400">⚔️ Story</span>{" "}
            <span className="text-white">Mode</span>
          </h1>
          <p className="text-gray-400 text-sm font-mono">
            Defeat enemies across 10 stages to save the kingdom
          </p>
        </motion.div>

        {/* Stage Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl w-full mb-8">
          {CPU_STAGES.map((stageConfig, idx) => {
            const stageNum = idx + 1;
            const isUnlocked = stageNum <= unlockedStage;
            const isCleared = stageNum < unlockedStage;
            const colors = STAGE_COLORS[idx];

            return (
              <motion.button
                key={stageNum}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06, duration: 0.4 }}
                whileHover={isUnlocked ? { scale: 1.05, y: -4 } : {}}
                whileTap={isUnlocked ? { scale: 0.95 } : {}}
                onClick={() => handleStageClick(stageNum)}
                className={`
                  relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300
                  ${isUnlocked
                    ? `bg-linear-to-b ${colors.bg} ${colors.border} cursor-pointer hover:shadow-lg hover:shadow-cyan-500/10`
                    : "bg-gray-900/80 border-gray-800 cursor-not-allowed opacity-50"
                  }
                `}
              >
                {/* Star rating or cleared badge */}
                {isCleared && (
                  <div className="absolute -top-2 -right-2 flex gap-0 z-10">
                    {stageStars[stageNum] > 0 ? (
                      [...Array(stageStars[stageNum])].map((_, i) => (
                        <span key={i} className="text-xs text-yellow-400 drop-shadow-md">⭐</span>
                      ))
                    ) : (
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                        ✓
                      </div>
                    )}
                  </div>
                )}

                {/* Stage number */}
                <div className={`text-xs font-mono uppercase tracking-wider mb-1 ${isUnlocked ? "text-gray-400" : "text-gray-600"}`}>
                  Stage {stageNum}
                </div>

                {/* Icon */}
                <div className={`text-3xl mb-2 ${!isUnlocked ? "grayscale blur-[1px]" : ""}`}>
                  {isUnlocked ? STAGE_ICONS[idx] : "🔒"}
                </div>

                {/* Enemy name */}
                <div className={`text-xs font-bold text-center leading-tight ${isUnlocked ? colors.text : "text-gray-600"}`}>
                  {isUnlocked ? STORY_ENEMIES[idx].name : "???"}
                </div>

                {/* Difficulty indicator */}
                {isUnlocked && (
                  <div className="flex gap-0.5 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          i < Math.ceil(stageNum / 2)
                            ? "bg-yellow-400"
                            : "bg-gray-700"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* CPU stats */}
                {isUnlocked && (
                  <div className="mt-2 text-[10px] font-mono text-gray-500">
                    {stageConfig.wpm} WPM
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Progress info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-6"
        >
          <div className="text-sm font-mono text-gray-500">
            Progress: {Math.min(unlockedStage - 1, 10)} / 10 stages cleared
          </div>
          <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden mt-2 mx-auto border border-gray-700">
            <motion.div
              className="h-full bg-linear-to-r from-cyan-500 to-emerald-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((unlockedStage - 1) / 10, 1) * 100}%` }}
              transition={{ delay: 0.8, duration: 0.8 }}
            />
          </div>
        </motion.div>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="px-6 py-2 rounded-xl border-2 border-gray-600 hover:border-gray-400 text-gray-400 hover:text-gray-200 font-bold transition-colors cursor-pointer"
        >
          ← Back to Menu
        </motion.button>
      </div>
    </GameLayout>
  );
}
