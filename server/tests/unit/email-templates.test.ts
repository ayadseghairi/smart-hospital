// server/tests/unit/email-templates.test.ts
// Tests for all email templates: rendering, XSS escaping, RTL, links, size.
import { describe, it, expect, vi } from "vitest"

// ── Mock env ──────────────────────────────────────────────────────────────────
vi.mock("../../src/config/env", () => ({
  env: {
    NODE_ENV: "test",
    APP_NAME: "Delin Smart Care",
    APP_BASE_URL: "https://delin.dz",
    API_BASE_URL: "https://api.delin.dz",
    CORS_ORIGIN: "https://delin.dz",
    MAIL_ENABLED: false,
    EMAIL_VERIFY_TTL_HOURS: 24,
    INVITE_TTL_HOURS: 48,
    PASSWORD_RESET_TTL_MINUTES: 60,
    MAIL_FROM_NAME: "Delin Smart Care",
    MAIL_FROM_ADDRESS: "no-reply@delin.dz",
  },
  reminderOffsets: [24, 2],
}))

import {
  buildVerifyEmailEmail,
  buildWelcomeEmail,
  buildPasswordResetEmail,
  buildPasswordChangedEmail,
  buildInviteEmail,
  buildAdminAccountReadyEmail,
  buildApptRequestedEmail,
  buildApptConfirmedEmail,
  buildApptCancelledEmail,
  buildAppointmentReminderEmail,
  buildDoctorNewRequestEmail,
  buildMfaStatusEmail,
  buildAlreadyRegisteredEmail,
  buildContactReceivedEmail,
  buildTestEmail,
} from "../../src/modules/notifications/templates"

const DATE = new Date("2025-06-15T09:00:00Z")
const BASE_URL = "https://delin.dz"
const VALID_LINK = `${BASE_URL}/verify?token=abc123`

// ── Shared assertions ─────────────────────────────────────────────────────────

function assertTemplate(
  tpl: { subject: string; html: string; text: string },
  options: { lang: "ar" | "fr"; isRtl?: boolean; checkSize?: boolean }
) {
  const { lang, isRtl = lang === "ar", checkSize = true } = options

  // Subject must be non-empty
  expect(tpl.subject.length).toBeGreaterThan(0)

  // Plain text alternative must be present and non-empty
  expect(tpl.text.length).toBeGreaterThan(0)

  // HTML must not be empty
  expect(tpl.html.length).toBeGreaterThan(0)

  // Arabic: must have dir="rtl" and lang="ar"
  if (isRtl) {
    expect(tpl.html).toContain('dir="rtl"')
    expect(tpl.html).toContain('lang="ar"')
  }

  // French: must have lang="fr"
  if (lang === "fr") {
    expect(tpl.html).toContain('lang="fr"')
  }

  // All img tags must have alt attribute
  const imgTags = tpl.html.match(/<img[^>]*>/g) ?? []
  for (const img of imgTags) {
    expect(img).toMatch(/alt=/i)
  }

  // HTML size under 100KB (Gmail clipping threshold)
  if (checkSize) {
    expect(tpl.html.length).toBeLessThan(100 * 1024)
  }

  // No JavaScript in HTML
  expect(tpl.html).not.toMatch(/\bonclick\b/i)
  expect(tpl.html).not.toContain("<script")

  // Must not contain medical reasons, diagnoses
  const medicalKeywords = ["diagnosis", "diagnose", "symptom", "medical reason", "diagnostic", "symptôme"]
  for (const kw of medicalKeywords) {
    expect(tpl.html.toLowerCase()).not.toContain(kw.toLowerCase())
  }
}

function assertAbsoluteLinks(html: string) {
  // All href links must be absolute https:// (relative to APP_BASE_URL) or mailto:/tel:
  const hrefPattern = /href="([^"]+)"/g
  let match
  while ((match = hrefPattern.exec(html)) !== null) {
    const href = match[1]
    // Allow absolute https:// links, mailto:, tel:, cid: (inline images)
    if (href.startsWith("cid:") || href.startsWith("mailto:") || href.startsWith("tel:")) continue
    expect(href).toMatch(/^https?:\/\//)
    // Must be on the APP_BASE_URL host or openstreetmap (for map links)
    expect(href).toMatch(/^https:\/\/(delin\.dz|www\.openstreetmap\.org)/)
  }
}

// ─── XSS escaping ─────────────────────────────────────────────────────────────

describe("XSS escaping in email templates", () => {
  it("escapes HTML in fullName field", () => {
    const xssPayload = '<script>alert("xss")</script>'
    const tpl = buildWelcomeEmail(xssPayload, "fr")
    expect(tpl.html).not.toContain("<script>")
    expect(tpl.html).toContain("&lt;script&gt;")
  })

  it("escapes HTML in doctor name field", () => {
    const xssPayload = '"><img src=x onerror=alert(1)>'
    const tpl = buildApptRequestedEmail({ doctorName: xssPayload, institutionName: "Hôpital", startsAt: DATE }, "fr")
    // The < and > must be escaped so the img tag cannot execute
    expect(tpl.html).not.toContain('<img src=x onerror')
    expect(tpl.html).toContain("&lt;img")
    // The raw payload should not appear as a working HTML tag
    expect(tpl.html).not.toMatch(/<img[^>]+onerror/)
  })

  it("escapes HTML in institution name", () => {
    const xssPayload = "<b>bold</b>"
    const tpl = buildApptConfirmedEmail({ doctorName: "Dr. Test", institutionName: xssPayload, startsAt: DATE, endsAt: DATE }, "fr")
    expect(tpl.html).not.toContain("<b>bold</b>")
    expect(tpl.html).toContain("&lt;b&gt;bold&lt;/b&gt;")
  })
})

