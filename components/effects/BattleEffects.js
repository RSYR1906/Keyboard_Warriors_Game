"use client";

import { motion } from "framer-motion";
import { useState } from "react";

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

// ── Floating Particles (ambient) ──────────────────────────────
export function AmbientParticles() {
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 4 + Math.random() * 6,
      delay: Math.random() * 5,
      color: Math.random() > 0.5 ? "rgba(56,189,248,0.3)" : "rgba(250,204,21,0.2)",
    }))
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
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
