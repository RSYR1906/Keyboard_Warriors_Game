"use client";

import BattleArena from "@/components/BattleArena";
import Countdown from "@/components/Countdown";
import GameLayout from "@/components/GameLayout";
import HealthBar from "@/components/HealthBar";
import StageSplash from "@/components/StageSplash";
import TypingBox from "@/components/TypingBox";
import { ComboIndicator, DamageFloat } from "@/components/effects/BattleEffects";
import { useGameState } from "@/context/GameContext";
import { useAudio } from "@/hooks/useAudio";
import { useBattleAnimations } from "@/hooks/useBattleAnimations";
import { useTyping } from "@/hooks/useTyping";
import { resolveBattleRound } from "@/lib/battleResolver";
import { PLAYER_NAME_KEY } from "@/lib/constants";
import { getCpuConfig, MAX_HP } from "@/lib/cpuDifficulty";
import { simulateCPU } from "@/lib/cpuEngine";
import { getPromptText, getStageInfo } from "@/lib/gameEngine";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { memo, Suspense, useCallback, useEffect, useRef, useState } from "react";

// ── Constants ────────────────────────────────────────────────
const CPU_PROGRESS_INTERVAL = 50;

function BattleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlMode = searchParams.get("mode") || "word";
  const urlDifficulty = searchParams.get("difficulty") || "medium";
  const urlStage = parseInt(searchParams.get("stage") || "1", 10);

  const game = useGameState();
  const {
    playTyping, playAttack, playHit, playBGM, stopBGM,
    playCountdownTick, playCountdownGo, playComboMilestone,
  } = useAudio();

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
  const [phase, setPhase] = useState("init"); // init | splash | countdown | active | finished
  const [currentText, setCurrentText] = useState("");
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [cpuResult, setCpuResult] = useState(null);
  const [playerResult, setPlayerResult] = useState(null);
  const [cpuProgress, setCpuProgress] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [playerName, setPlayerName] = useState("You");
  const [shakeActive, setShakeActive] = useState(false);
  const [damageFloats, setDamageFloats] = useState([]);

  // ── Refs for round lifecycle ───────────────────────────
  const cpuTimerRef = useRef(null);
  const cpuProgressRef = useRef(null);
  const roundResolvedRef = useRef(false);
  const playerFinishedRef = useRef(false);
  const cpuFinishedRef = useRef(false);

  // ── Battle stats accumulator ───────────────────────────
  const battleStatsRef = useRef({
    totalWpm: 0,
    totalAccuracy: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    bestMaxCombo: 0,
    roundsPlayed: 0,
  });

  // ── Load player name from localStorage ─────────────────
  useEffect(() => {
    const saved = localStorage.getItem(PLAYER_NAME_KEY);
    if (saved) setPlayerName(saved);
  }, []);

  // ── Initialize game on mount ───────────────────────────
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
    game.initGame({
      mode: urlMode,
      difficulty: urlDifficulty,
      stage: urlStage,
    });
    setPhase(urlMode === "story" ? "splash" : "countdown");
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
        setPlayerResult({ completionTime: Infinity, wpm: 0, accuracy: 0, maxCombo: 0, success: false });
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
        setCpuResult({ completionTime: Infinity, wpm: 0, accuracy: 0, maxCombo: 0, success: false });
      }
    },
    [playAttack],
  );

  // ── Combo milestone callback ───────────────────────────
  const handleComboMilestone = useCallback(
    (count) => {
      playComboMilestone();
    },
    [playComboMilestone],
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

  // ── Trigger screen shake ───────────────────────────────
  const triggerShake = useCallback(() => {
    setShakeActive(true);
    setTimeout(() => setShakeActive(false), 400);
  }, []);

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

    // Accumulate battle stats
    const stats = battleStatsRef.current;
    stats.totalWpm += playerResult.wpm;
    stats.totalAccuracy += playerResult.accuracy;
    stats.roundsPlayed += 1;
    if ((playerResult.maxCombo || 0) > stats.bestMaxCombo) {
      stats.bestMaxCombo = playerResult.maxCombo || 0;
    }
    if (resolution.type === "hp") {
      if (resolution.winner === "player") {
        stats.totalDamageDealt += resolution.damage;
      } else {
        stats.totalDamageTaken += resolution.damage;
      }
    }

    // Apply game-state mutations
    if (resolution.type === "sentence") {
      game.recordRoundWin(resolution.winner);
    } else {
      game.applyDamage(resolution.damageTarget, resolution.damage);
    }

    // Screen shake + damage float for HP modes
    if (resolution.type === "hp") {
      triggerShake();
      const floatId = Date.now();
      const isCrit = resolution.damage >= 30;
      setDamageFloats((prev) => [
        ...prev,
        {
          id: floatId,
          damage: resolution.damage,
          side: resolution.damageTarget === "player" ? "left" : "right",
          isCrit,
        },
      ]);
      setTimeout(() => {
        setDamageFloats((prev) => prev.filter((f) => f.id !== floatId));
      }, 1300);
    }

    // Play the attack animation, then handle navigation or next round
    playAttackSequence(resolution.winner, resolution.message, () => {
      if (resolution.shouldStopBGM) stopBGM();
      if (resolution.navigateTo) {
        // Append battle stats to result URL
        const s = battleStatsRef.current;
        const avgWpm = s.roundsPlayed > 0 ? Math.round(s.totalWpm / s.roundsPlayed) : 0;
        const avgAcc = s.roundsPlayed > 0 ? Math.round(s.totalAccuracy / s.roundsPlayed) : 0;
        const statsQuery = `&wpm=${avgWpm}&acc=${avgAcc}&dealt=${s.totalDamageDealt}&taken=${s.totalDamageTaken}&combo=${s.bestMaxCombo}&rounds=${s.roundsPlayed}`;
        router.push(resolution.navigateTo + statsQuery);
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
    triggerShake,
  ]);

  // Trigger resolution when both results are in
  useEffect(() => {
    if (playerResult && cpuResult) resolveRound();
  }, [playerResult, cpuResult, resolveRound]);

  // ── Typing hook ────────────────────────────────────────
  const { input, handleChange, handleKeyDown, inputRef, isComplete, isReady, combo } =
    useTyping({
      target: currentText || "",
      onComplete: handlePlayerComplete,
      active: phase === "active",
      onKeystroke: playTyping,
      onComboMilestone: handleComboMilestone,
    });

  // ── Countdown completion ───────────────────────────────
  const handleCountdownComplete = useCallback(() => {
    setPhase("active");
  }, []);

  // ── Story splash timer ─────────────────────────────────
  useEffect(() => {
    if (phase !== "splash") return;
    const timer = setTimeout(() => setPhase("countdown"), 2000);
    return () => clearTimeout(timer);
  }, [phase]);

  const stageInfo = urlMode === "story" ? getStageInfo(urlStage) : null;

  // ── Render ─────────────────────────────────────────────
  return (
    <motion.div
      className="relative min-h-screen overflow-hidden"
      animate={
        shakeActive
          ? { x: [0, -6, 6, -5, 5, -3, 3, 0], y: [0, -3, 3, -2, 2, 0] }
          : {}
      }
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
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

      {/* Floating damage numbers */}
      <AnimatePresence>
        {damageFloats.map((f) => (
          <DamageFloat key={f.id} damage={f.damage} side={f.side} isCrit={f.isCrit} />
        ))}
      </AnimatePresence>

      {/* Stage Splash for Story Mode */}
      {urlMode === "story" && (
        <StageSplash
          stage={urlStage}
          title={stageInfo?.title || ""}
          visible={phase === "splash"}
        />
      )}

      {/* Countdown overlay */}
      {phase === "countdown" && (
        <Countdown
          onComplete={handleCountdownComplete}
          playCountdownTick={playCountdownTick}
          playCountdownGo={playCountdownGo}
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
              {/* Combo indicator */}
              <div className="flex justify-end mb-2 min-h-7">
                <AnimatePresence>
                  {combo >= 3 && <ComboIndicator combo={combo} />}
                </AnimatePresence>
              </div>

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

          {(phase === "init" || phase === "countdown") && (
            <div className="text-gray-400 font-mono animate-pulse text-center">
              {phase === "init" ? "Preparing battle..." : ""}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Small presentational sub-components ──────────────────────

const ModeInfoBar = memo(function ModeInfoBar({ urlMode, urlStage, urlDifficulty, round, playerWins, cpuWins }) {
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
});

const CpuProgressBar = memo(function CpuProgressBar({ progress }) {
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
});

const PlayerStats = memo(function PlayerStats({ result }) {
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
});

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
