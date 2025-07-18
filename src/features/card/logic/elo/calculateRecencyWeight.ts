import { RECENCY_SYSTEM } from "../../../../constants/elo";

/**
 * Calculates the recency weight for ELO changes based on how recent the session was
 */
export function calculateRecencyWeight(
  sessionTimestamp: Date | number,
  currentTimestamp: Date | number
): number {
  const sessionDate = typeof sessionTimestamp === "number"
    ? new Date(sessionTimestamp)
    : sessionTimestamp;
  const currentDate = typeof currentTimestamp === "number"
    ? new Date(currentTimestamp)
    : currentTimestamp;

  if (isNaN(sessionDate.getTime()) || isNaN(currentDate.getTime())) {
    throw new Error("Invalid timestamp provided");
  }

  const timeDifferenceMs = currentDate.getTime() - sessionDate.getTime();
  const daysDifference = timeDifferenceMs / RECENCY_SYSTEM.MILLISECONDS_PER_DAY;

  if (daysDifference < 0) {
    return 1.0;
  }

  if (daysDifference < RECENCY_SYSTEM.SAME_DAY_THRESHOLD) {
    return 1.0;
  }

  const recencyWeight = Math.pow(RECENCY_SYSTEM.DECAY_RATE, Math.floor(daysDifference));

  return recencyWeight;
}

/**
 * Alternative implementation with more granular time consideration
 */
export function calculateGranularRecencyWeight(
  sessionTimestamp: Date | number,
  currentTimestamp: Date | number
): number {
  const sessionDate = typeof sessionTimestamp === "number"
    ? new Date(sessionTimestamp)
    : sessionTimestamp;
  const currentDate = typeof currentTimestamp === "number"
    ? new Date(currentTimestamp)
    : currentTimestamp;

  if (isNaN(sessionDate.getTime()) || isNaN(currentDate.getTime())) {
    throw new Error("Invalid timestamp provided");
  }

  const timeDifferenceMs = currentDate.getTime() - sessionDate.getTime();
  const daysDifference = timeDifferenceMs / RECENCY_SYSTEM.MILLISECONDS_PER_DAY;

  if (daysDifference < 0) {
    return 1.0;
  }

  if (daysDifference < RECENCY_SYSTEM.GRANULAR_THRESHOLD) {
    return 1.0;
  }

  const recencyWeight = Math.pow(RECENCY_SYSTEM.DECAY_RATE, daysDifference);

  return recencyWeight;
}
