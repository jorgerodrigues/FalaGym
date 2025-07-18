import { describe, it, expect } from "vitest";
import { 
  calculateRecencyWeight, 
  calculateGranularRecencyWeight 
} from "../calculateRecencyWeight";

describe("calculateRecencyWeight", () => {
  // Helper function to create dates
  const createDate = (year: number, month: number, day: number) => 
    new Date(year, month - 1, day, 12, 0, 0); // noon time

  describe("Basic functionality", () => {
    it("should return 1.0 for same day sessions", () => {
      const sessionDate = createDate(2024, 1, 15);
      const currentDate = createDate(2024, 1, 15);
      
      const result = calculateRecencyWeight(sessionDate, currentDate);
      expect(result).toBe(1.0);
    });

    it("should return 1.0 for sessions within the same day", () => {
      const sessionDate = new Date(2024, 0, 15, 9, 0, 0); // 9 AM
      const currentDate = new Date(2024, 0, 15, 17, 0, 0); // 5 PM same day
      
      const result = calculateRecencyWeight(sessionDate, currentDate);
      expect(result).toBe(1.0);
    });

    it("should return 0.95 for sessions 1 day ago", () => {
      const sessionDate = createDate(2024, 1, 14);
      const currentDate = createDate(2024, 1, 15);
      
      const result = calculateRecencyWeight(sessionDate, currentDate);
      expect(result).toBeCloseTo(0.95, 10);
    });

    it("should return 0.95^2 for sessions 2 days ago", () => {
      const sessionDate = createDate(2024, 1, 13);
      const currentDate = createDate(2024, 1, 15);
      
      const result = calculateRecencyWeight(sessionDate, currentDate);
      expect(result).toBeCloseTo(0.95 * 0.95, 10);
    });

    it("should return 0.95^7 for sessions 1 week ago", () => {
      const sessionDate = createDate(2024, 1, 8);
      const currentDate = createDate(2024, 1, 15);
      
      const result = calculateRecencyWeight(sessionDate, currentDate);
      const expected = Math.pow(0.95, 7);
      expect(result).toBeCloseTo(expected, 10);
    });

    it("should return very small weight for very old sessions", () => {
      const sessionDate = createDate(2024, 1, 1);
      const currentDate = createDate(2024, 12, 31); // ~365 days later
      
      const result = calculateRecencyWeight(sessionDate, currentDate);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(0.01);
    });
  });

  describe("Edge cases", () => {
    it("should return 1.0 for future session dates", () => {
      const sessionDate = createDate(2024, 1, 16);
      const currentDate = createDate(2024, 1, 15);
      
      const result = calculateRecencyWeight(sessionDate, currentDate);
      expect(result).toBe(1.0);
    });

    it("should handle same timestamp", () => {
      const timestamp = new Date(2024, 0, 15, 12, 0, 0);
      
      const result = calculateRecencyWeight(timestamp, timestamp);
      expect(result).toBe(1.0);
    });

    it("should handle small time differences within same day", () => {
      const sessionDate = new Date(2024, 0, 15, 12, 0, 0);
      const currentDate = new Date(2024, 0, 15, 12, 30, 0); // 30 minutes later
      
      const result = calculateRecencyWeight(sessionDate, currentDate);
      expect(result).toBe(1.0);
    });

    it("should handle midnight boundary correctly", () => {
      const sessionDate = new Date(2024, 0, 15, 23, 59, 59);
      const currentDate = new Date(2024, 0, 16, 0, 0, 1); // just after midnight
      
      const result = calculateRecencyWeight(sessionDate, currentDate);
      expect(result).toBe(1.0); // Should still be considered same day
    });
  });

  describe("Input validation", () => {
    it("should throw error for invalid session timestamp", () => {
      const invalidDate = new Date("invalid");
      const validDate = new Date(2024, 0, 15);
      
      expect(() => calculateRecencyWeight(invalidDate, validDate))
        .toThrow("Invalid timestamp provided");
    });

    it("should throw error for invalid current timestamp", () => {
      const validDate = new Date(2024, 0, 15);
      const invalidDate = new Date("invalid");
      
      expect(() => calculateRecencyWeight(validDate, invalidDate))
        .toThrow("Invalid timestamp provided");
    });

    it("should accept numeric timestamps", () => {
      const sessionTime = new Date(2024, 0, 14).getTime();
      const currentTime = new Date(2024, 0, 15).getTime();
      
      const result = calculateRecencyWeight(sessionTime, currentTime);
      expect(result).toBeCloseTo(0.95, 10);
    });

    it("should accept mixed timestamp types", () => {
      const sessionDate = new Date(2024, 0, 14);
      const currentTime = new Date(2024, 0, 15).getTime();
      
      const result = calculateRecencyWeight(sessionDate, currentTime);
      expect(result).toBeCloseTo(0.95, 10);
    });
  });

  describe("Mathematical precision", () => {
    it("should calculate known values correctly", () => {
      // Test specific known calculation
      const sessionDate = createDate(2024, 1, 1);
      const currentDate = createDate(2024, 1, 8); // 7 days
      
      const result = calculateRecencyWeight(sessionDate, currentDate);
      const expected = Math.pow(0.95, 7); // 0.95^7 ≈ 0.6983
      expect(result).toBeCloseTo(expected, 10);
    });

    it("should handle fractional days by rounding down", () => {
      const sessionDate = new Date(2024, 0, 15, 12, 0, 0);
      const currentDate = new Date(2024, 0, 16, 6, 0, 0); // 18 hours later
      
      const result = calculateRecencyWeight(sessionDate, currentDate);
      // Should be treated as 0 full days since it's less than 24 hours
      expect(result).toBe(1.0);
    });

    it("should handle exactly 24 hours as 1 day", () => {
      const sessionDate = new Date(2024, 0, 15, 12, 0, 0);
      const currentDate = new Date(2024, 0, 16, 12, 0, 0); // exactly 24 hours
      
      const result = calculateRecencyWeight(sessionDate, currentDate);
      expect(result).toBeCloseTo(0.95, 10);
    });
  });
});

