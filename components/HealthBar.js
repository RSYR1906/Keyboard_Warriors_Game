"use client";

import { motion } from "framer-motion";

/**
 * HealthBar — displays an animated HP bar for player or CPU.
 */
export default function HealthBar({
  label,
  hp,
  maxHp,
  isPlayer = true,
  isHit = false,
}) {
  const pct = Math.max(0, (hp / maxHp) * 100);

  // Color transitions based on HP percentage
  let barColor = "bg-emerald-500";
  let barGlow = "shadow-emerald-500/50";
  if (pct <= 25) {
    barColor = "bg-red-500";
    barGlow = "shadow-red-500/50";
  } else if (pct <= 50) {
    barColor = "bg-yellow-500";
    barGlow = "shadow-yellow-500/50";
  }

  return (
    <motion.div
      animate={isHit ? { x: [0, -6, 6, -4, 4, 0] } : {}}
      transition={{ duration: 0.4 }}
      className={`w-full max-w-xs ${isPlayer ? "" : "ml-auto"}`}
    >
      {/* Label & HP numbers */}
      <div className="flex justify-between items-center mb-1">
        <span className={`text-sm font-bold uppercase tracking-wider ${isPlayer ? "text-cyan-400" : "text-red-400"}`}>
          {label}
        </span>
        <span className="text-sm font-mono text-gray-300">
          {hp} / {maxHp}
        </span>
      </div>

      {/* Bar container */}
      <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        {/* Animated bar fill */}
        <motion.div
          className={`h-full rounded-full ${barColor} shadow-lg ${barGlow}`}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Hit flash overlay */}
        {isHit && (
          <motion.div
            className="absolute inset-0 bg-red-500/40 rounded-full"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </div>
    </motion.div>
  );
}
