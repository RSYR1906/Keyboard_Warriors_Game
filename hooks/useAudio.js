"use client";

import {
    EpicBGM,
    SpaceMenuBGM,
    generateAttack,
    generateClick,
    generateHit,
    generateModeSelect,
    generateTyping,
    getAudioContext,
    playBuffer,
    resumeAudioContext,
} from "@/lib/audioGenerator";
import { useCallback, useEffect, useRef } from "react";

/**
 * useAudio — synthesises all game sounds via Web Audio API.
 * No .mp3 files needed — everything is generated in real-time.
 */
export function useAudio() {
  const buffers = useRef({});
  const bgmRef = useRef(null);
  const menuBgmRef = useRef(null);
  const initialized = useRef(false);

  // Build all audio buffers once the AudioContext exists
  const ensureInit = useCallback(() => {
    if (initialized.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    initialized.current = true;

    buffers.current = {
      click: generateClick(ctx),
      modeSelect: generateModeSelect(ctx),
      typing: generateTyping(ctx),
      attack: generateAttack(ctx),
      hit: generateHit(ctx),
    };

    bgmRef.current = new EpicBGM(ctx);
    menuBgmRef.current = new SpaceMenuBGM(ctx);
  }, []);

  // Initialize on mount
  useEffect(() => {
    ensureInit();
    return () => {
      // Cleanup BGM on unmount
      if (bgmRef.current) bgmRef.current.stop();
      if (menuBgmRef.current) menuBgmRef.current.stop();
    };
  }, [ensureInit]);

  // Resume context + ensure buffers on any user interaction
  const ensureReady = useCallback(() => {
    resumeAudioContext();
    ensureInit();
  }, [ensureInit]);

  // ── Play helpers ─────────────────────────────────────────
  const playTyping = useCallback(() => {
    ensureReady();
    const ctx = getAudioContext();
    playBuffer(ctx, buffers.current.typing, 0.25);
  }, [ensureReady]);

  const playClick = useCallback(() => {
    ensureReady();
    const ctx = getAudioContext();
    playBuffer(ctx, buffers.current.click, 0.4);
  }, [ensureReady]);

  const playModeSelect = useCallback(() => {
    ensureReady();
    const ctx = getAudioContext();
    playBuffer(ctx, buffers.current.modeSelect, 0.5);
  }, [ensureReady]);

  const playAttack = useCallback(() => {
    ensureReady();
    const ctx = getAudioContext();
    playBuffer(ctx, buffers.current.attack, 0.5);
  }, [ensureReady]);

  const playHit = useCallback(() => {
    ensureReady();
    const ctx = getAudioContext();
    playBuffer(ctx, buffers.current.hit, 0.5);
  }, [ensureReady]);

  const playBGM = useCallback(() => {
    ensureReady();
    if (bgmRef.current) bgmRef.current.start(0.2);
  }, [ensureReady]);

  const stopBGM = useCallback(() => {
    if (bgmRef.current) bgmRef.current.stop();
  }, []);

  const playMenuBGM = useCallback(() => {
    ensureReady();
    if (menuBgmRef.current) menuBgmRef.current.start(0.18);
  }, [ensureReady]);

  const stopMenuBGM = useCallback(() => {
    if (menuBgmRef.current) menuBgmRef.current.stop();
  }, []);

  return { playTyping, playClick, playModeSelect, playAttack, playHit, playBGM, stopBGM, playMenuBGM, stopMenuBGM };
}
