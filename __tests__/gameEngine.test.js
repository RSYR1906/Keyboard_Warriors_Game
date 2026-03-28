import { getPromptText, getStageInfo, getStageSentenceCount } from "@/lib/gameEngine";
import { describe, expect, it } from "vitest";

describe("getPromptText", () => {
  it("returns a string for word mode (easy)", () => {
    const text = getPromptText("word", { difficulty: "easy" });
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });

  it("returns a string for word mode (medium)", () => {
    const text = getPromptText("word", { difficulty: "medium" });
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });

  it("returns a string for word mode (hard)", () => {
    const text = getPromptText("word", { difficulty: "hard" });
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });

  it("returns a string for sentence mode", () => {
    const text = getPromptText("sentence", { difficulty: "medium" });
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(5);
  });

  it("returns a sentence for story mode stage 1", () => {
    const text = getPromptText("story", { stage: 1, sentenceIdx: 0 });
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });

  it("returns different sentences for different sentence indices", () => {
    const text0 = getPromptText("story", { stage: 1, sentenceIdx: 0 });
    const text1 = getPromptText("story", { stage: 1, sentenceIdx: 1 });
    expect(text0).not.toBe(text1);
  });

  it("returns fallback for invalid story stage", () => {
    const text = getPromptText("story", { stage: 99, sentenceIdx: 0 });
    expect(typeof text).toBe("string");
  });

  it("falls back to medium difficulty when unknown difficulty given", () => {
    const text = getPromptText("word", { difficulty: "extreme" });
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });

  it("returns fallback for unknown mode", () => {
    const text = getPromptText("unknown", {});
    expect(typeof text).toBe("string");
  });
});

describe("getStageSentenceCount", () => {
  it("returns a positive number for valid stages", () => {
    for (let stage = 1; stage <= 10; stage++) {
      const count = getStageSentenceCount(stage);
      expect(count).toBeGreaterThan(0);
    }
  });

  it("returns 0 for invalid stage", () => {
    expect(getStageSentenceCount(99)).toBe(0);
    expect(getStageSentenceCount(0)).toBe(0);
  });

  it("each stage has at least 5 sentences", () => {
    for (let stage = 1; stage <= 10; stage++) {
      expect(getStageSentenceCount(stage)).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("getStageInfo", () => {
  it("returns title and stage number for valid stages", () => {
    const info = getStageInfo(1);
    expect(info.title).toBeDefined();
    expect(typeof info.title).toBe("string");
    expect(info.stage).toBe(1);
  });

  it("returns info for all 10 stages", () => {
    for (let stage = 1; stage <= 10; stage++) {
      const info = getStageInfo(stage);
      expect(info.title.length).toBeGreaterThan(0);
      expect(info.stage).toBe(stage);
    }
  });

  it("returns fallback for invalid stage", () => {
    const info = getStageInfo(99);
    expect(info).toBeDefined();
    expect(info.title).toBe("Unknown");
  });
});
