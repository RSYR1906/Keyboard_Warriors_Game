import { BASE_DAMAGE, FIXED_ROUND_DAMAGE } from "@/lib/cpuDifficulty";
import { calcDamage, determineRoundWinner } from "@/lib/damageEngine";
import { describe, expect, it } from "vitest";

describe("calcDamage", () => {
  it("returns fixed damage for sentence mode regardless of stats", () => {
    const dmg = calcDamage("sentence", { wpm: 100, accuracy: 100 });
    expect(dmg).toBe(FIXED_ROUND_DAMAGE);
  });

  it("returns fixed damage for sentence mode even with low stats", () => {
    const dmg = calcDamage("sentence", { wpm: 10, accuracy: 50 });
    expect(dmg).toBe(FIXED_ROUND_DAMAGE);
  });

  it("scales damage with WPM for word mode", () => {
    const lowWPM = calcDamage("word", { wpm: 20, accuracy: 100 });
    const highWPM = calcDamage("word", { wpm: 80, accuracy: 100 });
    expect(highWPM).toBeGreaterThan(lowWPM);
  });

  it("scales damage with accuracy for word mode", () => {
    const lowAcc = calcDamage("word", { wpm: 60, accuracy: 50 });
    const highAcc = calcDamage("word", { wpm: 60, accuracy: 100 });
    expect(highAcc).toBeGreaterThan(lowAcc);
  });

  it("always returns at least 1 damage", () => {
    const dmg = calcDamage("word", { wpm: 0, accuracy: 0 });
    expect(dmg).toBeGreaterThanOrEqual(1);
  });

  it("works for story mode identically to word mode", () => {
    const wordDmg = calcDamage("word", { wpm: 60, accuracy: 90 });
    const storyDmg = calcDamage("story", { wpm: 60, accuracy: 90 });
    expect(storyDmg).toBe(wordDmg);
  });

  it("returns reasonable damage for average typing", () => {
    // 50 WPM, 90% accuracy
    const dmg = calcDamage("word", { wpm: 50, accuracy: 90 });
    expect(dmg).toBeGreaterThan(BASE_DAMAGE);
    expect(dmg).toBeLessThan(100);
  });
});

describe("determineRoundWinner", () => {
  it("player wins when faster", () => {
    const player = { wpm: 60, accuracy: 95, completionTime: 3000 };
    const cpu = { wpm: 50, accuracy: 95, completionTime: 4000 };
    expect(determineRoundWinner(player, cpu)).toBe("player");
  });

  it("cpu wins when faster", () => {
    const player = { wpm: 40, accuracy: 95, completionTime: 5000 };
    const cpu = { wpm: 60, accuracy: 95, completionTime: 3000 };
    expect(determineRoundWinner(player, cpu)).toBe("cpu");
  });

  it("player wins when times are equal (tie goes to player)", () => {
    const player = { wpm: 60, accuracy: 95, completionTime: 3000 };
    const cpu = { wpm: 60, accuracy: 95, completionTime: 3000 };
    expect(determineRoundWinner(player, cpu)).toBe("player");
  });

  it("completion time is the primary factor, not WPM", () => {
    // Player has lower WPM but faster completion
    const player = { wpm: 30, accuracy: 80, completionTime: 2000 };
    const cpu = { wpm: 100, accuracy: 99, completionTime: 3000 };
    expect(determineRoundWinner(player, cpu)).toBe("player");
  });
});
