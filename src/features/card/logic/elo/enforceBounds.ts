import { ELO_SYSTEM, BOUNDS_SYSTEM } from "../../../../constants/elo";

/**
 * Enforces ELO bounds with progressive dampening to prevent extreme ratings
 */
export function enforceBounds(currentElo: number, proposedChange: number): number {
  const targetElo = currentElo + proposedChange;

  if (currentElo <= ELO_SYSTEM.MIN_ELO && proposedChange < 0) {
    return 0;
  }

  if (currentElo >= ELO_SYSTEM.MAX_ELO && proposedChange > 0) {
    return 0;
  }

  if (targetElo > ELO_SYSTEM.MAX_ELO) {
    return ELO_SYSTEM.MAX_ELO - currentElo;
  }

  if (targetElo < ELO_SYSTEM.MIN_ELO) {
    return ELO_SYSTEM.MIN_ELO - currentElo;
  }

  if (
    targetElo >= ELO_SYSTEM.MIN_ELO + BOUNDS_SYSTEM.DAMPENING_ZONE &&
    targetElo <= ELO_SYSTEM.MAX_ELO - BOUNDS_SYSTEM.DAMPENING_ZONE
  ) {
    return proposedChange;
  }

  let dampeningFactor = 1.0;

  if (proposedChange > 0) {
    if (currentElo > ELO_SYSTEM.MAX_ELO - BOUNDS_SYSTEM.DAMPENING_ZONE) {
      const distanceFromBound = ELO_SYSTEM.MAX_ELO - currentElo;
      dampeningFactor = Math.max(BOUNDS_SYSTEM.MIN_DAMPENING_FACTOR, distanceFromBound / BOUNDS_SYSTEM.DAMPENING_ZONE);
    }
  } else if (proposedChange < 0) {
    if (currentElo < ELO_SYSTEM.MIN_ELO + BOUNDS_SYSTEM.DAMPENING_ZONE) {
      const distanceFromBound = currentElo - ELO_SYSTEM.MIN_ELO;
      dampeningFactor = Math.max(BOUNDS_SYSTEM.MIN_DAMPENING_FACTOR, distanceFromBound / BOUNDS_SYSTEM.DAMPENING_ZONE);
    }
  }

  const dampenedChange = proposedChange * dampeningFactor;

  return dampenedChange;
}

/**
 * Alternative bounds enforcement with exponential dampening
 */
export function enforceExponentialBounds(
  currentElo: number,
  proposedChange: number
): number {
  if (currentElo <= ELO_SYSTEM.MIN_ELO && proposedChange < 0) {
    return 0;
  }

  if (currentElo >= ELO_SYSTEM.MAX_ELO && proposedChange > 0) {
    return 0;
  }

  const targetElo = currentElo + proposedChange;

  if (targetElo > ELO_SYSTEM.MAX_ELO) {
    return ELO_SYSTEM.MAX_ELO - currentElo;
  }

  if (targetElo < ELO_SYSTEM.MIN_ELO) {
    return ELO_SYSTEM.MIN_ELO - currentElo;
  }

  if (
    targetElo >= ELO_SYSTEM.MIN_ELO + BOUNDS_SYSTEM.EXPONENTIAL_DAMPENING_ZONE &&
    targetElo <= ELO_SYSTEM.MAX_ELO - BOUNDS_SYSTEM.EXPONENTIAL_DAMPENING_ZONE
  ) {
    return proposedChange;
  }

  let dampeningFactor = 1.0;

  if (proposedChange > 0 && currentElo > ELO_SYSTEM.MAX_ELO - BOUNDS_SYSTEM.EXPONENTIAL_DAMPENING_ZONE) {
    const distanceFromBound = ELO_SYSTEM.MAX_ELO - currentElo;
    const normalizedDistance = distanceFromBound / BOUNDS_SYSTEM.EXPONENTIAL_DAMPENING_ZONE;
    dampeningFactor = Math.pow(normalizedDistance, BOUNDS_SYSTEM.QUADRATIC_EXPONENT);
    dampeningFactor = Math.max(BOUNDS_SYSTEM.EXPONENTIAL_MIN_DAMPENING_FACTOR, dampeningFactor);
  } else if (proposedChange < 0 && currentElo < ELO_SYSTEM.MIN_ELO + BOUNDS_SYSTEM.EXPONENTIAL_DAMPENING_ZONE) {
    const distanceFromBound = currentElo - ELO_SYSTEM.MIN_ELO;
    const normalizedDistance = distanceFromBound / BOUNDS_SYSTEM.EXPONENTIAL_DAMPENING_ZONE;
    dampeningFactor = Math.pow(normalizedDistance, BOUNDS_SYSTEM.QUADRATIC_EXPONENT);
    dampeningFactor = Math.max(BOUNDS_SYSTEM.EXPONENTIAL_MIN_DAMPENING_FACTOR, dampeningFactor);
  }

  const dampenedChange = proposedChange * dampeningFactor;

  return dampenedChange;
}
