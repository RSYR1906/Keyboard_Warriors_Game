"use client";

import { MAX_HP } from "@/lib/cpuDifficulty";
import { createContext, useCallback, useContext, useState } from "react";

// ── Default state ───────────────────────────────────────────
const defaultState = {
  mode: null,          // "story" | "sentence" | "word"
  difficulty: null,    // "easy" | "medium" | "hard" (word & sentence only)
  playerHP: MAX_HP,
  cpuHP: MAX_HP,
  currentStage: 1,     // story mode: 1–10
  round: 1,            // sentence mode: current round (1–3)
  playerWins: 0,       // sentence mode: rounds won
  cpuWins: 0,          // sentence mode: rounds won
  gameStatus: "menu",  // "menu" | "playing" | "result"
  phase: "idle",       // "idle" | "splash" | "active" | "finished"
  result: null,        // "win" | "lose" | null
};

// ── Context ─────────────────────────────────────────────────
const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, setState] = useState(defaultState);

  // ── Initialize a new game ───────────────────────────────
  const initGame = useCallback(({ mode, difficulty, stage }) => {
    setState({
      ...defaultState,
      mode,
      difficulty: difficulty || null,
      currentStage: stage || 1,
      playerHP: MAX_HP,
      cpuHP: MAX_HP,
      gameStatus: "playing",
      phase: mode === "story" ? "splash" : "active",
      round: 1,
      playerWins: 0,
      cpuWins: 0,
      result: null,
    });
  }, []);

  // ── Apply damage to a target ────────────────────────────
  const applyDamage = useCallback((target, amount) => {
    setState((prev) => {
      const key = target === "cpu" ? "cpuHP" : "playerHP";
      const newHP = Math.max(0, prev[key] - amount);
      return { ...prev, [key]: newHP };
    });
  }, []);

  // ── Sentence Mode: advance to next round ────────────────
  const advanceRound = useCallback(() => {
    setState((prev) => ({
      ...prev,
      round: prev.round + 1,
    }));
  }, []);

  // ── Record a round win (sentence mode) ──────────────────
  const recordRoundWin = useCallback((winner) => {
    setState((prev) => {
      const key = winner === "player" ? "playerWins" : "cpuWins";
      return { ...prev, [key]: prev[key] + 1 };
    });
  }, []);

  const value = {
    ...state,
    initGame,
    applyDamage,
    advanceRound,
    recordRoundWin,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameState() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGameState must be used within <GameProvider>");
  return ctx;
}
