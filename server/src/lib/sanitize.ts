// server/src/lib/sanitize.ts
// Strip Unicode bidi override characters that can spoof displayed text

/** Strip Unicode bidi control characters from a string */
export function stripBidi(s: string): string {
  // Bidi override and embedding characters: U+200E, U+200F, U+202A-U+202E, U+2066-U+2069, U+FEFF
  return s.replace(/[\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, "")
}

/** Strip CR/LF from email header values (prevent header injection) */
export function sanitizeEmailHeader(s: string): string {
  return s.replace(/[\r\n]/g, " ").trim()
}

/** Escape LIKE wildcards to prevent unintended wildcard search */
export function escapeLike(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")
}
