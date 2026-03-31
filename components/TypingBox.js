"use client";

import { getCharStates } from "@/lib/typingEngine";
import { motion } from "framer-motion";
import { memo } from "react";

/**
 * TypingBox — renders the target text with per-character highlighting
 * and a hidden input for capturing keystrokes.
 */
export default memo(function TypingBox({
  target,
  input,
  onChangeHandler,
  onKeyDownHandler,
  inputRef,
  isComplete,
  isReady,
  active,
}) {
  const charStates = getCharStates(input, target);
  const cursorPos = input.length;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Target text display */}
      <div
        className={`relative border rounded-xl p-6 mb-4 font-mono text-lg md:text-xl leading-relaxed tracking-wide cursor-text min-h-20 select-none transition-all duration-300 ${
          isReady && !isComplete
            ? "bg-yellow-900/30 border-yellow-500/70 shadow-[0_0_15px_rgba(250,204,21,0.2)]"
            : isComplete
              ? "bg-emerald-900/20 border-emerald-500/50"
              : "bg-gray-900/80 border-gray-700"
        }`}
        onClick={() => inputRef?.current?.focus()}
      >
        {target.split("").map((char, i) => {
          const state = charStates[i];
          let className = "transition-colors duration-75 ";
          const isCursor = i === cursorPos;

          if (state === "correct") {
            className += "text-emerald-400";
          } else if (state === "incorrect") {
            className += "text-red-400 bg-red-400/20 rounded-sm";
          } else {
            className += "text-gray-500";
          }

          return (
            <span key={i} className="relative">
              {isCursor && !isComplete && (
                <motion.span
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-yellow-400"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                />
              )}
              <span className={className}>
                {char === " " ? "\u00A0" : char}
              </span>
            </span>
          );
        })}

        {/* Completion indicator */}
        {isComplete && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="ml-2 text-emerald-400"
          >
            ✓
          </motion.span>
        )}
      </div>

      {/* Hidden input for capturing keystrokes */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={onChangeHandler}
        onKeyDown={onKeyDownHandler}
        disabled={!active || isComplete}
        className="absolute opacity-0 w-0 h-0"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />

      {/* Status bar */}
      <div className="flex justify-between text-sm text-gray-400 px-2">
        <span>{input.length} / {target.length} characters</span>
        {!active && !isComplete && !isReady && (
          <span className="text-yellow-400 animate-pulse">Waiting...</span>
        )}
        {active && !isComplete && !isReady && (
          <span className="text-cyan-400">Type now!</span>
        )}
        {isReady && !isComplete && (
          <motion.span
            className="text-yellow-400 font-bold"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            ⎵ Press SPACE to submit!
          </motion.span>
        )}
        {isComplete && (
          <span className="text-emerald-400">Submitted! ✓</span>
        )}
      </div>
    </div>
  );
});
