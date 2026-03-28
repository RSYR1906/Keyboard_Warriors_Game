"use client";

import { motion } from "framer-motion";

/**
 * GameLayout — shared page wrapper with background and page transitions.
 */
export default function GameLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-br from-gray-950 via-gray-900 to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
      </div>

      {/* Content with page transition */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col"
      >
        {children}
      </motion.main>
    </div>
  );
}
