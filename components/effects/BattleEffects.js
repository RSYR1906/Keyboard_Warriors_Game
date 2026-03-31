"use client";

import { motion } from "framer-motion";

// ── Sword Clash Effect ────────────────────────────────────────
export function SwordClashEffect() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.5, 1.8, 2] }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
    >
      <svg viewBox="0 0 200 200" width="160" height="160" className="absolute">
        <motion.g animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.4 }} style={{ transformOrigin: "100px 100px" }}>
          <rect x="40" y="96" width="120" height="8" rx="2" fill="#E2E8F0" transform="rotate(-30 100 100)" />
          <rect x="40" y="96" width="120" height="8" rx="2" fill="#E2E8F0" transform="rotate(30 100 100)" />
        </motion.g>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <motion.line
            key={angle}
            x1="100" y1="100"
            x2={100 + Math.cos((angle * Math.PI) / 180) * 60}
            y2={100 + Math.sin((angle * Math.PI) / 180) * 60}
            stroke="#FACC15" strokeWidth="3" strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, delay: angle * 0.001 }}
          />
        ))}
        <motion.circle cx="100" cy="100" r="15" fill="white" animate={{ r: [5, 20, 0], opacity: [1, 0.8, 0] }} transition={{ duration: 0.4 }} />
      </svg>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360;
        const dist = 40 + ((i * 7 + 3) % 30);
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{ background: i % 2 === 0 ? "#FACC15" : "#FB923C" }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos((angle * Math.PI) / 180) * dist, y: Math.sin((angle * Math.PI) / 180) * dist, opacity: 0, scale: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        );
      })}
    </motion.div>
  );
}

// ── Slash Trail Effect ────────────────────────────────────────
export function SlashEffect({ direction = "right" }) {
  const isRight = direction === "right";
  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: [0, 0.9, 0], scaleX: [0, 1.2, 1.5] }}
      transition={{ duration: 0.35 }}
      className={`absolute top-1/2 -translate-y-1/2 ${isRight ? "left-[30%]" : "right-[30%]"} z-20 pointer-events-none`}
      style={{ transformOrigin: isRight ? "left center" : "right center" }}
    >
      <svg viewBox="0 0 200 60" width="180" height="50">
        <motion.path
          d={isRight ? "M0 30 Q50 5 100 25 Q150 10 200 30 Q150 50 100 35 Q50 55 0 30" : "M200 30 Q150 5 100 25 Q50 10 0 30 Q50 50 100 35 Q150 55 200 30"}
          fill="none" stroke="url(#slashGrad)" strokeWidth="4"
          initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1] }} transition={{ duration: 0.3 }}
        />
        <defs>
          <linearGradient id="slashGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={isRight ? "#38BDF8" : "#F87171"} stopOpacity="0" />
            <stop offset="50%" stopColor={isRight ? "#38BDF8" : "#F87171"} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

// ── Hit Impact Effect ─────────────────────────────────────────
export function HitImpactEffect({ side = "right" }) {
  const isRight = side === "right";
  return (
    <motion.div
      className={`absolute ${isRight ? "right-[15%]" : "left-[15%]"} top-1/3 z-20 pointer-events-none`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0.3, 1.5, 2] }}
      transition={{ duration: 0.5 }}
    >
      <svg viewBox="0 0 80 80" width="80" height="80">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
          <motion.line
            key={a} x1="40" y1="40"
            x2={40 + Math.cos((a * Math.PI) / 180) * 25}
            y2={40 + Math.sin((a * Math.PI) / 180) * 25}
            stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round"
            animate={{ opacity: [1, 0] }} transition={{ duration: 0.4, delay: a * 0.0005 }}
          />
        ))}
        <motion.circle cx="40" cy="40" r="8" fill="#FEF3C7" animate={{ r: [4, 12, 0], opacity: [1, 0.5, 0] }} transition={{ duration: 0.4 }} />
      </svg>
    </motion.div>
  );
}

// ── Floating Damage Numbers ───────────────────────────────────
export function DamageFloat({ damage, side = "right", isCrit = false }) {
  const isRight = side === "right";
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 0.5 }}
      animate={{ opacity: [1, 1, 0], y: -100, scale: [0.5, 1.4, 1.2] }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={`absolute ${isRight ? "right-[22%]" : "left-[22%]"} top-[25%] z-40 pointer-events-none`}
    >
      <div className={`font-black drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] ${
        isCrit
          ? "text-4xl text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]"
          : isRight
            ? "text-3xl text-cyan-400"
            : "text-3xl text-red-400"
      }`}>
        -{damage}
      </div>
      {isCrit && (
        <div className="text-xs font-bold text-yellow-300 text-center mt-1 tracking-wider">
          CRITICAL!
        </div>
      )}
    </motion.div>
  );
}

