// server/src/lib/tokens.ts
// Single-use token utilities — never store the raw token, only its SHA-256 hash
import crypto from "crypto"

/**
 * Generate a cryptographically random URL-safe token (hex string).
 * The raw token goes in the email link; the hash goes in the DB.
 */
export function generateRawToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString("hex")
}

/**
 * Hash a raw token with SHA-256 for storage.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex")
}
