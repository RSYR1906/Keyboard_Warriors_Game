"use client";

import { AnimatePresence, motion } from "framer-motion";
import { memo } from "react";

/**
 * StageSplash — 2-second animated stage title shown before each Story Mode stage.
 */
export default memo(function StageSplash({ stage, title, visible, onComplete }) {
  return (
    <AnimatePresence mode="wait" onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key={`splash-${stage}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/95 backdrop-blur-sm"
        >
          {/* Stage number */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-cyan-400 text-lg md:text-xl font-mono uppercase tracking-[0.3em] mb-4"
          >
            — Stage {stage} —
          </motion.div>

          {/* Stage title */}
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
            className="text-4xl md:text-6xl font-bold text-white text-center px-4"
          >
            {title}
          </motion.h1>

          {/* Decorative line */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "200px" }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="h-0.5 bg-linear-to-r from-transparent via-cyan-400 to-transparent mt-6"
          />

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.4 }}
            className="text-gray-400 text-sm mt-4 font-mono"
          >
            Prepare yourself...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