// ─── EMAIL_VERIFY ─────────────────────────────────────────────────────────────

describe("buildVerifyEmailEmail", () => {
  it("renders French version correctly", () => {
    const tpl = buildVerifyEmailEmail(VALID_LINK, "fr")
    assertTemplate(tpl, { lang: "fr" })
    assertAbsoluteLinks(tpl.html)
    expect(tpl.html).toContain(VALID_LINK)
    expect(tpl.subject).toContain("Vérifiez")
  })

  it("renders Arabic version with RTL", () => {
    const tpl = buildVerifyEmailEmail(VALID_LINK, "ar")
    assertTemplate(tpl, { lang: "ar" })
    expect(tpl.subject).toContain("تأكيد")
  })

  it("text alternative contains the link", () => {
    const tpl = buildVerifyEmailEmail(VALID_LINK, "fr")
    expect(tpl.text).toContain(VALID_LINK)
  })
})

// ─── PASSWORD_RESET ────────────────────────────────────────────────────────────

describe("buildPasswordResetEmail", () => {
  it("renders FR version", () => {
    const tpl = buildPasswordResetEmail(VALID_LINK, "fr")
    assertTemplate(tpl, { lang: "fr" })
    expect(tpl.html).toContain(VALID_LINK)
    expect(tpl.subject).toContain("Réinitialisation")
  })

  it("renders AR version", () => {
    const tpl = buildPasswordResetEmail(VALID_LINK, "ar")
    assertTemplate(tpl, { lang: "ar" })
  })
})

// ─── PASSWORD_CHANGED ──────────────────────────────────────────────────────────

describe("buildPasswordChangedEmail", () => {
  it("contains security notice in French", () => {
    const tpl = buildPasswordChangedEmail("user@delin.dz", "Ahmed", "fr")
    assertTemplate(tpl, { lang: "fr" })
    expect(tpl.html).toContain("réinitialisez")
  })

  it("contains security notice in Arabic", () => {
    const tpl = buildPasswordChangedEmail("user@delin.dz", "أحمد", "ar")
    assertTemplate(tpl, { lang: "ar" })
    expect(tpl.html).toContain("أعد تعيين")
  })

  it("never contains the email address as a clickable link to an external site", () => {
    const tpl = buildPasswordChangedEmail("user@delin.dz", "Ahmed", "fr")
    assertAbsoluteLinks(tpl.html)
  })
})

// ─── INVITE ────────────────────────────────────────────────────────────────────

describe("buildInviteEmail", () => {
  it("renders French version with activation button", () => {
    const tpl = buildInviteEmail(VALID_LINK, "Dr. Martin", "fr")
    assertTemplate(tpl, { lang: "fr" })
    expect(tpl.html).toContain(VALID_LINK)
    expect(tpl.subject).toContain("Invitation")
  })

  it("renders Arabic version", () => {
    const tpl = buildInviteEmail(VALID_LINK, "د. محمد", "ar")
    assertTemplate(tpl, { lang: "ar" })
  })
})

// ─── ADMIN_ACCOUNT_READY ──────────────────────────────────────────────────────

describe("buildAdminAccountReadyEmail", () => {
  it("does not contain a password", () => {
    const tpl = buildAdminAccountReadyEmail(`${BASE_URL}/login`, "Admin", "fr")
    expect(tpl.html).not.toMatch(/password\s*:/i)
    expect(tpl.html).not.toMatch(/mot de passe\s*:/i)
    // Should not contain any value that looks like a hashed password
    expect(tpl.html).not.toMatch(/\$argon2/)
  })

  it("renders in Arabic", () => {
    const tpl = buildAdminAccountReadyEmail(`${BASE_URL}/login`, "المشرف", "ar")
    assertTemplate(tpl, { lang: "ar" })
    expect(tpl.html).toContain(`${BASE_URL}/login`)
  })
})

// ─── APPT_CONFIRMED ───────────────────────────────────────────────────────────

describe("buildApptConfirmedEmail", () => {
  it("renders FR with map link when coordinates provided", () => {
    const tpl = buildApptConfirmedEmail({
      doctorName: "Dr. Ahmed",
      institutionName: "CHU Khenchela",
      startsAt: DATE,
      endsAt: new Date(DATE.getTime() + 30 * 60 * 1000),
      institutionLat: 35.43,
      institutionLng: 7.14,
    }, "fr")
    assertTemplate(tpl, { lang: "fr" })
    expect(tpl.html).toContain("openstreetmap.org")
  })

  it("renders without map link when no coordinates", () => {
    const tpl = buildApptConfirmedEmail({
      doctorName: "Dr. Ahmed",
      institutionName: "CHU Khenchela",
      startsAt: DATE,
      endsAt: DATE,
    }, "ar")
    assertTemplate(tpl, { lang: "ar" })
    expect(tpl.html).not.toContain("openstreetmap.org")
  })
})

