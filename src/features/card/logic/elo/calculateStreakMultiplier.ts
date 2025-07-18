import { STREAK_SYSTEM } from "../../../../constants/elo";

/**
 * Calculates the streak multiplier for ELO changes based on consecutive correct answers
 */
export function calculateStreakMultiplier(streakPosition: number): number {
  if (streakPosition < 0) {
    throw new Error("streakPosition must be non-negative");
  }

  const position = Math.floor(streakPosition);

  if (position < STREAK_SYSTEM.STREAK_START_POSITION) {
    return STREAK_SYSTEM.BASE_MULTIPLIER;
  }

  return STREAK_SYSTEM.STREAK_MULTIPLIER;
}

/**
 * Alternative implementation with progressive scaling for future consideration
 */
export function calculateProgressiveStreakMultiplier(streakPosition: number): number {
  if (streakPosition < 0) {
    throw new Error("streakPosition must be non-negative");
  }

  const position = Math.floor(streakPosition);

  if (position < STREAK_SYSTEM.STREAK_START_POSITION) {
    return STREAK_SYSTEM.BASE_MULTIPLIER;
  }

  const progressiveBonus = Math.min(
    STREAK_SYSTEM.PROGRESSIVE_BONUS_INCREMENT * (position - STREAK_SYSTEM.STREAK_START_POSITION),
    STREAK_SYSTEM.PROGRESSIVE_MAX_BONUS
  );

  return STREAK_SYSTEM.STREAK_MULTIPLIER + progressiveBonus;
}
