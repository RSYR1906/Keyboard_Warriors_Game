"use client";

import { computeAccuracy, computeWPM } from "@/lib/typingEngine";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useTyping — tracks user typing input against a target string.
 * Typing fills characters up to target length, then the player must
 * press Space to submit their attempt.
 *
 * @param {Object}   opts
 * @param {string}   opts.target     - the text the user must type
 * @param {Function} opts.onComplete - called with { wpm, accuracy, completionTime } when submitted
 * @param {boolean}  opts.active     - whether typing is enabled
 * @param {Function} opts.onKeystroke - called on each keystroke (for audio)
 * @returns {{ input, handleChange, handleKeyDown, reset, inputRef, isComplete, isReady }}
 */
export function useTyping({ target, onComplete, active = true, onKeystroke }) {
  const [input, setInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isReady, setIsReady] = useState(false); // all chars typed, waiting for space
  const [prevTarget, setPrevTarget] = useState(target);
  const startTimeRef = useRef(null);
  const inputRef = useRef(null);

  // Reset when target changes (using derived state pattern)
  if (prevTarget !== target) {
    setPrevTarget(target);
    setInput("");
    setIsComplete(false);
    setIsReady(false);
  }

  // Clear startTime via effect when target changes
  useEffect(() => {
    startTimeRef.current = null;
  }, [target]);

  // Auto-focus input when active or target changes
  useEffect(() => {
    if (active && inputRef.current) {
      inputRef.current.focus();
    }
  }, [active, target]);

  const handleChange = useCallback(
    (e) => {
      if (!active || isComplete) return;

      const value = e.target.value;

      // Start timer on first keystroke
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      // Don't allow typing past the target length
      if (value.length > target.length) return;

      setInput(value);

      // Fire keystroke callback (for audio)
      if (onKeystroke) onKeystroke();

      // Check if all characters typed — mark as ready for submission
      if (value.length === target.length) {
        setIsReady(true);
      } else {
        setIsReady(false);
      }
    },
    [active, isComplete, target, onKeystroke]
  );

  // Handle keydown for spacebar submission
  const handleKeyDown = useCallback(
    (e) => {
      if (!active || isComplete) return;

      if (e.key === " " && isReady) {
        e.preventDefault();

        const endTime = Date.now();
        const wpm = computeWPM(startTimeRef.current, endTime, input.length);
        const accuracy = computeAccuracy(input, target);
        const completionTime = endTime - startTimeRef.current;

        setIsComplete(true);
        setIsReady(false);

        if (onComplete) {
          onComplete({ wpm, accuracy, completionTime });
        }
      }
    },
    [active, isComplete, isReady, input, target, onComplete]
  );

  const reset = useCallback(() => {
    setInput("");
    setIsComplete(false);
    setIsReady(false);
    startTimeRef.current = null;
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  }, []);

  return { input, handleChange, handleKeyDown, reset, inputRef, isComplete, isReady };
}
