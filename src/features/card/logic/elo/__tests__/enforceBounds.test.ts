import { describe, it, expect } from "vitest";
import { enforceBounds, enforceExponentialBounds } from "../enforceBounds";

describe("enforceBounds", () => {
  describe("Normal range - no dampening", () => {
    it("should return full change when ELO is in normal range", () => {
      const result = enforceBounds(1200, 20);
      expect(result).toBe(20);
    });

    it("should return full negative change when ELO is in normal range", () => {
      const result = enforceBounds(1200, -20);
      expect(result).toBe(-20);
    });

    it("should allow large changes in normal range", () => {
      const result = enforceBounds(1200, 50);
      expect(result).toBe(50);
    });

    it("should handle zero change", () => {
      const result = enforceBounds(1200, 0);
      expect(result).toBe(0);
    });
  });

  describe("Hard bounds enforcement", () => {
    it("should prevent going below 800", () => {
      const result = enforceBounds(800, -10);
      expect(result).toBe(0);
    });

    it("should prevent going above 2000", () => {
      const result = enforceBounds(2000, 10);
      expect(result).toBe(0);
    });

    it("should allow positive changes at minimum ELO", () => {
      const result = enforceBounds(800, 10);
      expect(result).toBe(10);
    });

    it("should allow negative changes at maximum ELO", () => {
      const result = enforceBounds(2000, -10);
      expect(result).toBe(-10);
    });

    it("should cap change to not exceed maximum", () => {
      const result = enforceBounds(1990, 20);
      expect(result).toBe(10); // Should cap at 2000
    });

    it("should cap change to not go below minimum", () => {
      const result = enforceBounds(810, -20);
      expect(result).toBe(-10); // Should cap at 800
    });
  });

  describe("Progressive dampening", () => {
    it("should apply dampening near upper bound", () => {
      // ELO 1970 is 30 points from upper bound (2000)
      // Within dampening zone (50 points), so should be dampened
      const result = enforceBounds(1970, 20);
      expect(result).toBeLessThan(20);
      expect(result).toBeGreaterThan(0);
    });

    it("should apply dampening near lower bound", () => {
      // ELO 830 is 30 points from lower bound (800)
      // Within dampening zone (50 points), so should be dampened
      const result = enforceBounds(830, -20);
      expect(result).toBeGreaterThan(-20);
      expect(result).toBeLessThan(0);
    });

    it("should apply stronger dampening closer to bounds", () => {
      // Compare dampening at different distances from upper bound
      // Use smaller changes to avoid hard capping
      const result1 = enforceBounds(1970, 15); // 30 points from bound
      const result2 = enforceBounds(1980, 15); // 20 points from bound
      const result3 = enforceBounds(1990, 8); // 10 points from bound, change won't exceed
      
      expect(result1).toBeGreaterThan(result2);
      expect(result2).toBeGreaterThan(result3);
    });

    it("should apply minimum dampening factor", () => {
      // Very close to bound should still allow some change
      const result = enforceBounds(1999, 20);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(2); // Should be heavily dampened but not zero
    });
  });

  describe("Edge cases", () => {
    it("should handle ELO exactly at dampening zone boundary", () => {
      // 1950 is exactly at the start of upper dampening zone
      const result = enforceBounds(1950, 20);
      expect(result).toBe(20); // Should not be dampened yet
    });

    it("should handle ELO exactly at dampening zone boundary (lower)", () => {
      // 850 is exactly at the start of lower dampening zone
      const result = enforceBounds(850, -20);
      expect(result).toBe(-20); // Should not be dampened yet
    });

    it("should handle very large proposed changes", () => {
      const result = enforceBounds(1200, 1000);
      expect(result).toBe(800); // Should cap at maximum (2000 - 1200 = 800)
    });

    it("should handle very large negative proposed changes", () => {
      const result = enforceBounds(1200, -1000);
      expect(result).toBe(-400); // Should cap at minimum (800 - 1200 = -400)
    });

    it("should handle floating point ELO values", () => {
      const result = enforceBounds(1200.5, 20.7);
      expect(result).toBe(20.7);
    });
  });

  describe("Boundary conditions", () => {
    it("should handle ELO at exact bounds", () => {
      expect(enforceBounds(800, 0)).toBe(0);
      expect(enforceBounds(2000, 0)).toBe(0);
    });

    it("should handle ELO slightly below minimum", () => {
      // This shouldn't happen in normal operation, but test robustness
      const result = enforceBounds(799, 10);
      expect(result).toBe(10);
    });

    it("should handle ELO slightly above maximum", () => {
      // This shouldn't happen in normal operation, but test robustness
      const result = enforceBounds(2001, -10);
      expect(result).toBe(-10);
    });
  });

  describe("Dampening zone calculations", () => {
    it("should start dampening at 1950 for upper bound", () => {
      const noDampening = enforceBounds(1949, 20);
      const withDampening = enforceBounds(1951, 20);
      
      expect(noDampening).toBe(20);
      expect(withDampening).toBeLessThan(20);
    });

    it("should start dampening at 850 for lower bound", () => {
      const noDampening = enforceBounds(851, -20);
      const withDampening = enforceBounds(849, -20);
      
      expect(noDampening).toBe(-20);
      expect(withDampening).toBeGreaterThan(-20);
    });
  });
});

