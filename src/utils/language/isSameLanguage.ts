export const isSameLanguage = (
  lang1?: string | null,
  lang2?: string | null
): boolean => {
  if (!lang1 || !lang2) {
    return false;
  }
  return lang1.toLowerCase() === lang2.toLowerCase();
};
