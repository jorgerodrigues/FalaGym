import prisma from "@/database/client";
import { generateSentencesPrompt } from "@/prompts/generate-sentences-prompt";
import { SentenceDataArraySchema } from "@/types/schemas/sentence";
import { loadPromptFromConstant } from "@/utils/prompt-loader";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { generateAudioForSentence } from "../sentence/generateAudioForSentence";

const possibleStructures = [
  "Questions",
  "Commands/imperatives",
  "Complex sentences with subordinate clauses",
  "Simple statements",
  "Conditional sentences (if/then)",
  "Sentences with time expressions",
  "Exclamations",
  "Comparative sentences",
  "Sentences with reported speech",
  "Sentences with modal verbs",
];

const levels = [
  "Level 1: Simple vocabulary, present tense only",
  "Level 2: Expanded vocabulary, present and past tenses",
  "Level 3: Intermediate vocabulary, multiple tenses",
  "Level 4: Advanced vocabulary, complex grammatical structures",
];

const possibleContexts = [
  "At a restaurant",
  "In a classroom",
  "During a job interview",
  "While traveling",
  "At a family gathering",
  "At a store",
  "In a business meeting",
  "At a doctor's office",
  "On public transportation",
  "During a phone conversation",
];

const possibleTopics = [
  "Food and drink",
  "Travel and transportation",
  "Family and relationships",
  "Work and career",
  "Health and wellness",
  "Education and learning",
  "Technology and gadgets",
  "Entertainment and leisure",
  "Nature and environment",
  "Fashion and style",
  "food and cooking",
  "shopping and errands",
  "family relationships",
  "work and career",
  "school and education",
  "hobbies and leisure",
  "travel and transportation",
  "weather and seasons",
  "health and wellness",
  "home and household",
  "technology and devices",
  "social interactions",
  "time and schedules",
  "celebrations and holidays",
  "pets and animals",
  "clothing and fashion",
  "emotions and feelings",
  "money and finances",
  "directions and locations",
  "sports and exercise",
  "entertainment and media",
  "restaurants and dining out",
  "arts and culture",
  "daily routines",
  "nature and environment",
  "community and neighborhood",
  "emergency situations",
  "personal preferences",
  "future plans",
  "past experiences",
];

export const generateCardsForUser = async (
  userId: string,
  language: string,
  nativeLanguage: string = "en",
  amount?: number
) => {
  const structure_1 =
    possibleStructures[Math.floor(Math.random() * possibleStructures.length)];
  const structure_2 =
    possibleStructures[Math.floor(Math.random() * possibleStructures.length)];

  const level = levels[Math.floor(Math.random() * levels.length)];

  const context =
    possibleContexts[Math.floor(Math.random() * possibleContexts.length)];

  const topic_1 =
    possibleTopics[Math.floor(Math.random() * possibleTopics.length)];

  const topic_2 =
    possibleTopics[Math.floor(Math.random() * possibleTopics.length)];

  const amount_number = amount?.toString() || "10";

  const promptStr = generateSentencesPrompt;

  const prompt = await loadPromptFromConstant(promptStr, {
    language,
    nativeLanguage,
    structure_1,
    structure_2,
    level,
    context,
    topic_1,
    topic_2,
    amount_number,
  });

  const { object } = await generateObject({
    model: anthropic("claude-3-5-sonnet-latest"),
    schema: SentenceDataArraySchema,
    temperature: 0.76,
    prompt,
  });

  for (const sentence of object.sentences) {
    const s = await prisma.sentence.create({
      data: {
        content: sentence.sentence,
        translation: sentence.translation,
        userId: userId,
        language: language,
        nativeLanguage: nativeLanguage,
        words: {
          createMany: {
            data: sentence.definitions.map((d) => ({
              word: d.word,
              definition: d.definition,
              language,
            })),
          },
        },
        Card: {
          create: {
            userId,
            front: sentence.sentence,
            back: sentence.translation,
            language: language,
            nativeLanguage: nativeLanguage,
          },
        },
      },
    });

    if (s.language && s.content) {
      await generateAudioForSentence({
        id: s.id,
        sentence: s.content,
        language: s.language,
      });
    }
  }
  return object;
};
