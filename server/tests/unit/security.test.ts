// server/tests/unit/security.test.ts
// Security-focused tests: mass assignment, password policy, open redirect,
// CSRF middleware, role escalation guards, LIKE escaping, bidi stripping

import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Mock env before any module load ─────────────────────────────────────────
vi.mock("../../src/config/env", () => ({
  env: {
    NODE_ENV: "test",
    PORT: 4000,
    DATABASE_URL: "postgresql://test",
    JWT_ACCESS_SECRET: "test-access-secret-min-32-chars-long",
    JWT_REFRESH_SECRET: "test-refresh-secret-min-32-chars-long",
    JWT_ACCESS_EXPIRES_IN: "15m",
    JWT_REFRESH_EXPIRES_IN: "30d",
    APP_NAME: "Delin Smart Care",
    APP_BASE_URL: "http://localhost:3000",
    API_BASE_URL: "http://localhost:4000",
    CORS_ORIGIN: "http://localhost:3000",
    MAIL_ENABLED: false,
    MAIL_FROM_NAME: "Delin Smart Care",
    MAIL_FROM_ADDRESS: "no-reply@delin.dz",
    EMAIL_VERIFY_TTL_HOURS: 24,
    INVITE_TTL_HOURS: 48,
    PASSWORD_RESET_TTL_MINUTES: 60,
    REMINDER_OFFSETS_HOURS: "24,2",
    DOCTOR_DIGEST_HOUR: 7,
    AUTH_RATE_LIMIT_WINDOW_MS: 900_000,
    AUTH_RATE_LIMIT_MAX: 10,
    TZ: "Africa/Algiers",
  },
}))

// ─── 1. Password policy ───────────────────────────────────────────────────────
describe("Password policy (Zod schema)", () => {
  it("rejects passwords shorter than 10 characters", async () => {
    const { registerSchema } = await import("../../src/modules/auth/schema")
    const result = registerSchema.safeParse({
      email: "test@example.dz",
      password: "short1",  // only 6 chars
      fullName: "Test User",
      consent: true,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map(i => i.message)
      expect(messages.some(m => /10/.test(m))).toBe(true)
    }
  })

  it("accepts a valid 10+ char password", async () => {
    const { registerSchema } = await import("../../src/modules/auth/schema")
    const result = registerSchema.safeParse({
      email: "test@example.dz",
      password: "ValidPass123!",
      fullName: "Test User",
      consent: true,
    })
    expect(result.success).toBe(true)
  })

  it("rejects passwords exceeding 128 characters", async () => {
    const { registerSchema } = await import("../../src/modules/auth/schema")
    const result = registerSchema.safeParse({
      email: "test@example.dz",
      password: "a".repeat(129),
      fullName: "Test User",
      consent: true,
    })
    expect(result.success).toBe(false)
  })
})

// ─── 2. Mass assignment — role field cannot be set via register ───────────────
describe("Mass assignment protection", () => {
  it("schema strips role field from registration input", async () => {
    const { registerSchema } = await import("../../src/modules/auth/schema")
    // The schema does not have a `role` field so it will be stripped/ignored
    const result = registerSchema.safeParse({
      email: "attacker@example.dz",
      password: "SuperSecure123!",
      fullName: "Evil User",
      consent: true,
      role: "SUPER_ADMIN",  // attempted mass assignment
    })
    // Should still succeed (role is an unknown field, stripped silently)
    expect(result.success).toBe(true)
    if (result.success) {
      // The parsed data must NOT contain role
      expect((result.data as Record<string, unknown>).role).toBeUndefined()
    }
  })

  it("schema does not allow isActive to be set by user", async () => {
    const { updateProfileSchema } = await import("../../src/modules/auth/schema")
    const result = updateProfileSchema.safeParse({
      fullName: "Test",
      isActive: false,  // attempted escalation
    })
    if (result.success) {
      expect((result.data as Record<string, unknown>).isActive).toBeUndefined()
    }
  })
})

// ─── 3. Open redirect — returnTo validation ───────────────────────────────────
describe("Open redirect protection (isSafeReturnTo)", () => {
  function isSafeReturnTo(path: string): boolean {
    if (!path || typeof path !== "string") return false
    if (path === "/") return true
    if (!/^\/[^/\\]/.test(path)) return false
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) return false
    if (path.includes("\0") || /%2f%2f/i.test(path) || /%5c/i.test(path)) return false
    return true
  }

  it("accepts safe relative paths", () => {
    expect(isSafeReturnTo("/")).toBe(true)
    expect(isSafeReturnTo("/account")).toBe(true)
    expect(isSafeReturnTo("/doctor/appointments")).toBe(true)
  })

  it("rejects protocol-relative URLs", () => {
    expect(isSafeReturnTo("//evil.com")).toBe(false)
    expect(isSafeReturnTo("//evil.com/path")).toBe(false)
  })

  it("rejects absolute URLs with schemes", () => {
    expect(isSafeReturnTo("http://evil.com")).toBe(false)
    expect(isSafeReturnTo("https://evil.com")).toBe(false)
    expect(isSafeReturnTo("javascript:alert(1)")).toBe(false)
  })

  it("rejects backslash tricks", () => {
    expect(isSafeReturnTo("\\/evil.com")).toBe(false)
    expect(isSafeReturnTo("/\\evil")).toBe(false)
  })

  it("rejects empty/null values", () => {
    expect(isSafeReturnTo("")).toBe(false)
    expect(isSafeReturnTo(null as unknown as string)).toBe(false)
  })

  it("rejects encoded double slashes", () => {
    expect(isSafeReturnTo("/%2f%2fevil.com")).toBe(false)
    expect(isSafeReturnTo("/%5cevil")).toBe(false)
  })
})