describe("enforceExponentialBounds", () => {
  describe("Normal range behavior", () => {
    it("should return full change when ELO is in normal range", () => {
      const result = enforceExponentialBounds(1200, 20);
      expect(result).toBe(20);
    });

    it("should handle changes within safe zone", () => {
      // Safe zone is 100 points from bounds (900-1900)
      const result = enforceExponentialBounds(1500, 30);
      expect(result).toBe(30);
    });
  });

  describe("Hard bounds enforcement", () => {
    it("should prevent going below 800", () => {
      const result = enforceExponentialBounds(800, -10);
      expect(result).toBe(0);
    });

    it("should prevent going above 2000", () => {
      const result = enforceExponentialBounds(2000, 10);
      expect(result).toBe(0);
    });

    it("should cap changes at hard limits", () => {
      const result = enforceExponentialBounds(1990, 20);
      expect(result).toBe(10); // Should cap at 2000
    });
  });

  describe("Exponential dampening", () => {
    it("should apply exponential dampening near upper bound", () => {
      // Within 100-point dampening zone
      const result = enforceExponentialBounds(1950, 20);
      expect(result).toBeLessThan(20);
      expect(result).toBeGreaterThan(0);
    });

    it("should apply exponential dampening near lower bound", () => {
      const result = enforceExponentialBounds(850, -20);
      expect(result).toBeGreaterThan(-20);
      expect(result).toBeLessThan(0);
    });

    it("should apply stronger dampening closer to bounds", () => {
      // Test quadratic dampening curve
      // Use smaller changes to avoid hard capping
      const result1 = enforceExponentialBounds(1950, 15); // 50 points from bound
      const result2 = enforceExponentialBounds(1975, 15); // 25 points from bound
      const result3 = enforceExponentialBounds(1990, 8); // 10 points from bound, change won't exceed
      
      expect(result1).toBeGreaterThan(result2);
      expect(result2).toBeGreaterThan(result3);
    });

    it("should maintain minimum change factor", () => {
      // Even very close to bound should allow some change
      // Use smaller change to avoid hard capping
      const result = enforceExponentialBounds(1999, 1);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeGreaterThanOrEqual(0.05 * 1); // At least 5% of original change
    });
  });

  describe("Comparison with linear dampening", () => {
    it("should generally be more restrictive than linear near bounds", () => {
      const currentElo = 1980;
      const change = 15;
      
      const linearResult = enforceBounds(currentElo, change);
      const exponentialResult = enforceExponentialBounds(currentElo, change);
      
      // Exponential should be more restrictive (smaller change)
      expect(exponentialResult).toBeLessThan(linearResult);
    });

    it("should have larger dampening zone", () => {
      const currentElo = 1920; // 80 points from upper bound
      const change = 20;
      
      const linearResult = enforceBounds(currentElo, change);
      const exponentialResult = enforceExponentialBounds(currentElo, change);
      
      // Linear should not dampen (outside 50-point zone)
      // Exponential should dampen (within 100-point zone)
      expect(linearResult).toBe(20);
      expect(exponentialResult).toBeLessThan(20);
    });
  });

  describe("Edge cases", () => {
    it("should handle very large changes", () => {
      const result = enforceExponentialBounds(1200, 1000);
      expect(result).toBe(800); // Should cap at maximum
    });

    it("should handle floating point values", () => {
      const result = enforceExponentialBounds(1200.5, 20.7);
      expect(result).toBe(20.7);
    });

    it("should handle zero change", () => {
      const result = enforceExponentialBounds(1950, 0);
      expect(result).toBe(0);
    });
  });
});