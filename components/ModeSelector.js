"use client";

import { motion } from "framer-motion";

/**
 * ModeSelector — a large card button used on the main menu.
 */
export default function ModeSelector({ title, description, icon, onClick, color = "cyan" }) {
  const colorMap = {
    cyan: {
      border: "border-cyan-500/30 hover:border-cyan-400/60",
      bg: "hover:bg-cyan-500/10",
      title: "text-cyan-400",
      icon: "text-cyan-400",
    },
    purple: {
      border: "border-purple-500/30 hover:border-purple-400/60",
      bg: "hover:bg-purple-500/10",
      title: "text-purple-400",
      icon: "text-purple-400",
    },
    amber: {
      border: "border-amber-500/30 hover:border-amber-400/60",
      bg: "hover:bg-amber-500/10",
      title: "text-amber-400",
      icon: "text-amber-400",
    },
  };

  const c = colorMap[color] || colorMap.cyan;

  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`
        group relative w-full max-w-sm p-6 rounded-2xl border-2
        bg-gray-900/60 backdrop-blur-sm cursor-pointer
        transition-colors duration-300
        ${c.border} ${c.bg}
      `}
    >
      {/* Icon */}
      <div className={`text-4xl mb-3 ${c.icon}`}>{icon}</div>

      {/* Title */}
      <h3 className={`text-xl font-bold mb-2 ${c.title}`}>{title}</h3>

      {/* Description */}
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>

      {/* Arrow indicator */}
      <div className={`absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity ${c.title}`}>
        →
      </div>
    </motion.button>
  );
}
