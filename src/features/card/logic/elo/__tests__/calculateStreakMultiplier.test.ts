import { describe, it, expect } from "vitest";
import { 
  calculateStreakMultiplier, 
  calculateProgressiveStreakMultiplier 
} from "../calculateStreakMultiplier";

describe("calculateStreakMultiplier", () => {
  describe("Basic functionality", () => {
    it("should return 1.0 for no streak (position 0)", () => {
      const result = calculateStreakMultiplier(0);
      expect(result).toBe(1.0);
    });

    it("should return 1.0 for position 1", () => {
      const result = calculateStreakMultiplier(1);
      expect(result).toBe(1.0);
    });

    it("should return 1.0 for position 2", () => {
      const result = calculateStreakMultiplier(2);
      expect(result).toBe(1.0);
    });

    it("should return 1.2 for streak start (position 3)", () => {
      const result = calculateStreakMultiplier(3);
      expect(result).toBe(1.2);
    });

    it("should return 1.2 for position 4", () => {
      const result = calculateStreakMultiplier(4);
      expect(result).toBe(1.2);
    });

    it("should return 1.2 for position 5", () => {
      const result = calculateStreakMultiplier(5);
      expect(result).toBe(1.2);
    });

    it("should return 1.2 for large streak positions", () => {
      const result = calculateStreakMultiplier(10);
      expect(result).toBe(1.2);
    });
  });

  describe("Edge cases", () => {
    it("should handle very large streak positions", () => {
      const result = calculateStreakMultiplier(1000);
      expect(result).toBe(1.2);
    });

    it("should handle floating point inputs by rounding down", () => {
      expect(calculateStreakMultiplier(2.9)).toBe(1.0);
      expect(calculateStreakMultiplier(3.1)).toBe(1.2);
      expect(calculateStreakMultiplier(3.9)).toBe(1.2);
    });

    it("should throw error for negative streak positions", () => {
      expect(() => calculateStreakMultiplier(-1)).toThrow("streakPosition must be non-negative");
      expect(() => calculateStreakMultiplier(-0.1)).toThrow("streakPosition must be non-negative");
    });
  });

  describe("Input validation", () => {
    it("should accept valid streak positions", () => {
      expect(() => calculateStreakMultiplier(0)).not.toThrow();
      expect(() => calculateStreakMultiplier(1)).not.toThrow();
      expect(() => calculateStreakMultiplier(10)).not.toThrow();
    });

    it("should handle zero correctly", () => {
      const result = calculateStreakMultiplier(0);
      expect(result).toBe(1.0);
    });
  });

  describe("Streak thresholds", () => {
    it("should have clear threshold at position 3", () => {
      const beforeStreak = calculateStreakMultiplier(2);
      const atStreak = calculateStreakMultiplier(3);
      
      expect(beforeStreak).toBe(1.0);
      expect(atStreak).toBe(1.2);
      expect(atStreak).toBeGreaterThan(beforeStreak);
    });

    it("should maintain consistent multiplier for all streak positions", () => {
      const positions = [3, 4, 5, 6, 7, 8, 9, 10];
      const results = positions.map(pos => calculateStreakMultiplier(pos));
      
      // All should be 1.2
      results.forEach(result => {
        expect(result).toBe(1.2);
      });
    });
  });
});

describe("calculateProgressiveStreakMultiplier", () => {
  describe("Basic functionality", () => {
    it("should return 1.0 for no streak (positions 0-2)", () => {
      expect(calculateProgressiveStreakMultiplier(0)).toBe(1.0);
      expect(calculateProgressiveStreakMultiplier(1)).toBe(1.0);
      expect(calculateProgressiveStreakMultiplier(2)).toBe(1.0);
    });

    it("should return 1.2 for streak start (position 3)", () => {
      const result = calculateProgressiveStreakMultiplier(3);
      expect(result).toBe(1.2);
    });

    it("should increase progressively for longer streaks", () => {
      const position3 = calculateProgressiveStreakMultiplier(3);
      const position4 = calculateProgressiveStreakMultiplier(4);
      const position5 = calculateProgressiveStreakMultiplier(5);
      
      expect(position4).toBeGreaterThan(position3);
      expect(position5).toBeGreaterThan(position4);
    });

    it("should cap at 1.5 for very long streaks", () => {
      const longStreak = calculateProgressiveStreakMultiplier(100);
      expect(longStreak).toBe(1.5);
    });
  });

  describe("Progressive scaling", () => {
    it("should increase by 0.05 per position after position 3", () => {
      const position3 = calculateProgressiveStreakMultiplier(3); // 1.2
      const position4 = calculateProgressiveStreakMultiplier(4); // 1.25
      const position5 = calculateProgressiveStreakMultiplier(5); // 1.3
      
      expect(position3).toBeCloseTo(1.2, 2);
      expect(position4).toBeCloseTo(1.25, 2);
      expect(position5).toBeCloseTo(1.3, 2);
    });

    it("should reach cap at position 9", () => {
      // 1.2 + 0.05 * (9 - 3) = 1.2 + 0.3 = 1.5
      const position9 = calculateProgressiveStreakMultiplier(9);
      expect(position9).toBeCloseTo(1.5, 2);
    });

    it("should maintain cap for positions beyond 9", () => {
      const position10 = calculateProgressiveStreakMultiplier(10);
      const position20 = calculateProgressiveStreakMultiplier(20);
      
      expect(position10).toBe(1.5);
      expect(position20).toBe(1.5);
    });
  });

  describe("Edge cases", () => {
    it("should handle floating point inputs by rounding down", () => {
      expect(calculateProgressiveStreakMultiplier(2.9)).toBe(1.0);
      expect(calculateProgressiveStreakMultiplier(3.1)).toBe(1.2);
    });

    it("should throw error for negative streak positions", () => {
      expect(() => calculateProgressiveStreakMultiplier(-1))
        .toThrow("streakPosition must be non-negative");
    });
  });
});