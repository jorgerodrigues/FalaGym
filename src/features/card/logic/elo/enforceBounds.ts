/**
 * Enforces ELO bounds with progressive dampening to prevent extreme ratings
 * Hard caps at 800 minimum and 2000 maximum with progressive dampening near bounds
 *
 * @param currentElo - The current ELO rating
 * @param proposedChange - The proposed ELO change (can be positive or negative)
 * @returns The bounded ELO change that respects the limits
 */
export function enforceBounds(
  currentElo: number,
  proposedChange: number
): number {
  const MIN_ELO = 800;
  const MAX_ELO = 2000;
  const DAMPENING_ZONE = 50; // Start dampening 50 points before bounds

  const targetElo = currentElo + proposedChange;

  if (currentElo <= MIN_ELO && proposedChange < 0) {
    return 0; // Can't go lower than minimum
  }

  if (currentElo >= MAX_ELO && proposedChange > 0) {
    return 0; // Can't go higher than maximum
  }

  if (targetElo > MAX_ELO) {
    return MAX_ELO - currentElo;
  }

  if (targetElo < MIN_ELO) {
    return MIN_ELO - currentElo;
  }

  if (
    targetElo >= MIN_ELO + DAMPENING_ZONE &&
    targetElo <= MAX_ELO - DAMPENING_ZONE
  ) {
    return proposedChange;
  }

  let dampeningFactor = 1.0;

  if (proposedChange > 0) {
    if (currentElo > MAX_ELO - DAMPENING_ZONE) {
      const distanceFromBound = MAX_ELO - currentElo;
      dampeningFactor = Math.max(0.1, distanceFromBound / DAMPENING_ZONE);
    }
  } else if (proposedChange < 0) {
    if (currentElo < MIN_ELO + DAMPENING_ZONE) {
      const distanceFromBound = currentElo - MIN_ELO;
      dampeningFactor = Math.max(0.1, distanceFromBound / DAMPENING_ZONE);
    }
  }

  const dampenedChange = proposedChange * dampeningFactor;

  return dampenedChange;
}

/**
 * Alternative bounds enforcement with exponential dampening
 * Uses exponential decay for smoother dampening curves
 */
export function enforceExponentialBounds(
  currentElo: number,
  proposedChange: number
): number {
  const MIN_ELO = 800;
  const MAX_ELO = 2000;
  const DAMPENING_ZONE = 100; // Larger dampening zone for exponential

  if (currentElo <= MIN_ELO && proposedChange < 0) {
    return 0;
  }

  if (currentElo >= MAX_ELO && proposedChange > 0) {
    return 0;
  }

  const targetElo = currentElo + proposedChange;

  if (targetElo > MAX_ELO) {
    return MAX_ELO - currentElo;
  }

  if (targetElo < MIN_ELO) {
    return MIN_ELO - currentElo;
  }

  if (
    targetElo >= MIN_ELO + DAMPENING_ZONE &&
    targetElo <= MAX_ELO - DAMPENING_ZONE
  ) {
    return proposedChange;
  }

  let dampeningFactor = 1.0;

  if (proposedChange > 0 && currentElo > MAX_ELO - DAMPENING_ZONE) {
    // Exponential dampening for upper bound
    const distanceFromBound = MAX_ELO - currentElo;
    const normalizedDistance = distanceFromBound / DAMPENING_ZONE; // 0 to 1
    dampeningFactor = Math.pow(normalizedDistance, 2); // Quadratic dampening
    dampeningFactor = Math.max(0.05, dampeningFactor); // Minimum 5% change
  } else if (proposedChange < 0 && currentElo < MIN_ELO + DAMPENING_ZONE) {
    // Exponential dampening for lower bound
    const distanceFromBound = currentElo - MIN_ELO;
    const normalizedDistance = distanceFromBound / DAMPENING_ZONE; // 0 to 1
    dampeningFactor = Math.pow(normalizedDistance, 2); // Quadratic dampening
    dampeningFactor = Math.max(0.05, dampeningFactor); // Minimum 5% change
  }

  // Apply dampening
  const dampenedChange = proposedChange * dampeningFactor;

  return dampenedChange;
}
