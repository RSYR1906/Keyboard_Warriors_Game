"use client";

import GameLayout from "@/components/GameLayout";
import ModeSelector from "@/components/ModeSelector";
import { useAudio } from "@/hooks/useAudio";
import { wordBank } from "@/lib/wordBank";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PLAYER_NAME_KEY = "typebattle_player_name";

// ── Grab a flat pool of medium words for the demo ─────────────
const DEMO_WORDS = wordBank.words.medium;

// ── Animated landing page background ──────────────────────────
function LandingBackground() {
  // Floating ghost words — seeded once so they don't re-randomise on re-render
  const ghostWords = useMemo(() => {
    const pool = ["battle", "sword", "type", "speed", "quest", "knight", "fire", "shield", "strike", "combo", "dragon", "victory", "power", "clash"];
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      word: pool[i % pool.length],
      x: ((i * 41 + 17) % 90) + 5,           // spread across 5–95%
      duration: 18 + (i % 5) * 4,             // 18–34s travel
      delay: (i * 1.7) % 12,                  // staggered starts
      size: 12 + (i % 4) * 3,                 // 12–21px
      opacity: 0.03 + (i % 3) * 0.015,        // very subtle
    }));
  }, []);

  // Twinkling stars
  const stars = useMemo(() =>
    Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: (i * 37 + 13) % 100,
      y: (i * 23 + 7) % 100,
      size: 1 + (i % 3),
      duration: 2 + (i % 4),
      delay: (i * 0.2) % 5,
    }))
  , []);

  // Floating particles (embers / motes)
  const particles = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: ((i * 53 + 11) % 96) + 2,
      size: 2 + (i % 3) * 1.5,
      duration: 10 + (i % 6) * 3,
      delay: (i * 0.9) % 8,
      color: i % 3 === 0
        ? "rgba(56,189,248,0.25)"   // cyan
        : i % 3 === 1
          ? "rgba(250,204,21,0.2)"  // amber
          : "rgba(139,92,246,0.2)", // purple
    }))
  , []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Twinkling stars */}
      {stars.map((s) => (
        <motion.div
          key={`s${s.id}`}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Slow aurora sweep */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(120deg, transparent 0%, rgba(56,189,248,0.04) 25%, rgba(139,92,246,0.03) 50%, rgba(250,204,21,0.02) 75%, transparent 100%)",
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating ghost words drifting upward */}
      {ghostWords.map((g) => (
        <motion.span
          key={`w${g.id}`}
          className="absolute font-mono font-bold select-none whitespace-nowrap text-cyan-300"
          style={{ left: `${g.x}%`, fontSize: g.size, opacity: 0 }}
          animate={{
            y: ["110vh", "-10vh"],
            opacity: [0, g.opacity, g.opacity, 0],
            rotate: [-3 + (g.id % 7), 3 - (g.id % 5)],
          }}
          transition={{
            duration: g.duration,
            repeat: Infinity,
            delay: g.delay,
            ease: "linear",
          }}
        >
          {g.word}
        </motion.span>
      ))}

      {/* Rising ember particles */}
      {particles.map((p) => (
        <motion.div
          key={`p${p.id}`}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            filter: "blur(0.5px)",
          }}
          animate={{
            y: ["105vh", "-5vh"],
            x: [0, (p.id % 2 === 0 ? 30 : -30), 0],
            opacity: [0, 0.8, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Drifting crossed-swords silhouettes */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={`sword${i}`}
          className="absolute text-white select-none"
          style={{
            fontSize: 48 + i * 16,
            left: `${15 + i * 30}%`,
            opacity: 0,
          }}
          animate={{
            y: ["100vh", "-10vh"],
            opacity: [0, 0.035, 0.035, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: 30 + i * 8,
            repeat: Infinity,
            delay: i * 6,
            ease: "linear",
          }}
        >
          ⚔
        </motion.div>
      ))}
    </div>
  );
}

function pickRandom(exclude) {
  let word;
  do { word = DEMO_WORDS[Math.floor(Math.random() * DEMO_WORDS.length)]; }
  while (word === exclude);
  return word;
}

// ── Mini typing demo widget ───────────────────────────────────
function TypingDemo({ onFirstKeystroke }) {
  const { playHit } = useAudio();
  const [target, setTarget] = useState(DEMO_WORDS[0]);
  const [input, setInput] = useState("");
  const [streak, setStreak] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [showSlash, setShowSlash] = useState(false);
  const [shakeWord, setShakeWord] = useState(false);
  const startRef = useRef(null);
  const charsRef = useRef(0);
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(false);
  const hasTyped = useRef(false);

  // Pick a random word + auto-focus on mount (client only)
  useEffect(() => {
    queueMicrotask(() => setTarget(pickRandom()));
    inputRef.current?.focus();
  }, []);

  const advanceWord = useCallback(() => {
    playHit();
    setShowSlash(true);
    setTimeout(() => setShowSlash(false), 400);

    // Update WPM
    if (startRef.current) {
      const elapsed = (Date.now() - startRef.current) / 60000;
      if (elapsed > 0) setWpm(Math.round((charsRef.current / 5 / elapsed) * 10) / 10);
    }

    setStreak((s) => s + 1);
    setTarget((prev) => pickRandom(prev));
    setInput("");
  }, [playHit]);

  const handleChange = (e) => {
    const val = e.target.value;

    // Track first keystroke for parent
    if (!hasTyped.current) {
      hasTyped.current = true;
      startRef.current = Date.now();
      onFirstKeystroke?.();
    }

    charsRef.current += 1;

    // Wrong character → shake
    if (val.length > 0 && val[val.length - 1] !== target[val.length - 1]) {
      setShakeWord(true);
      setTimeout(() => setShakeWord(false), 300);
      return; // reject the character
    }

    setInput(val);

    // Completed word
    if (val === target) advanceWord();
  };

  // Per-char coloring
  const chars = target.split("").map((ch, i) => {
    let cls = "text-gray-500";
    if (i < input.length) cls = "text-cyan-400";
    if (i === input.length) cls = "text-white underline underline-offset-4 decoration-cyan-500/60";
    return (
      <span key={i} className={`${cls} transition-colors duration-75`}>{ch}</span>
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.5 }}
      className="mb-10 w-full max-w-md"
    >
      <div className="text-center text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2">
        Try it — start typing
      </div>

      {/* Click-target area */}
      <div
        className={`relative rounded-xl border px-6 py-5 cursor-text transition-colors ${
          focused
            ? "border-cyan-500/40 bg-gray-900/90 shadow-[0_0_24px_rgba(6,182,212,0.08)]"
            : "border-gray-700/40 bg-gray-900/60"
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Hidden input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="absolute opacity-0 w-0 h-0"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {/* Word display */}
        <div className="flex items-center justify-center gap-1 relative">
          <AnimatePresence>
            {showSlash && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                animate={{ opacity: 1, scale: 1.2, rotate: 10 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="absolute -right-8 text-2xl select-none"
              >⚔️</motion.div>
            )}
          </AnimatePresence>

          <motion.div
            key={target}
            initial={{ opacity: 0, y: 8 }}
            animate={shakeWord ? { x: [0, -4, 4, -3, 3, 0], opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
            transition={{ duration: shakeWord ? 0.3 : 0.25 }}
            className="text-3xl md:text-4xl font-mono font-bold tracking-wider select-none"
          >
            {chars}
          </motion.div>
        </div>

        {/* Blinking cursor hint when idle */}
        {!focused && input.length === 0 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-sm font-mono text-gray-500">click here or start typing</span>
          </motion.div>
        )}

        {/* Stats bar */}
        <div className="flex items-center justify-between mt-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-gray-500">
              WPM{" "}
              <motion.span
                key={wpm}
                initial={{ scale: 1.3, color: "#22d3ee" }}
                animate={{ scale: 1, color: "#9CA3AF" }}
                className="inline-block font-bold"
              >
                {wpm || "—"}
              </motion.span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            {streak > 0 && (
              <motion.span
                key={streak}
                initial={{ scale: 1.5, y: -4 }}
                animate={{ scale: 1, y: 0 }}
                className="text-amber-400 font-bold"
              >
                🔥 {streak}
              </motion.span>
            )}
            {streak === 0 && <span className="text-gray-600">streak —</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MainMenu() {
  const router = useRouter();
  const { playClick, playModeSelect, playMenuBGM, stopMenuBGM } = useAudio();
  const [playerName, setPlayerName] = useState("");
  const menuMusicStarted = useRef(false);

  // Load saved name on mount
  useEffect(() => {
    const saved = localStorage.getItem(PLAYER_NAME_KEY);
    if (saved) queueMicrotask(() => setPlayerName(saved));
  }, []);

  // Stop menu music on unmount (navigation away)
  useEffect(() => {
    return () => stopMenuBGM();
  }, [stopMenuBGM]);

  // Start menu music on any user interaction (click/key)
  useEffect(() => {
    const start = () => {
      if (menuMusicStarted.current) return;
      menuMusicStarted.current = true;
      playMenuBGM();
    };
    window.addEventListener("click", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("click", start);
      window.removeEventListener("keydown", start);
    };
  }, [playMenuBGM]);

  const handleNameChange = (e) => {
    const name = e.target.value.slice(0, 16);
    setPlayerName(name);
    localStorage.setItem(PLAYER_NAME_KEY, name);
  };

  const handleModeSelect = (mode) => {
    stopMenuBGM();
    playModeSelect();
    if (mode === "story") {
      router.push("/stages");
    } else {
      // Word and Sentence modes go to difficulty setup first
      router.push(`/setup?mode=${mode}`);
    }
  };

  return (
    <GameLayout>
      <LandingBackground />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-3">
            <span className="text-cyan-400">Keyboard</span>{" "}
            <span className="text-white">Warriors</span>
          </h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "160px" }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="h-0.5 bg-linear-to-r from-transparent via-cyan-400 to-transparent mx-auto mb-4"
          />
          <p className="text-gray-400 text-lg font-mono">
            Defeat your enemies with typing speed
          </p>
        </motion.div>

        {/* Player Name Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mb-8 w-full max-w-xs"
        >
          <label htmlFor="playerName" className="block text-xs font-mono text-gray-400 uppercase tracking-wider mb-2 text-center">
            Your Name
          </label>
          <input
            id="playerName"
            type="text"
            value={playerName}
            onChange={handleNameChange}
            placeholder="Enter your name..."
            maxLength={16}
            className="w-full px-4 py-2.5 bg-gray-900/80 border border-gray-700/60 rounded-lg text-center text-cyan-300 font-mono text-lg placeholder:text-gray-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
          />
        </motion.div>

        {/* Live typing demo */}
        <TypingDemo />

        {/* Mode selection cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full"
        >
          <ModeSelector
            title="Story Mode"
            description="Battle through 10 stages of increasing difficulty. Defeat the tyrant and save the kingdom!"
            icon="⚔️"
            color="cyan"
            onClick={() => handleModeSelect("story")}
          />
          <ModeSelector
            title="Sentence Mode"
            description="Race against CPU to type sentences. Best of 3 rounds — first to finish wins each round."
            icon="📝"
            color="purple"
            onClick={() => handleModeSelect("sentence")}
          />
          <ModeSelector
            title="Single Word Mode"
            description="Type words as fast as you can. Damage scales with your speed — drain the CPU's HP to win!"
            icon="⚡"
            color="amber"
            onClick={() => handleModeSelect("word")}
          />
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          className="mt-12 text-gray-600 text-xs font-mono"
        >
          Choose a mode to begin your battle
        </motion.p>
      </div>
    </GameLayout>
  );
}
