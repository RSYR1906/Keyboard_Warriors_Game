"use client";

import GameLayout from "@/components/GameLayout";
import { useAudio } from "@/hooks/useAudio";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const difficulties = [
  {
    key: "easy",
    label: "Easy",
    color: "emerald",
    icon: "🌱",
    wordDesc: "Short, common words (3–5 letters)",
    sentenceDesc: "Short, simple sentences (30–50 characters)",
    endlessDesc: "Short words — more forgiving, +5s per word",
  },
  {
    key: "medium",
    label: "Medium",
    color: "amber",
    icon: "⚡",
    wordDesc: "Mixed-length words (5–7 letters)",
    sentenceDesc: "Moderate sentences with punctuation (50–80 characters)",
    endlessDesc: "Medium words — balanced challenge, +5s per word",
  },
  {
    key: "hard",
    label: "Hard",
    color: "red",
    icon: "🔥",
    wordDesc: "Long, technical words (8+ letters)",
    sentenceDesc: "Long, complex sentences with mixed punctuation (80–120 characters)",
    endlessDesc: "Long, tricky words — every second counts!",
  },
];

const colorClasses = {
  emerald: {
    border: "border-emerald-500/30 hover:border-emerald-400/60",
    bg: "hover:bg-emerald-500/10",
    title: "text-emerald-400",
    ring: "focus-visible:ring-emerald-400",
  },
  amber: {
    border: "border-amber-500/30 hover:border-amber-400/60",
    bg: "hover:bg-amber-500/10",
    title: "text-amber-400",
    ring: "focus-visible:ring-amber-400",
  },
  red: {
    border: "border-red-500/30 hover:border-red-400/60",
    bg: "hover:bg-red-500/10",
    title: "text-red-400",
    ring: "focus-visible:ring-red-400",
  },
};

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "word";
  const { playClick, playModeSelect } = useAudio();

  const modeLabel = mode === "sentence" ? "Sentence Battle" : mode === "endless" ? "Endless Battle" : "Word Battle";
  const modeIcon = mode === "sentence" ? "📝" : mode === "endless" ? "⏱️" : "⚡";

  const handleSelect = (difficulty) => {
    playModeSelect();
    router.push(`/battle?mode=${mode}&difficulty=${difficulty}`);
  };

  const handleBack = () => {
    playClick();
    router.push("/");
  };

  return (
    <GameLayout>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="text-4xl mb-3">{modeIcon}</div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {modeLabel}
          </h1>
          <p className="text-gray-400 font-mono text-sm">
            Choose your difficulty
          </p>
        </motion.div>

        {/* Difficulty cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full"
        >
          {difficulties.map((d, i) => {
            const c = colorClasses[d.color];
            const desc = mode === "sentence" ? d.sentenceDesc : mode === "endless" ? d.endlessDesc : d.wordDesc;

            return (
              <motion.button
                key={d.key}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                onClick={() => handleSelect(d.key)}
                className={`
                  group relative w-full p-6 rounded-2xl border-2
                  bg-gray-900/60 backdrop-blur-sm cursor-pointer
                  transition-colors duration-300
                  ${c.border} ${c.bg}
                `}
              >
                <div className="text-3xl mb-3">{d.icon}</div>
                <h3 className={`text-xl font-bold mb-2 ${c.title}`}>
                  {d.label}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={handleBack}
          className="mt-8 text-gray-500 hover:text-gray-300 text-sm font-mono transition-colors cursor-pointer"
        >
          ← Back to Menu
        </motion.button>
      </div>
    </GameLayout>
  );
}

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
          <div className="text-gray-400 font-mono animate-pulse">Loading...</div>
        </div>
      }
    >
      <SetupContent />
    </Suspense>
  );
}
