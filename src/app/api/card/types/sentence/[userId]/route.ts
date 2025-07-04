import { CARD_TYPES } from "@/constants/cards";
import prisma from "@/database/client";
import { generateCardsForUser } from "@/lib/cards/generateCardsForUser";
import { parseStringToNumber } from "@/utils/string/parseStringToNumber";
import { getLanguagePreference } from "@/features/user-settings/services/getLanguagePreference";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const skipQuery = searchParams.get("skip");
    const skip = skipQuery ? parseStringToNumber(skipQuery) : 0;

    const paramsData = await params;
    const userId = paramsData.userId;

    if (!userId) {
      return new Response("User ID is required", { status: 400 });
    }

    const userLanguage = await getLanguagePreference(userId);

    if (!userLanguage || !userLanguage.languageCode) {
      return new Response("no-language-set", { status: 400 });
    }

    const cards = await getLatestSentenceCards({
      userId,
      language: userLanguage.languageCode,
      skip,
    });

    return new Response(JSON.stringify(cards), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log({ error });
      return new Response(
        `Failed to fetch latest sentence cards: ${error.message}`,
        { status: 500 }
      );
    }
    return new Response(`Failed to fetch latest sentence cards: ${error}`, {
      status: 500,
    });
  }
}

const getLatestSentenceCards = async ({
  userId,
  language: providedLanguage,
  skip,
}: {
  userId: string;
  language: string;
  skip?: number | null;
}) => {
  try {
    const cards = await prisma.card.findMany({
      where: {
        userId,
        type: CARD_TYPES.SENTENCE,
        language: providedLanguage,
      },
      include: {
        sentence: {
          include: {
            words: true,
          },
        },
      },
      orderBy: {
        nextDueDate: "asc",
      },
      take: 10,
      skip: skip ?? 0,
    });

    // Get user's language preference or default to Danish
    const userLanguagePref = await getLanguagePreference(userId);
    const language = userLanguagePref?.languageCode || "da";

    // Get user's native language
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { nativeLanguage: true },
    });
    const nativeLanguage = user?.nativeLanguage || "en";

    if (!cards || cards.length === 0) {
      await generateCardsForUser(userId, language, nativeLanguage, 3);

      const card = await prisma.card.findMany({
        where: {
          userId,
          type: CARD_TYPES.SENTENCE,
          language: providedLanguage,
        },
        include: {
          sentence: {
            include: {
              words: true,
            },
          },
        },
        orderBy: {
          nextDueDate: "asc",
        },
        take: 1,
      });
      // trigger a background task to generate more cards
      generateCardsForUser(userId, language, nativeLanguage);

      // Return the single card found early
      return [card];
    }

    const cardsLeftForReview = await prisma.card.count({
      where: {
        userId,
        type: CARD_TYPES.SENTENCE,
        nextDueDate: {
          lte: new Date(),
        },
      },
    });

    // This breaks the idempotency of the operation
    // However it is a calculated measure to avoid having other solutions
    // that would have been overly complicated for this point in time.
    if (cardsLeftForReview <= 10) {
      // Fire-and-forget: generateCardsForUser is intentionally not awaited
      // because it performs a background task that does not affect the response.
      generateCardsForUser(userId, language, nativeLanguage);
    }

    return cards;
  } catch (e) {
    if (e instanceof Error) {
      throw new Error("Failed to fetch latest sentence cards" + e.message);
    }
  }
};
