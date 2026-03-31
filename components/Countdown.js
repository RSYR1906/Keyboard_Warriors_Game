"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

/** Milliseconds shown per countdown number (3, 2, 1). */
const TICK_DURATION_MS = 800;
/** Milliseconds the "GO!" text is shown before calling onComplete. */
const GO_DURATION_MS = 600;

/**
 * Countdown — displays 3 → 2 → 1 → GO! with animation and sound cues.
 *
 * @param {Object}   props
 * @param {Function} props.onComplete        - called when countdown finishes
 * @param {Function} props.playCountdownTick - sound for 3, 2, 1
 * @param {Function} props.playCountdownGo   - sound for GO!
 */
export default function Countdown({ onComplete, playCountdownTick, playCountdownGo }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      playCountdownTick?.();
      const timer = setTimeout(() => setCount((c) => c - 1), TICK_DURATION_MS);
      return () => clearTimeout(timer);
    } else {
      playCountdownGo?.();
      const timer = setTimeout(() => onComplete?.(), GO_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [count]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 2.5, opacity: 0, filter: "blur(8px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          exit={{ scale: 0.3, opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative"
        >
          {/* Glow ring behind the number */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1.5, opacity: [0, 0.4, 0] }}
            transition={{ duration: 0.7 }}
          >
            <div
              className={`w-32 h-32 rounded-full ${
                count > 0
                  ? "bg-cyan-500/20 shadow-[0_0_60px_rgba(6,182,212,0.3)]"
                  : "bg-yellow-500/20 shadow-[0_0_60px_rgba(250,204,21,0.4)]"
              }`}
            />
          </motion.div>

          {/* Number / GO! text */}
          <div
            className={`text-8xl md:text-9xl font-black select-none ${
              count > 0
                ? "text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                : "text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]"
            }`}
          >
            {count > 0 ? count : "GO!"}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
