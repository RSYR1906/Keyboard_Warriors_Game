import { computeAccuracy, computeWPM, getCharStates } from "@/lib/typingEngine";
import { describe, expect, it } from "vitest";

describe("computeWPM", () => {
  it("returns 0 when elapsed time is 0 or negative", () => {
    expect(computeWPM(1000, 1000, 50)).toBe(0);
    expect(computeWPM(1000, 999, 50)).toBe(0);
  });

  it("calculates WPM correctly for a known scenario", () => {
    // 50 characters in 60 seconds = 10 words / 1 min = 10 WPM
    const start = 0;
    const end = 60000;
    const wpm = computeWPM(start, end, 50);
    expect(wpm).toBe(10);
  });

  it("calculates WPM correctly for fast typing", () => {
    // 100 characters in 30 seconds = 20 words / 0.5 min = 40 WPM
    const wpm = computeWPM(0, 30000, 100);
    expect(wpm).toBe(40);
  });

  it("handles very short durations", () => {
    // 25 chars in 5 seconds = 5 words / (5/60) min = 60 WPM
    const wpm = computeWPM(0, 5000, 25);
    expect(wpm).toBe(60);
  });

  it("returns a number rounded to 1 decimal", () => {
    const wpm = computeWPM(0, 7000, 25);
    const decimalPlaces = (wpm.toString().split(".")[1] || "").length;
    expect(decimalPlaces).toBeLessThanOrEqual(1);
  });
});

describe("computeAccuracy", () => {
  it("returns 0 for empty input", () => {
    expect(computeAccuracy("", "hello")).toBe(0);
  });

  it("returns 100 for perfect input", () => {
    expect(computeAccuracy("hello", "hello")).toBe(100);
  });

  it("computes partial accuracy correctly", () => {
    // "hxllo" vs "hello" → 4 correct out of 5 = 80%
    expect(computeAccuracy("hxllo", "hello")).toBe(80);
  });

  it("handles completely wrong input", () => {
    // "xxxxx" vs "hello" → 0 correct out of 5 = 0%
    expect(computeAccuracy("xxxxx", "hello")).toBe(0);
  });

  it("handles shorter input than target", () => {
    // "hel" vs "hello" → 3 correct out of 5 = 60%
    expect(computeAccuracy("hel", "hello")).toBe(60);
  });
});

describe("getCharStates", () => {
  it("returns all pending when input is empty", () => {
    const states = getCharStates("", "hello");
    expect(states).toEqual(["pending", "pending", "pending", "pending", "pending"]);
  });

  it("returns correct states for matching input", () => {
    const states = getCharStates("hel", "hello");
    expect(states).toEqual(["correct", "correct", "correct", "pending", "pending"]);
  });

  it("marks incorrect characters", () => {
    const states = getCharStates("hxl", "hello");
    expect(states).toEqual(["correct", "incorrect", "correct", "pending", "pending"]);
  });

  it("handles fully typed correct input", () => {
    const states = getCharStates("hello", "hello");
    expect(states).toEqual(["correct", "correct", "correct", "correct", "correct"]);
  });

  it("handles fully typed incorrect input", () => {
    const states = getCharStates("xxxxx", "hello");
    expect(states).toEqual(["incorrect", "incorrect", "incorrect", "incorrect", "incorrect"]);
  });
});
