import { generateCardsForUser } from "@/lib/cards/generateCardsForUser";
import prisma from "@/database/client";

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, language } = body as { userId: string; language: string };

  if (!userId || !language) {
    return new Response("missing-required-args", { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { nativeLanguage: true },
    });
    const nativeLanguage = user?.nativeLanguage || "en";

    const object = await generateCardsForUser(userId, language, nativeLanguage);

    return new Response(JSON.stringify(object), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