// ─── APPT_REMINDER ────────────────────────────────────────────────────────────

describe("buildAppointmentReminderEmail", () => {
  it("FR: includes List-Unsubscribe header", () => {
    const tpl = buildAppointmentReminderEmail({ doctorName: "Dr. Test", institutionName: "Hôpital", startsAt: DATE, offsetHours: 24 }, "fr")
    assertTemplate(tpl, { lang: "fr" })
    expect(tpl.headers?.["List-Unsubscribe"]).toBeDefined()
  })

  it("AR: renders RTL with appointment details", () => {
    const tpl = buildAppointmentReminderEmail({ doctorName: "د. محمد", institutionName: "مستشفى", startsAt: DATE, offsetHours: 2 }, "ar")
    assertTemplate(tpl, { lang: "ar" })
    expect(tpl.subject).toContain("2 ساعة")
  })

  it("does not contain medical reasons or diagnoses", () => {
    const tpl = buildAppointmentReminderEmail({ doctorName: "Dr. Test", institutionName: "Hôpital", startsAt: DATE }, "fr")
    expect(tpl.html).not.toMatch(/raison médicale|diagnos|symptôm/i)
    expect(tpl.text).not.toMatch(/raison médicale|diagnos|symptôm/i)
  })
})

// ─── ALREADY_REGISTERED ───────────────────────────────────────────────────────

describe("buildAlreadyRegisteredEmail", () => {
  it("FR: provides login link", () => {
    const tpl = buildAlreadyRegisteredEmail("fr")
    assertTemplate(tpl, { lang: "fr" })
    expect(tpl.html).toContain(`${BASE_URL}/login`)
    expect(tpl.html).toContain(`${BASE_URL}/forgot-password`)
  })

  it("is a security email (no unsubscribe)", () => {
    const tpl = buildAlreadyRegisteredEmail("fr")
    expect(tpl.headers?.["List-Unsubscribe"]).toBeUndefined()
  })
})

// ─── TEST_EMAIL ───────────────────────────────────────────────────────────────

describe("buildTestEmail", () => {
  it("renders both languages", () => {
    const fr = buildTestEmail("fr")
    const ar = buildTestEmail("ar")
    assertTemplate(fr, { lang: "fr" })
    assertTemplate(ar, { lang: "ar" })
  })
})

// ─── mustChangePassword middleware ────────────────────────────────────────────

describe("requirePasswordChange middleware", () => {
  it("blocks a request when mustChangePassword is set", async () => {
    const { requirePasswordChange } = await import("../../src/middleware/requirePasswordChange")
    const req = {
      user: { sub: "u1", role: "SUPER_ADMIN", mustChangePassword: true },
      originalUrl: "/api/v1/admin/users",
      path: "/api/v1/admin/users",
    } as never

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as never

    const next = vi.fn()

    requirePasswordChange(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: "PASSWORD_CHANGE_REQUIRED" })
    )
    expect(next).not.toHaveBeenCalled()
  })

  it("allows /api/v1/auth/password when mustChangePassword is set", async () => {
    const { requirePasswordChange } = await import("../../src/middleware/requirePasswordChange")
    const req = {
      user: { sub: "u1", role: "SUPER_ADMIN", mustChangePassword: true },
      originalUrl: "/api/v1/auth/password",
      path: "/api/v1/auth/password",
    } as never

    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as never
    const next = vi.fn()

    requirePasswordChange(req, res, next)
    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })

  it("allows all requests when mustChangePassword is false", async () => {
    const { requirePasswordChange } = await import("../../src/middleware/requirePasswordChange")
    const req = {
      user: { sub: "u1", role: "SUPER_ADMIN", mustChangePassword: false },
      originalUrl: "/api/v1/admin/users",
      path: "/api/v1/admin/users",
    } as never

    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as never
    const next = vi.fn()

    requirePasswordChange(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})

// ─── requireMfaEnrolled middleware ────────────────────────────────────────────

describe("requireMfaEnrolled middleware", () => {
  it("blocks when mfaSetupRequired is true", async () => {
    const { requireMfaEnrolled } = await import("../../src/middleware/requireMfaEnrolled")
    const req = {
      user: { sub: "u1", role: "SUPER_ADMIN", mfaSetupRequired: true },
    } as never

    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as never
    const next = vi.fn()

    requireMfaEnrolled(req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: "MFA_SETUP_REQUIRED" })
    )
  })

  it("allows when mfaSetupRequired is false", async () => {
    const { requireMfaEnrolled } = await import("../../src/middleware/requireMfaEnrolled")
    const req = { user: { sub: "u1", role: "SUPER_ADMIN", mfaSetupRequired: false } } as never
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as never
    const next = vi.fn()

    requireMfaEnrolled(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})