describe("calculateGranularRecencyWeight", () => {
  describe("Basic functionality", () => {
    it("should return 1.0 for very recent sessions", () => {
      const sessionDate = new Date(2024, 0, 15, 12, 0, 0);
      const currentDate = new Date(2024, 0, 15, 12, 5, 0); // 5 minutes later
      
      const result = calculateGranularRecencyWeight(sessionDate, currentDate);
      expect(result).toBe(1.0);
    });

    it("should return fractional weight for partial days", () => {
      const sessionDate = new Date(2024, 0, 15, 12, 0, 0);
      const currentDate = new Date(2024, 0, 16, 0, 0, 0); // 12 hours later (0.5 days)
      
      const result = calculateGranularRecencyWeight(sessionDate, currentDate);
      const expected = Math.pow(0.95, 0.5);
      expect(result).toBeCloseTo(expected, 10);
    });

    it("should handle full days with fractional precision", () => {
      const sessionDate = new Date(2024, 0, 15, 12, 0, 0);
      const currentDate = new Date(2024, 0, 16, 18, 0, 0); // 30 hours later (1.25 days)
      
      const result = calculateGranularRecencyWeight(sessionDate, currentDate);
      const expected = Math.pow(0.95, 1.25);
      expect(result).toBeCloseTo(expected, 10);
    });
  });

  describe("Edge cases", () => {
    it("should return 1.0 for future session dates", () => {
      const sessionDate = new Date(2024, 0, 16, 12, 0, 0);
      const currentDate = new Date(2024, 0, 15, 12, 0, 0);
      
      const result = calculateGranularRecencyWeight(sessionDate, currentDate);
      expect(result).toBe(1.0);
    });

    it("should handle very small time differences", () => {
      const sessionDate = new Date(2024, 0, 15, 12, 0, 0);
      const currentDate = new Date(2024, 0, 15, 12, 0, 30); // 30 seconds later
      
      const result = calculateGranularRecencyWeight(sessionDate, currentDate);
      expect(result).toBe(1.0);
    });
  });

  describe("Input validation", () => {
    it("should throw error for invalid timestamps", () => {
      const invalidDate = new Date("invalid");
      const validDate = new Date(2024, 0, 15);
      
      expect(() => calculateGranularRecencyWeight(invalidDate, validDate))
        .toThrow("Invalid timestamp provided");
    });

    it("should accept numeric timestamps", () => {
      const sessionTime = new Date(2024, 0, 15, 12, 0, 0).getTime();
      const currentTime = new Date(2024, 0, 15, 18, 0, 0).getTime(); // 6 hours later
      
      const result = calculateGranularRecencyWeight(sessionTime, currentTime);
      const expected = Math.pow(0.95, 0.25); // 0.25 days
      expect(result).toBeCloseTo(expected, 10);
    });
  });

  describe("Comparison with basic version", () => {
    it("should give different results for partial days", () => {
      const sessionDate = new Date(2024, 0, 15, 12, 0, 0);
      const currentDate = new Date(2024, 0, 16, 0, 0, 0); // 12 hours later
      
      const basicResult = calculateRecencyWeight(sessionDate, currentDate);
      const granularResult = calculateGranularRecencyWeight(sessionDate, currentDate);
      
      // Basic should return 1.0 (same day), granular should be < 1.0
      expect(basicResult).toBe(1.0);
      expect(granularResult).toBeLessThan(1.0);
      expect(granularResult).toBeGreaterThan(0.9);
    });

    it("should give same results for full days", () => {
      const sessionDate = new Date(2024, 0, 15, 12, 0, 0);
      const currentDate = new Date(2024, 0, 16, 12, 0, 0); // exactly 24 hours
      
      const basicResult = calculateRecencyWeight(sessionDate, currentDate);
      const granularResult = calculateGranularRecencyWeight(sessionDate, currentDate);
      
      expect(basicResult).toBeCloseTo(granularResult, 10);
      expect(basicResult).toBeCloseTo(0.95, 10);
    });
  });
});