/**
 * Calculates the ELO rating change for a user based on their performance against a sentence
 * Uses the standard ELO rating system formula with K-factor of 32
 *
 * @param userElo - Current ELO rating of the user
 * @param sentenceElo - ELO rating of the sentence being practiced
 * @param actualScore - Actual performance score (0 for incorrect, 1 for correct)
 * @returns The ELO change as a float (can be positive or negative)
 */
export function calculateEloChange(
  userElo: number,
  sentenceElo: number,
  actualScore: number
): number {
  if (actualScore !== 0 && actualScore !== 1) {
    throw new Error("actualScore must be 0 or 1");
  }

  const K_FACTOR = 32;

  const expectedScore = 1 / (1 + Math.pow(10, (sentenceElo - userElo) / 400));

  const eloChange = K_FACTOR * (actualScore - expectedScore);

  return eloChange;
}
