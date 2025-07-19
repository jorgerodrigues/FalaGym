import prisma from "@/database/client";
import { card } from "@/features/card";
import { 
  getCurrentSessionSummary,
  startNewSession,
  addReviewToSession
} from "@/features/card/services/sessionReviewService";

type ReviewBody = {
  rating: number;
};

type Params = Promise<{ cardId: string }>;

export const POST = async (req: Request, params: { params: Params }) => {
  try {
    const resolvedParams = params;
    const { cardId } = await resolvedParams.params;

    const body: ReviewBody = await req.json();

    if (
      !body ||
      body.rating === null ||
      body.rating === undefined ||
      isNaN(Number(body.rating))
    ) {
      return new Response(
        JSON.stringify({ data: null, error: "invalid-args" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const cardExists = await prisma.card.findUnique({
      where: {
        id: cardId,
      },
    });

    if (!cardExists) {
      return new Response(JSON.stringify({ data: null, error: "not-found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Get sentence ELO separately if needed
    let sentenceElo: number | undefined;
    if (cardExists.sentenceId) {
      const sentence = await prisma.sentence.findUnique({
        where: { id: cardExists.sentenceId },
        select: { difficultyElo: true }
      });
      sentenceElo = sentence?.difficultyElo;
    }

    // Get or create active session
    const activeSessionResult = await getCurrentSessionSummary(cardExists.userId);
    
    if (activeSessionResult.error) {
      return new Response(
        JSON.stringify({ data: null, error: activeSessionResult.error }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get session ID - create if none exists
    let sessionId: string;
    if (!activeSessionResult.data) {
      const createResult = await startNewSession(cardExists.userId);
      if (createResult.error) {
        return new Response(
          JSON.stringify({ data: null, error: createResult.error }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
      sessionId = createResult.data!.id;
    } else {
      sessionId = activeSessionResult.data.id;
    }

    // Add review to session with ELO calculation
    const reviewResult = await addReviewToSession({
      sessionId,
      cardId,
      userId: cardExists.userId,
      rating: Number(body.rating),
      sentenceElo
    });

    if (reviewResult.error) {
      return new Response(
        JSON.stringify({ data: null, error: reviewResult.error }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Re-calculate next review date (existing spaced repetition logic)
    const updatedCard = card.processCardReview(cardExists, Number(body.rating));

    await prisma.card.update({
      where: {
        id: cardId,
      },
      data: {
        nextDueDate: updatedCard.newDueDate,
        easeFactor: updatedCard.easeFactor,
        interval: updatedCard.interval,
        repetitions: updatedCard.repetitions,
      },
    });

    return new Response(JSON.stringify({ 
      data: { 
        success: true, 
        sessionId,
        streakPosition: reviewResult.data!.streakPosition,
        eloImpact: reviewResult.data!.eloImpact,
        sessionEndingElo: reviewResult.data!.sessionEndingElo
      }, 
      error: null 
    }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({ data: null, error: error.message }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
    return new Response(
      JSON.stringify({ data: null, error: "unknown-error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
