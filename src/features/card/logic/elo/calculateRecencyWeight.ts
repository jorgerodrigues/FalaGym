/**
 * Calculates the recency weight for ELO changes based on how recent the session was
 * More recent sessions have higher weight (closer to 1.0)
 * Older sessions have lower weight (approaching 0.0)
 *
 * @param sessionTimestamp - The timestamp of the session (Date object or timestamp)
 * @param currentTimestamp - The current timestamp (Date object or timestamp)
 * @returns The recency weight (0.0 to 1.0)
 */
export function calculateRecencyWeight(
  sessionTimestamp: Date | number,
  currentTimestamp: Date | number
): number {
  const sessionDate =
    typeof sessionTimestamp === "number"
      ? new Date(sessionTimestamp)
      : sessionTimestamp;
  const currentDate =
    typeof currentTimestamp === "number"
      ? new Date(currentTimestamp)
      : currentTimestamp;

  if (isNaN(sessionDate.getTime()) || isNaN(currentDate.getTime())) {
    throw new Error("Invalid timestamp provided");
  }

  const timeDifferenceMs = currentDate.getTime() - sessionDate.getTime();

  const daysDifference = timeDifferenceMs / (24 * 60 * 60 * 1000);

  if (daysDifference < 0) {
    return 1.0;
  }

  if (daysDifference < 1) {
    return 1.0;
  }

  const recencyWeight = Math.pow(0.95, Math.floor(daysDifference));

  return recencyWeight;
}

/**
 * Alternative implementation with more granular time consideration
 * This version considers fractional days instead of rounding down
 */
export function calculateGranularRecencyWeight(
  sessionTimestamp: Date | number,
  currentTimestamp: Date | number
): number {
  // Convert inputs to Date objects
  const sessionDate =
    typeof sessionTimestamp === "number"
      ? new Date(sessionTimestamp)
      : sessionTimestamp;
  const currentDate =
    typeof currentTimestamp === "number"
      ? new Date(currentTimestamp)
      : currentTimestamp;

  if (isNaN(sessionDate.getTime()) || isNaN(currentDate.getTime())) {
    throw new Error("Invalid timestamp provided");
  }

  const timeDifferenceMs = currentDate.getTime() - sessionDate.getTime();

  const daysDifference = timeDifferenceMs / (24 * 60 * 60 * 1000);

  if (daysDifference < 0) {
    return 1.0;
  }

  if (daysDifference < 0.01) {
    return 1.0;
  }

  const recencyWeight = Math.pow(0.95, daysDifference);

  return recencyWeight;
}
