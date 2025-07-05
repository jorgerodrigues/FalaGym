import { experimental_generateSpeech as generateSpeech } from "ai";
import { languageNameFromCode } from "@/utils/language/languageNameFromCode";
import { openai } from "@ai-sdk/openai";
import { uploadFileToBucket } from "@/utils/storage/uploadFileToBucket";
import { STORAGE_BUCKETS } from "@/constants/storageBuckets";
import prisma from "@/database/client";

export const generateAudioForSentence = async ({
  sentence,
  id,
  language,
}: {
  id: string;
  sentence: string;
  language: string;
}) => {
  try {
    if (process.env.GENERATE_AUDIO_SENTENCES_ON_DEV === "false") {
      return "";
    }

    const fileName = `sentence-${id}.wav`;
    const languageName = languageNameFromCode(language);

    const audio = await generateSpeech({
      model: openai.speech("gpt-4o-mini-tts"),
      text: sentence,
      voice: "alloy",
      instructions: `This word is in ${languageName}. Please pronounce it as a native speaker would.`,
    });
    const audioData = Buffer.from(audio.audio.base64, "base64");

    // Upload to the audio-sentences bucket
    const uploadResult = await uploadFileToBucket({
      source: audioData,
      bucketName: STORAGE_BUCKETS.AUDIO_SENTENCES,
      fileName: fileName,
      contentType: "audio/wav",
    });

    if (!uploadResult.success) {
      throw new Error(
        `Failed to upload audio for sentence ID ${id}: ${uploadResult.message}`
      );
      return;
    }

    await prisma.sentence.update({
      where: { id },
      data: {
        audioUrl: fileName,
      },
    });
  } catch (e) {
    throw e;
  }
};
