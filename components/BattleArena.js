"use client";

import { AnimatePresence, motion } from "framer-motion";
import { memo, useEffect, useMemo, useState } from "react";

import EnemyCharacter, { getEnemyConfig } from "./characters/EnemyCharacter";
import PlayerCharacter from "./characters/PlayerCharacter";
import {
    AmbientParticles,
    HitImpactEffect,
    SlashEffect,
    SwordClashEffect,
} from "./effects/BattleEffects";

// ── Animation variants ────────────────────────────────────────
const idleBob = {
  y: [0, -8, 0],
  transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
};

const playerAttackVariants = {
  idle: { x: 0, scale: 1 },
  attack: {
    x: [0, 50, 70, 80, 0],
    scale: [1, 1.05, 1.1, 1.05, 1],
    transition: { duration: 0.3, times: [0, 0.2, 0.4, 0.6, 1] },
  },
};

const cpuAttackVariants = {
  idle: { x: 0, scale: 1 },
  attack: {
    x: [0, -50, -70, -80, 0],
    scale: [1, 1.05, 1.1, 1.05, 1],
    transition: { duration: 0.3, times: [0, 0.2, 0.4, 0.6, 1] },
  },
};

const hitShake = {
  x: [0, -10, 10, -8, 8, -4, 4, 0],
  transition: { duration: 0.4 },
};

// ── Background layers ─────────────────────────────────────────
const ARENA_STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  left: `${(i * 37 + 13) % 100}%`,
  top: `${(i * 23 + 7) % 45}%`,
  duration: 2 + (i % 3),
  delay: i * 0.15,
}));

function ArenaBackground() {
  return (
    <>
      {/* Sky */}
      <div className="absolute inset-0 bg-linear-to-b from-slate-900 via-indigo-950 to-gray-900" />

      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden">
        {ARENA_STARS.map((s) => (
          <motion.div key={s.id} className="absolute w-0.5 h-0.5 bg-white rounded-full"
            style={{ left: s.left, top: s.top }}
            animate={{ opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
          />
        ))}
      </div>

      {/* Northern lights / aurora effect */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 right-0 h-1/3 opacity-20"
          style={{
            background: "linear-gradient(180deg, transparent 0%, rgba(56,189,248,0.08) 30%, rgba(139,92,246,0.06) 60%, transparent 100%)",
          }}
          animate={{ opacity: [0.1, 0.25, 0.15, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Mountains — two layers for depth */}
      <svg className="absolute bottom-24 left-0 right-0 w-full h-40" viewBox="0 0 1600 200" preserveAspectRatio="none">
        <path d="M0 200 L0 140 Q100 40 250 100 Q400 20 550 90 Q650 30 800 80 Q950 10 1100 70 Q1250 25 1400 100 Q1500 60 1600 120 L1600 200 Z" fill="#1E1B4B" opacity="0.6" />
        <path d="M0 200 L0 150 Q200 70 400 130 Q550 60 700 120 Q850 50 1000 110 Q1200 55 1350 130 Q1500 80 1600 140 L1600 200 Z" fill="#312E81" opacity="0.35" />
      </svg>

      {/* Ground — extends to bottom of screen */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-linear-to-t from-stone-900 via-stone-800/80 to-transparent" />
      <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1600 60" preserveAspectRatio="none">
        <rect x="0" y="30" width="1600" height="30" fill="#292524" />
        <path d="M0 30 Q400 15 800 32 Q1200 18 1600 30 L1600 60 L0 60 Z" fill="#1C1917" />
        <line x1="150" y1="42" x2="300" y2="48" stroke="#44403C" strokeWidth="0.5" />
        <line x1="500" y1="38" x2="700" y2="45" stroke="#44403C" strokeWidth="0.5" />
        <line x1="900" y1="44" x2="1100" y2="40" stroke="#44403C" strokeWidth="0.5" />
        <line x1="1250" y1="40" x2="1400" y2="46" stroke="#44403C" strokeWidth="0.5" />
      </svg>

      {/* Radial center glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(250,204,21,0.04)_0%,transparent_50%)]" />

      <AmbientParticles />
    </>
  );
}

// ── Main Arena Component ──────────────────────────────────────
export default memo(function BattleArena({
  mode = "word",
  stage = 1,
  playerAttacking = false,
  cpuAttacking = false,
  playerIsHit = false,
  cpuIsHit = false,
  roundMessage = "",
  playerName = "You",
}) {
  const enemyConfig = useMemo(() => getEnemyConfig(mode, stage), [mode, stage]);
  const [showClash, setShowClash] = useState(false);

  useEffect(() => {
    if (playerAttacking || cpuAttacking) {
      setShowClash(true);
      const hideTimer = setTimeout(() => setShowClash(false), 400);
      return () => { clearTimeout(hideTimer); };
    }
    setShowClash(false);
  }, [playerAttacking, cpuAttacking]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <ArenaBackground />

      {/* ── Characters — centered on screen ────────────── */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-end justify-between w-full max-w-3xl px-8" style={{ marginTop: "4vh" }}>
          {/* Player */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-2 font-bold drop-shadow-lg">{playerName}</div>
            <motion.div
              animate={playerAttacking ? "attack" : playerIsHit ? hitShake : idleBob}
              variants={playerAttackVariants}
              className="relative"
            >
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-cyan-500/20 rounded-full blur-md" />
              <PlayerCharacter isAttacking={playerAttacking} isHit={playerIsHit} />
              <AnimatePresence>{playerAttacking && <SlashEffect direction="right" />}</AnimatePresence>
              <AnimatePresence>{playerIsHit && <HitImpactEffect side="left" />}</AnimatePresence>
            </motion.div>
            <motion.div className="w-28 h-3 bg-cyan-500/10 rounded-full blur-sm" animate={playerAttacking ? { scaleX: 1.3 } : { scaleX: 1 }} />
          </div>

          {/* Center — VS / Round Message */}
          <div className="flex flex-col items-center pb-8 self-center">
            <AnimatePresence mode="wait">
              {roundMessage ? (
                <motion.div key={roundMessage} initial={{ opacity: 0, y: 10, scale: 0.7 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} className="text-center">
                  <div className="text-base md:text-lg font-extrabold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">{roundMessage}</div>
                </motion.div>
              ) : (
                <motion.div key="vs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                  <motion.div
                    className="text-5xl font-black text-transparent bg-clip-text bg-linear-to-b from-yellow-400 to-orange-600 select-none drop-shadow-lg"
                    animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >VS</motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>{showClash && <SwordClashEffect />}</AnimatePresence>
          </div>

          {/* CPU */}
          <div className="flex flex-col items-center">
            <div className="text-xs font-mono text-red-400 uppercase tracking-widest mb-2 font-bold drop-shadow-lg">{enemyConfig.name}</div>
            <motion.div
              animate={cpuAttacking ? "attack" : cpuIsHit ? hitShake : idleBob}
              variants={cpuAttackVariants}
              className="relative"
            >
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-5 bg-red-500/20 rounded-full blur-md" />
              <EnemyCharacter isAttacking={cpuAttacking} isHit={cpuIsHit} config={enemyConfig} />
              <AnimatePresence>{cpuAttacking && <SlashEffect direction="left" />}</AnimatePresence>
              <AnimatePresence>{cpuIsHit && <HitImpactEffect side="right" />}</AnimatePresence>
            </motion.div>
            <motion.div className="w-28 h-3 bg-red-500/10 rounded-full blur-sm" animate={cpuAttacking ? { scaleX: 1.3 } : { scaleX: 1 }} />
          </div>
        </div>
      </div>
    </div>
  );
});
