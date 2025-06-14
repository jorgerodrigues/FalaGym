import { z } from "zod";

export const LanguageSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type Language = z.infer<typeof LanguageSchema>;

export const BasicUserInfo = z.object({
  id: z.string(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  email: z.string().email(),
  nativeLanguage: z.string().default("en"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  onboardingCompleted: z.boolean().default(false),
});

export type BasicUserInfo = z.infer<typeof BasicUserInfo>;
