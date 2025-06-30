import prisma from "@/database/client";
import { generateAudioForSentence } from "@/lib/sentence/generateAudioForSentence";

export const POST = async () => {
  try {
    const allSentencesWithoutAudio = await prisma.sentence.findMany({
      where: {
        audioUrl: null,
      },
      take: 20,
    });

    for (const sentence of allSentencesWithoutAudio) {
      if (!sentence.language) {
        continue;
      }

      await generateAudioForSentence({
        id: sentence.id,
        sentence: sentence.content,
        language: sentence.language,
      });
    }

    return new Response(
      JSON.stringify({
        message: "Test audios created successfully for sentences.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("Error in audio sentence upload:", e);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
