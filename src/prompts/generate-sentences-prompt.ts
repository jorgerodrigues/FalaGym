export const generateSentencesPrompt = `
  You are a teacher helping students improve their writing skills in {{language}}.

  <task>
  Generate an array with {{amount_number}} unique, creative sentences in {{language}} that would be useful for language learners whose native language is {{nativeLanguage}}.
  </task>

  <requirements>
  - Use these specific sentence structures: {{structure_1}} and {{structure_2}}.
  - Difficulty level: {{level}} (1-4).
  - Context: {{context}}.
  - Topic focus: {{topic_1}} and {{topic_2}}!
  </requirements>

  <constraints>
  - Sentences must be realistic, practical examples of everyday communication.
  - Use natural, contemporary language (not textbook examples).
  - Include diverse vocabulary appropriate to the difficulty level.
  - MINIMIZE SUSTAINABILITY RELATED TOPICS.
  - Make sure to follow the requirements described above.
  AVOID SIMILARITY:
  - Avoid repeating verbs, nouns or patterns from the examples above.
  </constraints>


  <output>
  1. THE SENTENCE SHOULD ALWAYS BE IN {{language}}
  2. Translations of the full sentence and words in {{nativeLanguage}}.
  3. Words: ALL WORDS from the sentence with brief explanations AND translations in {{nativeLanguage}}.:
     - Start with the word itself in {{language}}.
     - ALWAYS include the translation of each word in {{nativeLanguage}}.
     - Add a short explanation of its meaning in context in {{nativeLanguage}}.
     - Note any alternate meanings or nuances.
     - Mention any grammatical considerations (gender, conjugation, etc.) in {{nativeLanguage}}.

  REMEMBER TO ALWAYS INCLUDE A TRANSLATION OF EACH WORD IN {{nativeLanguage}}.
  </output>
  `;