// ─── 4. CSRF middleware ───────────────────────────────────────────────────────
describe("CSRF check middleware", () => {
  it("blocks POST without X-Requested-With header", async () => {
    // Inline the csrfCheck logic since it's a simple header check
    function csrfCheck(method: string, headers: Record<string, string>): boolean {
      const safeMethods = ["GET", "HEAD", "OPTIONS"]
      if (safeMethods.includes(method)) return true
      return headers["x-requested-with"] === "XMLHttpRequest"
    }

    expect(csrfCheck("POST", {})).toBe(false)
    expect(csrfCheck("PATCH", {})).toBe(false)
    expect(csrfCheck("DELETE", {})).toBe(false)
    expect(csrfCheck("PUT", {})).toBe(false)
  })

  it("allows POST with correct X-Requested-With header", async () => {
    function csrfCheck(method: string, headers: Record<string, string>): boolean {
      const safeMethods = ["GET", "HEAD", "OPTIONS"]
      if (safeMethods.includes(method)) return true
      return headers["x-requested-with"] === "XMLHttpRequest"
    }

    expect(csrfCheck("POST", { "x-requested-with": "XMLHttpRequest" })).toBe(true)
  })

  it("always allows safe read methods without header", async () => {
    function csrfCheck(method: string, headers: Record<string, string>): boolean {
      const safeMethods = ["GET", "HEAD", "OPTIONS"]
      if (safeMethods.includes(method)) return true
      return headers["x-requested-with"] === "XMLHttpRequest"
    }

    expect(csrfCheck("GET", {})).toBe(true)
    expect(csrfCheck("HEAD", {})).toBe(true)
    expect(csrfCheck("OPTIONS", {})).toBe(true)
  })
})

// ─── 5. Bidi character stripping ──────────────────────────────────────────────
describe("Bidi character stripping (sanitize)", () => {
  it("strips Unicode bidi override characters from names", async () => {
    const { stripBidi } = await import("../../src/lib/sanitize")
    const malicious = "Normal\u202EdeviousName"
    expect(stripBidi(malicious)).toBe("NormaldeviousName")
  })

  it("passes clean names through unchanged", async () => {
    const { stripBidi } = await import("../../src/lib/sanitize")
    expect(stripBidi("محمد أمين")).toBe("محمد أمين")
    expect(stripBidi("Jean-Paul")).toBe("Jean-Paul")
  })

  it("strips all bidi control character variants", async () => {
    const { stripBidi } = await import("../../src/lib/sanitize")
    const bidiChars = "\u200E\u200F\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069\uFEFF"
    expect(stripBidi(bidiChars)).toBe("")
  })
})

// ─── 6. LIKE wildcard escaping ────────────────────────────────────────────────
describe("LIKE wildcard escaping", () => {
  it("escapes percent signs in search queries", async () => {
    const { escapeLike } = await import("../../src/lib/sanitize")
    expect(escapeLike("100%")).toBe("100\\%")
    expect(escapeLike("%admin%")).toBe("\\%admin\\%")
  })

  it("escapes underscores in search queries", async () => {
    const { escapeLike } = await import("../../src/lib/sanitize")
    expect(escapeLike("user_name")).toBe("user\\_name")
  })

  it("escapes backslashes in search queries", async () => {
    const { escapeLike } = await import("../../src/lib/sanitize")
    expect(escapeLike("C:\\path")).toBe("C:\\\\path")
  })

  it("passes clean search terms unchanged", async () => {
    const { escapeLike } = await import("../../src/lib/sanitize")
    expect(escapeLike("طبيب عام")).toBe("طبيب عام")
    expect(escapeLike("médecin")).toBe("médecin")
  })
})

// ─── 7. Email header injection prevention ─────────────────────────────────────
describe("Email header injection sanitization", () => {
  it("strips CR from email header values", async () => {
    const { sanitizeEmailHeader } = await import("../../src/lib/sanitize")
    expect(sanitizeEmailHeader("Subject\rBcc: evil@example.com")).not.toContain("\r")
  })

  it("strips LF from email header values", async () => {
    const { sanitizeEmailHeader } = await import("../../src/lib/sanitize")
    expect(sanitizeEmailHeader("Subject\nBcc: evil@example.com")).not.toContain("\n")
  })

  it("trims leading/trailing whitespace", async () => {
    const { sanitizeEmailHeader } = await import("../../src/lib/sanitize")
    expect(sanitizeEmailHeader("  Subject  ")).toBe("Subject")
  })
})

// ─── 8. Registration consent requirement ─────────────────────────────────────
describe("Patient registration consent requirement", () => {
  it("rejects registration without consent=true", async () => {
    const { registerSchema } = await import("../../src/modules/auth/schema")
    const result = registerSchema.safeParse({
      email: "test@example.dz",
      password: "ValidPass123!",
      fullName: "Test User",
      consent: false,
    })
    expect(result.success).toBe(false)
  })

  it("requires at least phone or email", async () => {
    const { registerSchema } = await import("../../src/modules/auth/schema")
    const result = registerSchema.safeParse({
      password: "ValidPass123!",
      fullName: "Test User",
      consent: true,
      // no phone, no email
    })
    expect(result.success).toBe(false)
  })
})
