/**
 * Calculates the streak multiplier for ELO changes based on consecutive correct answers
 * Provides bonus multipliers for maintaining answer streaks
 *
 * @param streakPosition - The current position in the streak (0-based)
 * @returns The multiplier to apply to ELO changes (1.0 for no streak, 1.2+ for streak)
 */
export function calculateStreakMultiplier(streakPosition: number): number {
  if (streakPosition < 0) {
    throw new Error("streakPosition must be non-negative");
  }

  const position = Math.floor(streakPosition);

  // Streak bonus starts at position 3
  if (position < 3) {
    return 1.0;
  }

  const BASE_STREAK_MULTIPLIER = 1.2;

  return BASE_STREAK_MULTIPLIER;
}

/**
 * Alternative implementation with progressive scaling for future consideration
 * Currently not used but demonstrates how streak multipliers could scale
 */
export function calculateProgressiveStreakMultiplier(
  streakPosition: number
): number {
  if (streakPosition < 0) {
    throw new Error("streakPosition must be non-negative");
  }

  const position = Math.floor(streakPosition);

  // No streak bonus for positions 0, 1, 2
  if (position < 3) {
    return 1.0;
  }

  // Progressive scaling: 1.2 at position 3, increasing by 0.05 per position
  // Cap at 1.5 to prevent excessive bonuses
  const baseMultiplier = 1.2;
  const progressiveBonus = Math.min(0.05 * (position - 3), 0.3);

  return baseMultiplier + progressiveBonus;
}
