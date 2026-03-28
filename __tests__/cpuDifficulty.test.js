import {
    BASE_DAMAGE,
    CPU_STAGES,
    FIXED_ROUND_DAMAGE,
    getCpuConfig,
    MAX_HP,
    SENTENCE_MODE_CPU,
    WORD_MODE_CPU,
} from "@/lib/cpuDifficulty";
import { describe, expect, it } from "vitest";

describe("CPU_STAGES", () => {
  it("has exactly 10 stages", () => {
    expect(CPU_STAGES).toHaveLength(10);
  });

  it("WPM increases with each stage", () => {
    for (let i = 1; i < CPU_STAGES.length; i++) {
      expect(CPU_STAGES[i].wpm).toBeGreaterThan(CPU_STAGES[i - 1].wpm);
    }
  });

  it("accuracy increases or stays the same with each stage", () => {
    for (let i = 1; i < CPU_STAGES.length; i++) {
      expect(CPU_STAGES[i].accuracy).toBeGreaterThanOrEqual(CPU_STAGES[i - 1].accuracy);
    }
  });

  it("all stages have valid WPM (20-150 range)", () => {
    CPU_STAGES.forEach((s) => {
      expect(s.wpm).toBeGreaterThanOrEqual(20);
      expect(s.wpm).toBeLessThanOrEqual(150);
    });
  });

  it("all stages have accuracy between 0 and 1", () => {
    CPU_STAGES.forEach((s) => {
      expect(s.accuracy).toBeGreaterThan(0);
      expect(s.accuracy).toBeLessThanOrEqual(1);
    });
  });
});

describe("WORD_MODE_CPU", () => {
  it("has easy, medium, hard difficulties", () => {
    expect(WORD_MODE_CPU).toHaveProperty("easy");
    expect(WORD_MODE_CPU).toHaveProperty("medium");
    expect(WORD_MODE_CPU).toHaveProperty("hard");
  });

  it("hard is faster than medium, medium faster than easy", () => {
    expect(WORD_MODE_CPU.hard.wpm).toBeGreaterThan(WORD_MODE_CPU.medium.wpm);
    expect(WORD_MODE_CPU.medium.wpm).toBeGreaterThan(WORD_MODE_CPU.easy.wpm);
  });
});

describe("SENTENCE_MODE_CPU", () => {
  it("has easy, medium, hard difficulties", () => {
    expect(SENTENCE_MODE_CPU).toHaveProperty("easy");
    expect(SENTENCE_MODE_CPU).toHaveProperty("medium");
    expect(SENTENCE_MODE_CPU).toHaveProperty("hard");
  });

  it("hard is faster than medium, medium faster than easy", () => {
    expect(SENTENCE_MODE_CPU.hard.wpm).toBeGreaterThan(SENTENCE_MODE_CPU.medium.wpm);
    expect(SENTENCE_MODE_CPU.medium.wpm).toBeGreaterThan(SENTENCE_MODE_CPU.easy.wpm);
  });
});

describe("getCpuConfig", () => {
  it("returns correct story config for each stage", () => {
    const config = getCpuConfig("story", { stage: 1 });
    expect(config.wpm).toBe(CPU_STAGES[0].wpm);
    expect(config.accuracy).toBe(CPU_STAGES[0].accuracy);
  });

  it("falls back to first stage config for out-of-range stage", () => {
    const config = getCpuConfig("story", { stage: 99 });
    expect(config.wpm).toBe(CPU_STAGES[0].wpm);
    expect(config.accuracy).toBe(CPU_STAGES[0].accuracy);
  });

  it("returns word mode config based on difficulty", () => {
    const easy = getCpuConfig("word", { difficulty: "easy" });
    const hard = getCpuConfig("word", { difficulty: "hard" });
    expect(easy.wpm).toBe(WORD_MODE_CPU.easy.wpm);
    expect(hard.wpm).toBe(WORD_MODE_CPU.hard.wpm);
  });

  it("returns sentence mode config based on difficulty", () => {
    const medium = getCpuConfig("sentence", { difficulty: "medium" });
    expect(medium.wpm).toBe(SENTENCE_MODE_CPU.medium.wpm);
  });

  it("returns default medium config for unknown difficulty", () => {
    const config = getCpuConfig("word", { difficulty: "nightmare" });
    expect(config.wpm).toBe(WORD_MODE_CPU.medium.wpm);
  });

  it("returns fallback for unknown mode", () => {
    const config = getCpuConfig("unknown", {});
    expect(config).toBeDefined();
    expect(config.wpm).toBeDefined();
    expect(config.accuracy).toBeDefined();
  });
});

describe("Constants", () => {
  it("MAX_HP is a positive number", () => {
    expect(MAX_HP).toBeGreaterThan(0);
    expect(MAX_HP).toBe(100);
  });

  it("FIXED_ROUND_DAMAGE is positive", () => {
    expect(FIXED_ROUND_DAMAGE).toBeGreaterThan(0);
  });

  it("BASE_DAMAGE is positive", () => {
    expect(BASE_DAMAGE).toBeGreaterThan(0);
  });

  it("3 rounds of fixed damage can defeat a player (best-of-3 logic)", () => {
    // In sentence mode, if one side wins all rounds, damage should be significant
    expect(FIXED_ROUND_DAMAGE * 3).toBeGreaterThanOrEqual(MAX_HP);
  });
});
