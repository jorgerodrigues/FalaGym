import prisma from "@/database/client";
import { calculateEloChange } from "@/features/card/logic/elo/calculateEloChange";
import { calculateStreakMultiplier } from "@/features/card/logic/elo/calculateStreakMultiplier";
import { calculateRecencyWeight } from "@/features/card/logic/elo/calculateRecencyWeight";
import { enforceBounds } from "@/features/card/logic/elo/enforceBounds";
import { ELO_SYSTEM, SESSION_SYSTEM } from "@/constants/elo";

export type AddReviewToSessionArgs = {
  sessionId: string;
  cardId: string;
  userId: string;
  rating: number;
  sentenceElo?: number;
};

export type AddReviewToSessionResponse = {
  data: {
    reviewId: string;
    streakPosition: number;
    eloImpact: number;
    sessionEndingElo: number;
  } | null;
  error: string | null;
};

export const addReviewToSession = async ({
  sessionId,
  cardId,
  userId,
  rating,
  sentenceElo = ELO_SYSTEM.DEFAULT_ELO,
}: AddReviewToSessionArgs): Promise<AddReviewToSessionResponse> => {
  try {
    // Get session with essential data needed and count of reviews
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        startingUserElo: true,
        endingUserElo: true,
        startTimestamp: true,
        _count: {
          select: {
            CardReviewLog: true,
          },
        },
        // Only get the last few reviews to calculate current streak
        CardReviewLog: {
          select: {
            rating: true,
          },
          orderBy: {
            reviewDate: "desc",
          },
          take: 10, // Only get last 10 reviews for streak calculation
        },
      },
    });

    if (!session) {
      return {
        data: null,
        error: "session-not-found",
      };
    }

    // Calculate current streak position efficiently
    let currentStreak = 0;
    for (const review of session.CardReviewLog) {
      if (review.rating === 5) {
        currentStreak++;
      } else {
        break;
      }
    }

    // New streak position (adding 1 if current review is correct)
    const newStreakPosition = rating === 5 ? currentStreak + 1 : 0;

    // Calculate ELO impact for this review
    const currentSessionElo = session.endingUserElo || session.startingUserElo;

    const baseEloChange = calculateEloChange(
      currentSessionElo,
      sentenceElo,
      rating // Pass the actual rating (0 or 5), not normalized
    );

    const streakMultiplier = calculateStreakMultiplier(newStreakPosition);

    const recencyWeight = calculateRecencyWeight(
      session.startTimestamp,
      new Date()
    );

    const reviewEloImpact = baseEloChange * streakMultiplier * recencyWeight;

    // Calculate new session ending ELO
    const boundedEloChange = enforceBounds(currentSessionElo, reviewEloImpact);
    const newSessionEndingElo = currentSessionElo + boundedEloChange;

    // Add review and update session ending ELO in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the review log
      const reviewLog = await tx.cardReviewLog.create({
        data: {
          cardId,
          userId,
          rating,
          sessionId,
          streakPosition: newStreakPosition,
          eloImpact: reviewEloImpact,
        },
      });

      // Update session's ending ELO
      await tx.session.update({
        where: { id: sessionId },
        data: {
          endingUserElo: newSessionEndingElo,
        },
      });

      return {
        reviewId: reviewLog.id,
        streakPosition: newStreakPosition,
        eloImpact: reviewEloImpact,
        sessionEndingElo: newSessionEndingElo,
      };
    });

    return {
      data: result,
      error: null,
    };
  } catch (error) {
    console.error("Error adding review to session:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "internal-server-error",
    };
  }
};

export const getCurrentSessionSummary = async (userId: string) => {
  try {
    const activeSession = await prisma.session.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        startingUserElo: true,
        endingUserElo: true,
        _count: {
          select: {
            CardReviewLog: true,
          },
        },
      },
    });

    return {
      data: activeSession,
      error: null,
    };
  } catch (error) {
    console.error("Error getting current session summary:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "internal-server-error",
    };
  }
};

export const startNewSession = async (userId: string) => {
  try {
    // Check if user exists and get their current ELO
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        currentEloScore: true,
      },
    });

    if (!user) {
      return {
        data: null,
        error: "user-not-found",
      };
    }

    // Check for active session efficiently
    const existingSession = await prisma.session.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    if (existingSession) {
      return {
        data: null,
        error: "active-session-exists",
      };
    }

    // Create new session
    const session = await prisma.session.create({
      data: {
        userId,
        startingUserElo: user.currentEloScore,
        endingUserElo: user.currentEloScore, // Initialize ending ELO
        status: "ACTIVE",
      },
      select: {
        id: true,
        startingUserElo: true,
        endingUserElo: true,
      },
    });

    return {
      data: session,
      error: null,
    };
  } catch (error) {
    console.error("Error starting new session:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "internal-server-error",
    };
  }
};

export const finalizeSessionWithElo = async (
  sessionId: string,
  userId: string
) => {
  try {
    // Get session with essential data - ELO should already be calculated
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
        status: "ACTIVE",
      },
      select: {
        id: true,
        endingUserElo: true,
        _count: {
          select: {
            CardReviewLog: true,
          },
        },
      },
    });

    if (!session) {
      return {
        data: null,
        error: "session-not-found",
      };
    }

    // Check minimum reviews
    if (session._count.CardReviewLog < SESSION_SYSTEM.MINIMUM_REVIEWS) {
      return {
        data: null,
        error: "insufficient-reviews",
      };
    }

    const finalElo = session.endingUserElo!;

    // Complete session and update user ELO
    const result = await prisma.$transaction(async (tx) => {
      await tx.session.update({
        where: { id: sessionId },
        data: {
          endTimestamp: new Date(),
          status: "COMPLETED",
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          currentEloScore: finalElo,
          lastSessionTimestamp: new Date(),
        },
      });

      return { finalElo };
    });

    return {
      data: result,
      error: null,
    };
  } catch (error) {
    console.error("Error finalizing session:", error);
    return {
      data: null,
      error: error instanceof Error ? error.message : "internal-server-error",
    };
  }
};
