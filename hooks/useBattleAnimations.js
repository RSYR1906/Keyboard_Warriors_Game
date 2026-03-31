"use client";

import { useCallback, useRef, useState } from "react";

/**
 * useBattleAnimations — manages all attack / hit / round-message
 * animation state and the sequenced attack timeline.
 *
 * Consolidates 5 separate useState calls and the duplicated
 * setTimeout cleanup into one reusable hook.
 *
 * @param {Object}   opts
 * @param {Function} opts.playHit  - audio callback for hit SFX
 * @returns animation state + playAttackSequence + clearAnimations
 */
export function useBattleAnimations({ playHit }) {
  const [animState, setAnimState] = useState({
    playerAttacking: false,
    cpuAttacking: false,
    playerHit: false,
    cpuHit: false,
    roundMessage: "",
  });

  // Keep refs to timers so we can clean up on unmount / re-trigger
  const clearTimerRef = useRef(null);
  const completeTimerRef = useRef(null);

  /**
   * Play the full attack → hit → clear → callback sequence.
   *
   * @param {"player"|"cpu"} winner   - who won the round
   * @param {string}         message  - round result message to display
   * @param {Function}       onComplete - called after the full animation (800ms)
   */
  const playAttackSequence = useCallback(
    (winner, message, onComplete) => {
      // Clear any pending timers from a previous sequence
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current);

      // Immediately show attack + hit
      if (winner === "player") {
        setAnimState({
          playerAttacking: true,
          cpuAttacking: false,
          playerHit: false,
          cpuHit: true,
          roundMessage: message,
        });
      } else {
        setAnimState({
          playerAttacking: false,
          cpuAttacking: true,
          playerHit: true,
          cpuHit: false,
          roundMessage: message,
        });
      }
      playHit();

      // Clear hit/attack visuals after 500ms
      clearTimerRef.current = setTimeout(() => {
        setAnimState((prev) => ({
          ...prev,
          playerAttacking: false,
          cpuAttacking: false,
          playerHit: false,
          cpuHit: false,
        }));
      }, 500);

      // Fire completion callback after 800ms
      completeTimerRef.current = setTimeout(() => {
        setAnimState((prev) => ({ ...prev, roundMessage: "" }));
        onComplete?.();
      }, 800);
    },
    [playHit],
  );

  return {
    ...animState,
    playAttackSequence,
  };
}
