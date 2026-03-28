"use client";

import BattleArena from "@/components/BattleArena";
import GameLayout from "@/components/GameLayout";
import HealthBar from "@/components/HealthBar";
import StageSplash from "@/components/StageSplash";
import TypingBox from "@/components/TypingBox";
import { useGameState } from "@/context/GameContext";
import { useAudio } from "@/hooks/useAudio";
import { useBattleAnimations } from "@/hooks/useBattleAnimations";
import { useTyping } from "@/hooks/useTyping";
import { resolveBattleRound } from "@/lib/battleResolver";
import { getCpuConfig, MAX_HP } from "@/lib/cpuDifficulty";
import { simulateCPU } from "@/lib/cpuEngine";
import { getPromptText, getStageInfo } from "@/lib/gameEngine";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

// ── Constants ────────────────────────────────────────────────
const PLAYER_NAME_KEY = "typebattle_player_name";
const CPU_PROGRESS_INTERVAL = 50;

function BattleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlMode = searchParams.get("mode") || "word";
  const urlDifficulty = searchParams.get("difficulty") || "medium";
  const urlStage = parseInt(searchParams.get("stage") || "1", 10);

  const game = useGameState();
  const { playTyping, playAttack, playHit, playBGM, stopBGM } = useAudio();

  // ── Animation state (consolidated) ─────────────────────
  const {
    playerAttacking,
    cpuAttacking,
    playerHit,
    cpuHit,
    roundMessage,
    playAttackSequence,
  } = useBattleAnimations({ playHit });

  // ── Local battle state ─────────────────────────────────
  const [phase, setPhase] = useState("init"); // init | splash | active | finished
  const [currentText, setCurrentText] = useState("");
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [cpuResult, setCpuResult] = useState(null);
  const [playerResult, setPlayerResult] = useState(null);
  const [cpuProgress, setCpuProgress] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [playerName, setPlayerName] = useState("You");

  // ── Refs for round lifecycle ───────────────────────────
  const cpuTimerRef = useRef(null);
  const cpuProgressRef = useRef(null);
  const roundResolvedRef = useRef(false);
  const playerFinishedRef = useRef(false);
  const cpuFinishedRef = useRef(false);

  // ── Load player name from localStorage ─────────────────
  useEffect(() => {
    const saved = localStorage.getItem(PLAYER_NAME_KEY);
    if (saved) queueMicrotask(() => setPlayerName(saved));
  }, []);

  // ── Initialize game on mount ───────────────────────────
  useEffect(() => {
    if (initialized) return;
    queueMicrotask(() => {
      setInitialized(true);
      game.initGame({
        mode: urlMode,
        difficulty: urlDifficulty,
        stage: urlStage,
      });
      setPhase(urlMode === "story" ? "splash" : "active");
    });
  }, [initialized, game, urlMode, urlDifficulty, urlStage]);

  // ── BGM lifecycle ──────────────────────────────────────
  useEffect(() => {
    if (phase === "active") playBGM();
    return () => {
      if (phase === "finished") stopBGM();
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Set current text & reset round state ───────────────
  useEffect(() => {
    if (phase !== "active") return;
    roundResolvedRef.current = false;
    playerFinishedRef.current = false;
    cpuFinishedRef.current = false;

    queueMicrotask(() => {
      setCurrentText(
        getPromptText(urlMode, {
          difficulty: urlDifficulty,
          stage: urlStage,
          sentenceIdx,
        }),
      );
      setCpuResult(null);
      setPlayerResult(null);
      setCpuProgress(0);
    });
  }, [phase, sentenceIdx, urlMode, urlDifficulty, urlStage]);

  // ── CPU simulation ─────────────────────────────────────
  useEffect(() => {
    if (phase !== "active" || !currentText) return;

    const cpuConfig = getCpuConfig(urlMode, {
      stage: urlStage,
      difficulty: urlDifficulty,
    });

    // Clean up any previous CPU timers
    if (cpuTimerRef.current) clearTimeout(cpuTimerRef.current);
    if (cpuProgressRef.current) clearInterval(cpuProgressRef.current);

    // Estimate total time for progress bar
    const charCount = currentText.length;
    const wordCount = charCount / 5;
    const baseTime = (wordCount / cpuConfig.wpm) * 60000;
    const totalTime =
      baseTime * (0.9 + Math.random() * 0.2) + 300 + Math.random() * 900;

    // Animate CPU progress bar
    let elapsed = 0;
    cpuProgressRef.current = setInterval(() => {
      elapsed += CPU_PROGRESS_INTERVAL;
      setCpuProgress(Math.min((elapsed / totalTime) * 100, 99));
    }, CPU_PROGRESS_INTERVAL);

    // Run CPU typing simulation
    simulateCPU({
      wpm: cpuConfig.wpm,
      accuracy: cpuConfig.accuracy,
      text: currentText,
    }).then((result) => {
      if (roundResolvedRef.current) return;
      cpuFinishedRef.current = true;
      if (cpuProgressRef.current) clearInterval(cpuProgressRef.current);
      setCpuProgress(100);
      setCpuResult(result);

      // If player hasn't finished, inject a synthetic "didn't finish" result
      if (!playerFinishedRef.current) {
        setPlayerResult({ completionTime: Infinity, wpm: 0, accuracy: 0, success: false });
      }
    });

    return () => {
      if (cpuProgressRef.current) clearInterval(cpuProgressRef.current);
    };
  }, [phase, currentText, urlMode, urlStage, urlDifficulty]);

  // ── Player typing completion ───────────────────────────
  const handlePlayerComplete = useCallback(
    (stats) => {
      if (roundResolvedRef.current || playerFinishedRef.current) return;
      playerFinishedRef.current = true;
      playAttack();
      setPlayerResult(stats);

      // If CPU hasn't finished, inject a synthetic "didn't finish" result
      if (!cpuFinishedRef.current) {
        if (cpuProgressRef.current) clearInterval(cpuProgressRef.current);
        setCpuProgress(100);
        setCpuResult({ completionTime: Infinity, wpm: 0, accuracy: 0, success: false });
      }
    },
    [playAttack],
  );

  // ── Advance to the next round / sentence ───────────────
  const advanceToNextRound = useCallback(
    (resolution) => {
      if (resolution.type === "sentence") {
        game.advanceRound();
        setSentenceIdx((prev) => prev + 1);
      } else if (urlMode === "story") {
        setSentenceIdx(resolution.nextSentenceIdx);
      } else {
        // word mode — just pick a new word
        setSentenceIdx((prev) => prev + 1);
      }
      setPlayerResult(null);
      setCpuResult(null);
      setPhase("active");
    },
    [game, urlMode],
  );

  // ── Resolve round when both sides finish ───────────────
  const resolveRound = useCallback(() => {
    if (!playerResult || !cpuResult || roundResolvedRef.current) return;
    roundResolvedRef.current = true;

    const resolution = resolveBattleRound({
      mode: urlMode,
      playerResult,
      cpuResult,
      gameState: game,
      urlDifficulty,
      urlStage,
      sentenceIdx,
    });

    // Apply game-state mutations
    if (resolution.type === "sentence") {
      game.recordRoundWin(resolution.winner);
    } else {
      game.applyDamage(resolution.damageTarget, resolution.damage);
    }

    // Play the attack animation, then handle navigation or next round
    playAttackSequence(resolution.winner, resolution.message, () => {
      if (resolution.shouldStopBGM) stopBGM();
      if (resolution.navigateTo) {
        router.push(resolution.navigateTo);
      } else {
        advanceToNextRound(resolution);
      }
    });
  }, [
    playerResult,
    cpuResult,
    urlMode,
    urlDifficulty,
    urlStage,
    sentenceIdx,
    game,
    router,
    stopBGM,
    playAttackSequence,
    advanceToNextRound,
  ]);

  // Trigger resolution when both results are in
  useEffect(() => {
    if (playerResult && cpuResult) resolveRound();
  }, [playerResult, cpuResult, resolveRound]);

  // ── Typing hook ────────────────────────────────────────
  const { input, handleChange, handleKeyDown, inputRef, isComplete, isReady } =
    useTyping({
      target: currentText || "",
      onComplete: handlePlayerComplete,
      active: phase === "active",
      onKeystroke: playTyping,
    });

  // ── Story splash timer ─────────────────────────────────
  useEffect(() => {
    if (phase !== "splash") return;
    const timer = setTimeout(() => setPhase("active"), 2000);
    return () => clearTimeout(timer);
  }, [phase]);

  const stageInfo = urlMode === "story" ? getStageInfo(urlStage) : null;

  // ── Render ─────────────────────────────────────────────
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fullscreen Battle Arena (background layer) */}
      <BattleArena
        mode={urlMode}
        stage={urlStage}
        playerAttacking={playerAttacking}
        cpuAttacking={cpuAttacking}
        playerIsHit={playerHit}
        cpuIsHit={cpuHit}
        roundMessage={roundMessage}
        playerName={playerName}
      />

      {/* Stage Splash for Story Mode */}
      {urlMode === "story" && (
        <StageSplash
          stage={urlStage}
          title={stageInfo?.title || ""}
          visible={phase === "splash"}
        />
      )}

      {/* ── UI Overlay (on top of arena) ──────────────── */}
      <div className="relative z-10 min-h-screen flex flex-col pointer-events-none">
        {/* Top bar: mode info + health bars */}
        <div className="pointer-events-auto pt-4 pb-2 px-4">
          <ModeInfoBar
            urlMode={urlMode}
            urlStage={urlStage}
            urlDifficulty={urlDifficulty}
            round={game.round}
            playerWins={game.playerWins}
            cpuWins={game.cpuWins}
          />
          {urlMode !== "sentence" && (
            <div className="w-full max-w-3xl mx-auto flex justify-between gap-8">
              <HealthBar label={playerName} hp={game.playerHP} maxHp={MAX_HP} isPlayer isHit={playerHit} />
              <HealthBar label="CPU" hp={game.cpuHP} maxHp={MAX_HP} isPlayer={false} isHit={cpuHit} />
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom: Typing Area */}
        <div className="pointer-events-auto pb-6 px-4">
          {phase === "active" && currentText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-3xl mx-auto"
            >
              <TypingBox
                target={currentText}
                input={input}
                onChangeHandler={handleChange}
                onKeyDownHandler={handleKeyDown}
                inputRef={inputRef}
                isComplete={isComplete}
                isReady={isReady}
                active={phase === "active"}
              />
              <CpuProgressBar progress={cpuProgress} />
              {playerResult && <PlayerStats result={playerResult} />}
            </motion.div>
          )}

          {phase === "init" && (
            <div className="text-gray-400 font-mono animate-pulse text-center">
              Preparing battle...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small presentational sub-components ──────────────────────

function ModeInfoBar({ urlMode, urlStage, urlDifficulty, round, playerWins, cpuWins }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-3">
      <div className="text-sm font-mono text-gray-300/80 uppercase tracking-wider mb-1 drop-shadow-md">
        {urlMode === "story" && `Story Mode — Stage ${urlStage}`}
        {urlMode === "sentence" && `Sentence Mode — Round ${round}/3`}
        {urlMode === "word" && `Word Mode — ${urlDifficulty}`}
      </div>
      {urlMode === "sentence" && (
        <div className="text-xs font-mono text-gray-400/80 drop-shadow-md">
          Score: You {playerWins} — {cpuWins} CPU
        </div>
      )}
    </motion.div>
  );
}

function CpuProgressBar({ progress }) {
  return (
    <div className="mt-4 w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-1 drop-shadow-md">
        <span>CPU Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-gray-800/60 rounded-full overflow-hidden border border-gray-700/50 backdrop-blur-sm">
        <motion.div
          className="h-full bg-red-500/80 rounded-full"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
}

function PlayerStats({ result }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-3 flex gap-6 justify-center text-sm font-mono drop-shadow-md"
    >
      <span className="text-cyan-400">WPM: {result.wpm}</span>
      <span className="text-emerald-400">Accuracy: {result.accuracy}%</span>
    </motion.div>
  );
}

// ── Page wrapper with Suspense ───────────────────────────────

export default function BattlePage() {
  return (
    <Suspense
      fallback={
        <GameLayout>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-400 font-mono animate-pulse">Loading battle...</div>
          </div>
        </GameLayout>
      }
    >
      <BattleContent />
    </Suspense>
  );
}