// ── Combo Display ─────────────────────────────────────────────
export function ComboIndicator({ combo }) {
  if (combo < 3) return null;

  const tier = combo >= 20 ? 4 : combo >= 15 ? 3 : combo >= 10 ? 2 : 1;
  const colors = [
    "text-cyan-400",     // tier 1: 3-9
    "text-emerald-400",  // tier 2: 10-14
    "text-yellow-400",   // tier 3: 15-19
    "text-orange-400",   // tier 4: 20+
  ];
  const glows = [
    "",
    "drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]",
    "drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]",
    "drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]",
  ];

  return (
    <motion.div
      key={combo}
      initial={{ scale: 1.3, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-2 font-mono font-bold ${colors[tier - 1]} ${glows[tier - 1]}`}
    >
      <motion.span
        className="text-lg"
        animate={combo % 5 === 0 ? { scale: [1, 1.4, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        🔥 {combo}x
      </motion.span>
      <span className="text-xs opacity-70 uppercase tracking-wider">
        {tier >= 4 ? "UNSTOPPABLE" : tier >= 3 ? "ON FIRE" : tier >= 2 ? "GREAT" : "COMBO"}
      </span>
    </motion.div>
  );
}

// ── Floating Particles (ambient) ──────────────────────────────

// Deterministic particle data — avoids Math.random() which causes SSR/client hydration mismatch
const AMBIENT_PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: (i * 41 + 17) % 100,
  y: (i * 29 + 11) % 100,
  size: 1 + (i % 4),
  duration: 4 + (i % 7),
  delay: (i * 0.6) % 5,
  color: i % 2 === 0 ? "rgba(56,189,248,0.3)" : "rgba(250,204,21,0.2)",
}));

export function AmbientParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {AMBIENT_PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: p.color }}
          animate={{ y: [p.y * 2, p.y * 2 - 120, p.y * 2 - 200], opacity: [0, 0.8, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ── Finishing Blow Effect ──────────────────────────────────────
// Dramatic full-screen overlay for the final killing blow in all modes.

const FB_PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  angle: (i / 24) * 360,
  dist: 80 + ((i * 17 + 5) % 120),
  size: 4 + (i % 5) * 2,
  color: i % 3 === 0 ? "#FACC15" : i % 3 === 1 ? "#F87171" : "#FB923C",
  delay: i * 0.015,
}));

const FB_RAYS = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  angle: (i / 16) * 360,
  length: 200 + ((i * 31) % 150),
}));

export function FinishingBlowEffect({ onComplete }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onAnimationComplete={() => {
        // Fire onComplete after full sequence
        setTimeout(() => onComplete?.(), 200);
      }}
    >
      {/* Screen flash */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0.6, 0] }}
        transition={{ duration: 0.6, times: [0, 0.1, 0.3, 1] }}
      />

      {/* Dark vignette after flash */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.4, 0.3, 0] }}
        transition={{ duration: 1.4, times: [0, 0.3, 0.5, 0.8, 1] }}
      />

      {/* Radial shockwave ring */}
      <motion.div
        className="absolute rounded-full border-4 border-yellow-400"
        initial={{ width: 0, height: 0, opacity: 1 }}
        animate={{ width: 800, height: 800, opacity: [1, 0.8, 0] }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ filter: "blur(2px)" }}
      />

      {/* Second shockwave (delayed) */}
      <motion.div
        className="absolute rounded-full border-2 border-orange-400"
        initial={{ width: 0, height: 0, opacity: 0.8 }}
        animate={{ width: 600, height: 600, opacity: [0.8, 0.5, 0] }}
        transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
        style={{ filter: "blur(3px)" }}
      />

      {/* Radial rays */}
      <svg className="absolute" width="800" height="800" viewBox="-400 -400 800 800" style={{ filter: "blur(1px)" }}>
        {FB_RAYS.map((r) => {
          const rad = (r.angle * Math.PI) / 180;
          return (
            <motion.line
              key={r.id}
              x1="0" y1="0"
              x2={Math.cos(rad) * r.length}
              y2={Math.sin(rad) * r.length}
              stroke="#FACC15"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 0.5], opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.8, delay: 0.05 + r.id * 0.02, ease: "easeOut" }}
            />
          );
        })}
        {/* Central starburst */}
        <motion.circle
          cx="0" cy="0" r="20"
          fill="white"
          initial={{ r: 5, opacity: 1 }}
          animate={{ r: [5, 40, 0], opacity: [1, 0.9, 0] }}
          transition={{ duration: 0.6 }}
        />
      </svg>

      {/* Flying particles */}
      {FB_PARTICLES.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        return (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{ width: p.size, height: p.size, background: p.color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(rad) * p.dist,
              y: Math.sin(rad) * p.dist,
              opacity: [1, 0.9, 0],
              scale: [1, 1.5, 0.5],
            }}
            transition={{ duration: 0.7, delay: p.delay, ease: "easeOut" }}
          />
        );
      })}

      {/* FINISHING BLOW text */}
      <motion.div
        className="absolute flex flex-col items-center"
        initial={{ scale: 0, opacity: 0, rotate: -5 }}
        animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1, 0.9], rotate: [-5, 2, 0] }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      >
        <span
          className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-linear-to-b from-yellow-300 via-orange-400 to-red-500 select-none tracking-wider"
          style={{
            filter: "drop-shadow(0 0 20px rgba(250,204,21,0.6)) drop-shadow(0 0 40px rgba(249,115,22,0.4))",
            WebkitTextStroke: "1px rgba(250,204,21,0.3)",
          }}
        >
          FINISHING BLOW
        </span>
        <motion.div
          className="h-1 bg-linear-to-r from-transparent via-yellow-400 to-transparent mt-2"
          initial={{ width: 0 }}
          animate={{ width: [0, 300, 320] }}
          transition={{ duration: 0.5, delay: 0.4 }}
        />
      </motion.div>

      {/* Screen-edge sparks */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={`spark-${i}`}
          className="absolute w-1 h-8 bg-yellow-400 rounded-full"
          style={{
            left: i < 2 ? `${10 + i * 80}%` : "50%",
            top: i < 2 ? "50%" : `${10 + (i - 2) * 80}%`,
            rotate: i < 2 ? "0deg" : "90deg",
            filter: "blur(1px)",
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: [0, 3, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
        />
      ))}
    </motion.div>
  );
}
