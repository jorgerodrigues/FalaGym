import prisma from "@/database/client";
import { generateCardsForUser } from "./generateCardsForUser";

export const generateFirstCardsForUser = async (
  userId: string,
  languageToPractice: string,
  nativeLanguage: string = "en",
  amount?: number
) => {
  try {
    const existingSentencesOnLanguage = await prisma.sentence.findMany({
      where: {
        language: languageToPractice,
        nativeLanguage: nativeLanguage,
      },
      take: amount || 5,
    });
    if (
      !existingSentencesOnLanguage ||
      existingSentencesOnLanguage.length === 0
    ) {
      await generateCardsForUser(userId, languageToPractice, nativeLanguage, 5);
      return;
    }

    for (const sentence of existingSentencesOnLanguage) {
      await prisma.card.create({
        data: {
          sentenceId: sentence.id,
          userId: userId,
          front: sentence.content,
          back: sentence.translation,
          language: languageToPractice,
          nativeLanguage,
        },
      });
    }
  } catch (e) {
    if (e instanceof Error) {
      throw Error(`Failed to generate first cards: ${e.message}`);
    }
  }
};
