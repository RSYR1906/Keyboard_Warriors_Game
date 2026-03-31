"use client";

import { computeAccuracy, computeWPM } from "@/lib/typingEngine";
import { useCallback, useEffect, useRef, useState } from "react";

/** Fire combo milestone callback at this interval. */
const COMBO_MILESTONE_INTERVAL = 5;

/**
 * useTyping — tracks user typing input against a target string.
 * Typing fills characters up to target length, then the player must
 * press Space to submit their attempt.
 *
 * @param {Object}   opts
 * @param {string}   opts.target          - the text the user must type
 * @param {Function} opts.onComplete      - called with { wpm, accuracy, completionTime, maxCombo } when submitted
 * @param {boolean}  opts.active          - whether typing is enabled
 * @param {Function} opts.onKeystroke     - called on each keystroke (for audio)
 * @param {Function} opts.onComboMilestone - called with combo count when it hits a multiple of 5
 * @returns {{ input, handleChange, handleKeyDown, reset, inputRef, isComplete, isReady, combo }}
 */
export function useTyping({ target, onComplete, active = true, onKeystroke, onComboMilestone }) {
  const [input, setInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isReady, setIsReady] = useState(false); // all chars typed, waiting for space
  const [prevTarget, setPrevTarget] = useState(target);
  const [combo, setCombo] = useState(0);
  const startTimeRef = useRef(null);
  const inputRef = useRef(null);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const prevLengthRef = useRef(0);

  // Reset when target changes (using derived state pattern)
  if (prevTarget !== target) {
    setPrevTarget(target);
    setInput("");
    setIsComplete(false);
    setIsReady(false);
    setCombo(0);
  }

  // Clear refs via effect when target changes (can't set refs during render)
  useEffect(() => {
    startTimeRef.current = null;
    comboRef.current = 0;
    maxComboRef.current = 0;
    prevLengthRef.current = 0;
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

      // Combo tracking: check if new char is correct
      if (value.length > prevLengthRef.current) {
        const newCharIdx = value.length - 1;
        if (value[newCharIdx] === target[newCharIdx]) {
          comboRef.current += 1;
          if (comboRef.current > maxComboRef.current) {
            maxComboRef.current = comboRef.current;
          }
          setCombo(comboRef.current);
          // Fire milestone callback at multiples of COMBO_MILESTONE_INTERVAL
          if (comboRef.current > 0 && comboRef.current % COMBO_MILESTONE_INTERVAL === 0) {
            onComboMilestone?.(comboRef.current);
          }
        } else {
          comboRef.current = 0;
          setCombo(0);
        }
      } else if (value.length < prevLengthRef.current) {
        // Backspace — reset combo (correction = broken streak)
        comboRef.current = 0;
        setCombo(0);
      }
      prevLengthRef.current = value.length;

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
    [active, isComplete, target, onKeystroke, onComboMilestone]
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
          onComplete({ wpm, accuracy, completionTime, maxCombo: maxComboRef.current });
        }
      }
    },
    [active, isComplete, isReady, input, target, onComplete]
  );

  const reset = useCallback(() => {
    setInput("");
    setIsComplete(false);
    setIsReady(false);
    setCombo(0);
    comboRef.current = 0;
    maxComboRef.current = 0;
    prevLengthRef.current = 0;
    startTimeRef.current = null;
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  }, []);

  return { input, handleChange, handleKeyDown, reset, inputRef, isComplete, isReady, combo };
}
