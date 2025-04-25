import prisma from "@/database/client";

type ReviewBody = {
  rating: number;
};

type Params = Promise<{ cardId: string }>;

export const POST = async (req: Request, params: { params: Params }) => {
  try {
    const resolvedParams = params;
    const { cardId } = await resolvedParams.params;

    const body: ReviewBody = await req.json();

    if (!body || !body.rating || isNaN(Number(body.rating))) {
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

    // create a review log
    await prisma.cardReviewLog.create({
      data: {
        cardId,
        userId: cardExists.userId,
        rating: Number(body.rating),
      },
    });

    // re-calculate next review date
    // For now we are hardcoding two days from now
    const nextReviewDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    await prisma.card.update({
      where: {
        id: cardId,
      },
      data: {
        nextDueDate: nextReviewDate,
      },
    });

    return new Response(JSON.stringify({ data: "success", error: null }), {
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
