// server/src/modules/search/normalize.ts
// Normalize Arabic and French text for search

/**
 * Normalize Arabic text for search:
 * - Strip diacritics (tashkeel)
 * - Unify alef forms (أإآا → ا)
 * - Unify ة → ه
 * - Unify ى → ي
 * Also strips French accents.
 */
export function normalizeArabic(text: string): string {
  return normalizeFrench(text)
    // Strip Arabic diacritics
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // Unify alef variants
    .replace(/[أإآ]/g, "ا")
    // Unify taa marbuta
    .replace(/ة/g, "ه")
    // Unify alef maqsoura
    .replace(/ى/g, "ي")
    .trim()
}

/**
 * Normalize French accents for search.
 */
export function normalizeFrench(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove combining diacritical marks
    .toLowerCase()
}
