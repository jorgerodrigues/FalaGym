import { describe, it, expect } from "vitest";
import { calculateEloChange } from "../calculateEloChange";

describe("calculateEloChange", () => {
  describe("Basic ELO calculations", () => {
    it("should calculate correct ELO change when user wins against equal opponent", () => {
      // When both have same ELO (1200), expected score is 0.5
      // Win (score=1) should give: 32 * (1 - 0.5) = 16 points
      const result = calculateEloChange(1200, 1200, 1);
      expect(result).toBeCloseTo(16, 2);
    });

    it("should calculate correct ELO change when user loses against equal opponent", () => {
      // When both have same ELO (1200), expected score is 0.5
      // Loss (score=0) should give: 32 * (0 - 0.5) = -16 points
      const result = calculateEloChange(1200, 1200, 0);
      expect(result).toBeCloseTo(-16, 2);
    });

    it("should give smaller gains when beating weaker opponent", () => {
      // User (1400) vs Sentence (1200) - user is stronger
      // Expected score for user should be > 0.5, so win gives fewer points
      const result = calculateEloChange(1400, 1200, 1);
      expect(result).toBeLessThan(16);
      expect(result).toBeGreaterThan(0);
    });

    it("should give larger gains when beating stronger opponent", () => {
      // User (1200) vs Sentence (1400) - sentence is stronger
      // Expected score for user should be < 0.5, so win gives more points
      const result = calculateEloChange(1200, 1400, 1);
      expect(result).toBeGreaterThan(16);
    });

    it("should give smaller losses when losing to stronger opponent", () => {
      // User (1200) vs Sentence (1400) - sentence is stronger
      // Expected score for user should be < 0.5, so loss gives smaller penalty
      const result = calculateEloChange(1200, 1400, 0);
      expect(result).toBeGreaterThan(-16);
      expect(result).toBeLessThan(0);
    });

    it("should give larger losses when losing to weaker opponent", () => {
      // User (1400) vs Sentence (1200) - user is stronger
      // Expected score for user should be > 0.5, so loss gives larger penalty
      const result = calculateEloChange(1400, 1200, 0);
      expect(result).toBeLessThan(-16);
    });
  });

  describe("Edge cases", () => {
    it("should handle extreme ELO differences - much stronger user wins", () => {
      // User (1800) vs Sentence (1000) - user much stronger
      // Should give very small gain for winning
      const result = calculateEloChange(1800, 1000, 1);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(5);
    });

    it("should handle extreme ELO differences - much weaker user wins", () => {
      // User (1000) vs Sentence (1800) - user much weaker
      // Should give very large gain for winning
      const result = calculateEloChange(1000, 1800, 1);
      expect(result).toBeGreaterThan(25);
      expect(result).toBeLessThan(32);
    });

    it("should handle minimum ELO values", () => {
      const result = calculateEloChange(800, 800, 1);
      expect(result).toBeCloseTo(16, 2);
    });

    it("should handle maximum ELO values", () => {
      const result = calculateEloChange(2000, 2000, 0);
      expect(result).toBeCloseTo(-16, 2);
    });

    it("should handle very large ELO differences", () => {
      // Test with extreme difference
      const result = calculateEloChange(800, 2000, 1);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(32);
    });
  });

  describe("Input validation", () => {
    it("should throw error for invalid actual score (not 0 or 1)", () => {
      expect(() => calculateEloChange(1200, 1200, 0.5)).toThrow("actualScore must be 0 or 1");
      expect(() => calculateEloChange(1200, 1200, 2)).toThrow("actualScore must be 0 or 1");
      expect(() => calculateEloChange(1200, 1200, -1)).toThrow("actualScore must be 0 or 1");
    });

    it("should accept valid actual scores", () => {
      expect(() => calculateEloChange(1200, 1200, 0)).not.toThrow();
      expect(() => calculateEloChange(1200, 1200, 1)).not.toThrow();
    });
  });

  describe("Mathematical precision", () => {
    it("should calculate known ELO values correctly", () => {
      // Known calculation: User 1200 vs Sentence 1300, User wins
      // Expected score = 1 / (1 + 10^((1300-1200)/400)) = 1 / (1 + 10^0.25) ≈ 0.36
      // ELO change = 32 * (1 - 0.36) ≈ 20.48
      const result = calculateEloChange(1200, 1300, 1);
      expect(result).toBeCloseTo(20.48, 1);
    });

    it("should return zero change only when actual equals expected", () => {
      // This should never happen with binary outcomes (0 or 1)
      // but mathematically, if expected score = actual score, change = 0
      // For equal opponents, expected = 0.5, so neither 0 nor 1 equals 0.5
      const winResult = calculateEloChange(1200, 1200, 1);
      const loseResult = calculateEloChange(1200, 1200, 0);
      expect(winResult).not.toBeCloseTo(0, 5);
      expect(loseResult).not.toBeCloseTo(0, 5);
    });

    it("should maintain symmetry - win/loss should be equal magnitude for equal ELOs", () => {
      const userElo = 1200;
      const sentenceElo = 1200; // Equal ELOs for symmetry
      const winChange = calculateEloChange(userElo, sentenceElo, 1);
      const lossChange = calculateEloChange(userElo, sentenceElo, 0);
      
      // For equal ELOs, win/loss changes should sum to 0
      expect(Math.abs(winChange + lossChange)).toBeCloseTo(0, 10);
      expect(winChange).toBeGreaterThan(0);
      expect(lossChange).toBeLessThan(0);
    });
  });

  describe("Boundary testing", () => {
    it("should handle floating point ELO values", () => {
      const result = calculateEloChange(1200.5, 1199.7, 1);
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });

    it("should handle negative ELO values", () => {
      // While unusual, the math should still work
      const result = calculateEloChange(-100, 100, 1);
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });
  });
});