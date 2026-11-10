// server/src/lib/phone.ts
// Algerian phone number normalization and validation

const ALGERIAN_PHONE_RE = /^(?:\+213|00213|0)([567]\d{8})$/

/**
 * Normalize an Algerian phone number to +213XXXXXXXXX format.
 * Returns null if the number is invalid.
 */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim().replace(/\s+/g, "")
  const match = ALGERIAN_PHONE_RE.exec(trimmed)
  if (!match) return null
  return `+213${match[1]}`
}

/**
 * Returns true if the raw string is a valid Algerian mobile number.
 */
export function isValidAlgerianPhone(raw: string): boolean {
  return normalizePhone(raw) !== null
}
