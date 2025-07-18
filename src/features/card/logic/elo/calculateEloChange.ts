import { SCORES, ELO_SYSTEM } from "../../../../constants/elo";

/**
 * Calculates the ELO rating change for a user based on their performance against a sentence
 */
export function calculateEloChange(
  userElo: number,
  sentenceElo: number,
  actualScore: number
): number {
  if (actualScore !== SCORES.INCORRECT && actualScore !== SCORES.CORRECT) {
    throw new Error(`actualScore must be ${SCORES.INCORRECT} or ${SCORES.CORRECT}`);
  }

  const normalizedScore = actualScore === SCORES.CORRECT ? 1 : 0;
  const expectedScore = 1 / (1 + Math.pow(10, (sentenceElo - userElo) / ELO_SYSTEM.EXPECTED_SCORE_DIVISOR));
  const eloChange = ELO_SYSTEM.K_FACTOR * (normalizedScore - expectedScore);

  return eloChange;
}
