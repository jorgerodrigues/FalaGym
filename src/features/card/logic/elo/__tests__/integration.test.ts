import { describe, it, expect } from "vitest";
import { calculateEloChange } from "../calculateEloChange";
import { calculateStreakMultiplier } from "../calculateStreakMultiplier";
import { calculateRecencyWeight } from "../calculateRecencyWeight";
import { enforceBounds } from "../enforceBounds";
import { SCORES } from "../../../../../constants/elo";

describe("ELO System Integration", () => {
  /**
   * Complete ELO calculation pipeline combining all functions
   */
  function calculateCompleteEloChange(
    userElo: number,
    sentenceElo: number,
    actualScore: number,
    streakPosition: number,
    sessionTimestamp: Date | number,
    currentTimestamp: Date | number
  ): number {
    // Step 1: Calculate base ELO change
    const baseChange = calculateEloChange(userElo, sentenceElo, actualScore);
    
    // Step 2: Apply streak multiplier
    const streakMultiplier = calculateStreakMultiplier(streakPosition);
    const streakAdjustedChange = baseChange * streakMultiplier;
    
    // Step 3: Apply recency weight
    const recencyWeight = calculateRecencyWeight(sessionTimestamp, currentTimestamp);
    const recencyAdjustedChange = streakAdjustedChange * recencyWeight;
    
    // Step 4: Enforce bounds
    const boundedChange = enforceBounds(userElo, recencyAdjustedChange);
    
    return boundedChange;
  }

  describe("Complete ELO calculation pipeline", () => {
    it("should calculate ELO change with all factors applied", () => {
      const userElo = 1200;
      const sentenceElo = 1300;
      const actualScore = SCORES.CORRECT;
      const streakPosition = 5; // In streak
      const sessionTimestamp = new Date(2024, 0, 14);
      const currentTimestamp = new Date(2024, 0, 15); // 1 day later
      
      const result = calculateCompleteEloChange(
        userElo, sentenceElo, actualScore, streakPosition, 
        sessionTimestamp, currentTimestamp
      );
      
      // Should be positive (correct answer)
      expect(result).toBeGreaterThan(0);
      
      // Should be less than base change due to recency weight
      const baseChange = calculateEloChange(userElo, sentenceElo, actualScore);
      expect(result).toBeLessThan(baseChange * 1.2); // 1.2 is streak multiplier
      
      // Should be more than base change without streak
      expect(result).toBeGreaterThan(baseChange * 0.95); // 0.95 is recency weight
    });

    it("should handle losing streak scenarios", () => {
      const userElo = 1400;
      const sentenceElo = 1200;
      const actualScore = SCORES.INCORRECT;
      const streakPosition = 2; // No streak bonus
      const sessionTimestamp = new Date(2024, 0, 15);
      const currentTimestamp = new Date(2024, 0, 15); // Same day
      
      const result = calculateCompleteEloChange(
        userElo, sentenceElo, actualScore, streakPosition, 
        sessionTimestamp, currentTimestamp
      );
      
      // Should be negative (incorrect answer)
      expect(result).toBeLessThan(0);
      
      // Should be equal to base change (no streak, same day)
      const baseChange = calculateEloChange(userElo, sentenceElo, actualScore);
      expect(result).toBeCloseTo(baseChange, 5);
    });

    it("should apply all bonuses for perfect streak scenario", () => {
      const userElo = 1100;
      const sentenceElo = 1500;
      const actualScore = SCORES.CORRECT;
      const streakPosition = 10; // Long streak
      const sessionTimestamp = new Date(2024, 0, 15);
      const currentTimestamp = new Date(2024, 0, 15); // Same day
      
      const result = calculateCompleteEloChange(
        userElo, sentenceElo, actualScore, streakPosition, 
        sessionTimestamp, currentTimestamp
      );
      
      // Should be positive and enhanced
      expect(result).toBeGreaterThan(0);
      
      // Should be exactly base change * streak multiplier (same day, no recency penalty)
      const baseChange = calculateEloChange(userElo, sentenceElo, actualScore);
      const expectedChange = baseChange * 1.2; // 1.2 is streak multiplier
      expect(result).toBeCloseTo(expectedChange, 5);
    });

    it("should handle old session with recency penalty", () => {
      const userElo = 1200;
      const sentenceElo = 1200;
      const actualScore = SCORES.CORRECT;
      const streakPosition = 5; // In streak
      const sessionTimestamp = new Date(2024, 0, 8);
      const currentTimestamp = new Date(2024, 0, 15); // 7 days later
      
      const result = calculateCompleteEloChange(
        userElo, sentenceElo, actualScore, streakPosition, 
        sessionTimestamp, currentTimestamp
      );
      
      // Should be positive but significantly reduced
      expect(result).toBeGreaterThan(0);
      
      // Should be less than same-day calculation
      const sameDayResult = calculateCompleteEloChange(
        userElo, sentenceElo, actualScore, streakPosition, 
        new Date(2024, 0, 15), new Date(2024, 0, 15)
      );
      expect(result).toBeLessThan(sameDayResult);
    });
  });

  describe("Bounds enforcement in full pipeline", () => {
    it("should prevent exceeding maximum ELO", () => {
      const userElo = 1980;
      const sentenceElo = 1000;
      const actualScore = SCORES.CORRECT;
      const streakPosition = 10; // Big streak bonus
      const sessionTimestamp = new Date(2024, 0, 15);
      const currentTimestamp = new Date(2024, 0, 15); // Same day
      
      const result = calculateCompleteEloChange(
        userElo, sentenceElo, actualScore, streakPosition, 
        sessionTimestamp, currentTimestamp
      );
      
      // Should be positive but dampened
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(30); // Should be significantly dampened
      
      // Final ELO should not exceed 2000
      const finalElo = userElo + result;
      expect(finalElo).toBeLessThanOrEqual(2000);
    });

    it("should prevent going below minimum ELO", () => {
      const userElo = 820;
      const sentenceElo = 1800;
      const actualScore = SCORES.INCORRECT;
      const streakPosition = 0; // No streak
      const sessionTimestamp = new Date(2024, 0, 15);
      const currentTimestamp = new Date(2024, 0, 15); // Same day
      
      const result = calculateCompleteEloChange(
        userElo, sentenceElo, actualScore, streakPosition, 
        sessionTimestamp, currentTimestamp
      );
      
      // Should be negative but dampened
      expect(result).toBeLessThan(0);
      expect(result).toBeGreaterThan(-30); // Should be dampened
      
      // Final ELO should not go below 800
      const finalElo = userElo + result;
      expect(finalElo).toBeGreaterThanOrEqual(800);
    });
  });

  describe("Edge cases in full pipeline", () => {
    it("should handle zero ELO change scenarios", () => {
      const userElo = 800;
      const sentenceElo = 1200;
      const actualScore = SCORES.INCORRECT;
      const streakPosition = 0;
      const sessionTimestamp = new Date(2024, 0, 15);
      const currentTimestamp = new Date(2024, 0, 15);
      
      const result = calculateCompleteEloChange(
        userElo, sentenceElo, actualScore, streakPosition, 
        sessionTimestamp, currentTimestamp
      );
      
      // Should be zero (can't go below minimum)
      expect(result).toBe(0);
    });

    it("should handle extreme ELO differences", () => {
      const userElo = 800;
      const sentenceElo = 2000;
      const actualScore = SCORES.CORRECT;
      const streakPosition = 5; // Streak bonus
      const sessionTimestamp = new Date(2024, 0, 15);
      const currentTimestamp = new Date(2024, 0, 15);
      
      const result = calculateCompleteEloChange(
        userElo, sentenceElo, actualScore, streakPosition, 
        sessionTimestamp, currentTimestamp
      );
      
      // Should be very large positive change
      expect(result).toBeGreaterThan(30);
      expect(result).toBeLessThan(40); // But still bounded by K-factor
    });

    it("should handle very old sessions", () => {
      const userElo = 1200;
      const sentenceElo = 1300;
      const actualScore = SCORES.CORRECT;
      const streakPosition = 5;
      const sessionTimestamp = new Date(2024, 0, 1);
      const currentTimestamp = new Date(2024, 11, 31); // ~365 days later
      
      const result = calculateCompleteEloChange(
        userElo, sentenceElo, actualScore, streakPosition, 
        sessionTimestamp, currentTimestamp
      );
      
      // Should be very small due to recency penalty
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1); // Should be nearly zero
    });
  });

  describe("Mathematical consistency", () => {
    it("should maintain consistency across multiple calculations", () => {
      const scenarios = [
        { userElo: 1200, sentenceElo: 1200, score: SCORES.CORRECT, streak: 0 },
        { userElo: 1200, sentenceElo: 1300, score: SCORES.CORRECT, streak: 5 },
        { userElo: 1400, sentenceElo: 1200, score: SCORES.INCORRECT, streak: 2 },
        { userElo: 1000, sentenceElo: 1800, score: SCORES.CORRECT, streak: 10 },
      ];
      
      const sessionTime = new Date(2024, 0, 15);
      const currentTime = new Date(2024, 0, 15);
      
      scenarios.forEach(scenario => {
        const result = calculateCompleteEloChange(
          scenario.userElo, scenario.sentenceElo, scenario.score, 
          scenario.streak, sessionTime, currentTime
        );
        
        // Should always be a finite number
        expect(result).toBeTypeOf("number");
        expect(isFinite(result)).toBe(true);
        
        // Should respect the bounds
        const finalElo = scenario.userElo + result;
        expect(finalElo).toBeGreaterThanOrEqual(800);
        expect(finalElo).toBeLessThanOrEqual(2000);
      });
    });

    it("should show diminishing returns for repeated wins", () => {
      let currentElo = 1200;
      const sentenceElo = 1000;
      const streakPosition = 5;
      const sessionTime = new Date(2024, 0, 15);
      const currentTime = new Date(2024, 0, 15);
      
      const changes = [];
      
      // Simulate 10 consecutive wins
      for (let i = 0; i < 10; i++) {
        const change = calculateCompleteEloChange(
          currentElo, sentenceElo, SCORES.CORRECT, streakPosition, 
          sessionTime, currentTime
        );
        changes.push(change);
        currentElo += change;
      }
      
      // First change should be larger than later changes
      expect(changes[0]).toBeGreaterThan(changes[9]);
      
      // All changes should be positive
      changes.forEach(change => {
        expect(change).toBeGreaterThan(0);
      });
      
      // Final ELO should be higher but bounded
      expect(currentElo).toBeGreaterThan(1200);
      expect(currentElo).toBeLessThanOrEqual(2000);
    });
  });
});