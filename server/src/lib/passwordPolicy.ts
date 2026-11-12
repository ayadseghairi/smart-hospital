// server/src/lib/passwordPolicy.ts
// Password policy validation shared across auth flows.
// NEVER log or return the password value in any error message.

/**
 * A curated list of common/weak passwords and platform-specific words.
 * Kept intentionally small — the real protection is length + argon2id.
 */
const WEAK_PASSWORDS = new Set([
  "password",
  "password1",
  "password123",
  "123456",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty",
  "qwerty123",
  "abc123",
  "admin",
  "admin123",
  "iloveyou",
  "monkey",
  "dragon",
  "master",
  "letmein",
  "welcome",
  "login",
  "changeme",
  "pass",
  "pass123",
  "test",
  "test123",
  "delin",
  "delinsmartcare",
  "delin123",
  "smartcare",
  "smartcare123",
  "khenchela",
  "algerie",
  "algeria",
])

export interface PolicyOptions {
  minLength?: number
  /** Email address of the user (to reject passwords containing the local part) */
  email?: string
}

export interface PolicyResult {
  ok: boolean
  /** Human-readable reason, safe to return to the caller (no password echoing) */
  reason?: string
}

/**
 * Check a candidate password against the platform policy.
 * Minimum 10 chars for regular users; minimum 14 for SUPER_ADMIN.
 * The initial bootstrap password requires minimum 16.
 *
 * IMPORTANT: do NOT include the password value in any returned message.
 */
export function checkPasswordPolicy(
  password: string,
  options: PolicyOptions = {}
): PolicyResult {
  const { minLength = 10, email } = options

  if (password.length < minLength) {
    return { ok: false, reason: `Password must be at least ${minLength} characters` }
  }

  if (password.length > 128) {
    return { ok: false, reason: "Password must not exceed 128 characters" }
  }

  // Reject common/weak passwords (case-insensitive)
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    return { ok: false, reason: "Password is too common or easily guessable" }
  }

  // Reject passwords that contain the email local part (case-insensitive)
  if (email) {
    const localPart = email.split("@")[0].toLowerCase()
    if (localPart.length >= 4 && password.toLowerCase().includes(localPart)) {
      return { ok: false, reason: "Password must not contain your email address" }
    }
  }

  return { ok: true }
}

/**
 * Validate the SUPER_ADMIN_INITIAL_PASSWORD bootstrap password.
 * Stricter: minimum 16 characters.
 * Returns a PolicyResult — never echoes the password in the reason.
 */
export function checkBootstrapPassword(
  password: string,
  email?: string
): PolicyResult {
  return checkPasswordPolicy(password, { minLength: 16, email })
}
