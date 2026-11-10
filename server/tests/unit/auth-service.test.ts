// tests/unit/auth-service.test.ts
// Tests for auth business logic using vi.mock to avoid a live database.
// These tests validate: role enforcement, token flows, account enumeration prevention.
import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Mock config/env FIRST to prevent process.exit(1) on missing env vars ───
vi.mock("../../src/config/env", () => ({
  env: {
    NODE_ENV: "test",
    APP_NAME: "Delin Smart Care",
    APP_BASE_URL: "http://localhost:3000",
    API_BASE_URL: "http://localhost:4000",
    CORS_ORIGIN: "http://localhost:3000",
    MAIL_ENABLED: false,
    EMAIL_VERIFY_TTL_HOURS: 24,
    INVITE_TTL_HOURS: 48,
    PASSWORD_RESET_TTL_MINUTES: 60,
    JWT_ACCESS_SECRET: "test-secret-at-least-32-chars-long-xxx",
    JWT_REFRESH_SECRET: "test-refresh-secret-at-least-32-long",
    JWT_ACCESS_EXPIRES_IN: "15m",
    JWT_REFRESH_EXPIRES_IN: "30d",
    MAIL_FROM_NAME: "Delin Smart Care",
    MAIL_FROM_ADDRESS: "no-reply@delin.dz",
  },
  reminderOffsets: [24, 2],
}))

// ─── Mock Prisma ──────────────────────────────────────────────────────────────
vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    authToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(async (ops: unknown) => {
      if (Array.isArray(ops)) return Promise.all(ops)
      if (typeof ops === "function") {
        return (ops as (tx: unknown) => unknown)({
          authToken: { update: vi.fn().mockResolvedValue({}) },
          user: { update: vi.fn().mockResolvedValue({}) },
          refreshToken: { updateMany: vi.fn().mockResolvedValue({}) },
        })
      }
    }),
  },
}))

vi.mock("../../src/lib/mail", () => ({
  mail: { send: vi.fn().mockResolvedValue(undefined) },
}))

vi.mock("../../src/lib/jwt", () => ({
  signAccessToken: vi.fn(() => "mock-access-token"),
  signRefreshToken: vi.fn(() => "mock-refresh-token"),
}))

// ─── Import after all mocks ───────────────────────────────────────────────────
import { prisma } from "../../src/lib/prisma"
import {
  registerPatient,
  verifyEmail,
  forgotPassword,
  resetPassword,
  acceptInvite,
} from "../../src/modules/auth/service"
import { hashToken } from "../../src/lib/tokens"

// ─── Fixtures ──────────────────────────────────────────────────────────────────
const mockUser = {
  id: "user-1",
  role: "PATIENT",
  phone: "+213551234567",
  email: "patient@example.dz",
  emailVerifiedAt: null,
  passwordHash: null,
  fullName: "مريض تجريبي",
  preferredLang: "ar",
  isActive: true,
  mustSetPassword: false,
  createdById: null,
  consentAcceptedAt: new Date(),
  createdAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── Role enforcement ─────────────────────────────────────────────────────────
describe("registerPatient — role enforcement", () => {
  it("always creates a PATIENT regardless of any role field in the input", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({ ...mockUser, id: "new-user" })
    vi.mocked(prisma.authToken.create).mockResolvedValue({} as never)
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({
      id: "rt-1",
      tokenHash: "h",
      userId: "new-user",
      expiresAt: new Date(),
      revokedAt: null,
      createdAt: new Date(),
    })

    await registerPatient({
      phone: "0551234567",
      email: "new@example.dz",
      password: "S3cur3Pass!",
      fullName: "مريض جديد",
      preferredLang: "ar",
      consentAccepted: true,
    })

    const createCall = vi.mocked(prisma.user.create).mock.calls[0][0]
    expect(createCall.data.role).toBe("PATIENT")
  })

  it("normalizes the phone to +213 format before saving", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({ ...mockUser, id: "new-user" })
    vi.mocked(prisma.authToken.create).mockResolvedValue({} as never)
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({
      id: "rt-2",
      tokenHash: "h",
      userId: "new-user",
      expiresAt: new Date(),
      revokedAt: null,
      createdAt: new Date(),
    })

    await registerPatient({
      phone: "0661234567",
      password: "S3cur3Pass!",
      fullName: "مريض",
      preferredLang: "ar",
      consentAccepted: true,
    })

    const createCall = vi.mocked(prisma.user.create).mock.calls[0][0]
    expect(createCall.data.phone).toBe("+213661234567")
  })

  it("normalizes email to lowercase before saving", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue({ ...mockUser, id: "new-user" })
    vi.mocked(prisma.authToken.create).mockResolvedValue({} as never)
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({
      id: "rt-3",
      tokenHash: "h",
      userId: "new-user",
      expiresAt: new Date(),
      revokedAt: null,
      createdAt: new Date(),
    })

    await registerPatient({
      email: "Doctor@Hospital.DZ",
      password: "S3cur3Pass!",
      fullName: "مريض",
      preferredLang: "ar",
      consentAccepted: true,
    })

    const createCall = vi.mocked(prisma.user.create).mock.calls[0][0]
    expect(createCall.data.email).toBe("doctor@hospital.dz")
  })
})

// ─── Email verification token flow ────────────────────────────────────────────
describe("verifyEmail", () => {
  it("marks emailVerifiedAt when a valid token is provided", async () => {
    const raw = "valid-raw-token-64chars-aaaabbbbcccc1234"
    const hash = hashToken(raw)

    vi.mocked(prisma.authToken.findUnique).mockResolvedValue({
      id: "tok-1",
      userId: "user-1",
      type: "EMAIL_VERIFY" as const,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      usedAt: null,
      createdAt: new Date(),
    })
    vi.mocked(prisma.authToken.update).mockResolvedValue({} as never)
    vi.mocked(prisma.user.update).mockResolvedValue({} as never)

    await expect(verifyEmail(raw)).resolves.toBeUndefined()
  })

  it("rejects an expired token", async () => {
    const raw = "expired-token"
    const hash = hashToken(raw)

    vi.mocked(prisma.authToken.findUnique).mockResolvedValue({
      id: "tok-2",
      userId: "user-1",
      type: "EMAIL_VERIFY" as const,
      tokenHash: hash,
      expiresAt: new Date(Date.now() - 1000), // expired
      usedAt: null,
      createdAt: new Date(),
    })

    await expect(verifyEmail(raw)).rejects.toThrow("Invalid or expired token")
  })

  it("rejects an already-used token (single-use enforcement)", async () => {
    const raw = "already-used-token"
    const hash = hashToken(raw)

    vi.mocked(prisma.authToken.findUnique).mockResolvedValue({
      id: "tok-3",
      userId: "user-1",
      type: "EMAIL_VERIFY" as const,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + 3600_000),
      usedAt: new Date(), // already consumed
      createdAt: new Date(),
    })

    await expect(verifyEmail(raw)).rejects.toThrow("Invalid or expired token")
  })

  it("rejects a token of the wrong type", async () => {
    const raw = "wrong-type-token"
    const hash = hashToken(raw)

    vi.mocked(prisma.authToken.findUnique).mockResolvedValue({
      id: "tok-4",
      userId: "user-1",
      type: "PASSWORD_RESET" as const,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + 3600_000),
      usedAt: null,
      createdAt: new Date(),
    })

    await expect(verifyEmail(raw)).rejects.toThrow("Invalid or expired token")
  })

  it("rejects a token not in the database (tampered or invented)", async () => {
    vi.mocked(prisma.authToken.findUnique).mockResolvedValue(null)
    await expect(verifyEmail("nonexistent-token")).rejects.toThrow("Invalid or expired token")
  })
})

// ─── Password reset flow ───────────────────────────────────────────────────────
describe("forgotPassword", () => {
  it("returns a generic message when the account does NOT exist (no enumeration)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const result = await forgotPassword("nobody@example.dz")
    expect(typeof result).toBe("string")
    expect(result).not.toMatch(/not found/i)
    expect(result).not.toMatch(/no account/i)
  })

  it("returns the same generic message when the account DOES exist", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser })
    vi.mocked(prisma.authToken.create).mockResolvedValue({} as never)

    const result = await forgotPassword("patient@example.dz")
    expect(typeof result).toBe("string")
  })

  it("the response is identical whether or not the account exists (timing safety)", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    const noAccount = await forgotPassword("nobody@example.dz")

    vi.clearAllMocks()
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser })
    vi.mocked(prisma.authToken.create).mockResolvedValue({} as never)
    const withAccount = await forgotPassword("patient@example.dz")

    expect(noAccount).toBe(withAccount)
  })
})

describe("resetPassword", () => {
  it("rejects an expired token", async () => {
    const raw = "expired-reset-token"
    const hash = hashToken(raw)

    vi.mocked(prisma.authToken.findUnique).mockResolvedValue({
      id: "tok-5",
      userId: "user-1",
      type: "PASSWORD_RESET" as const,
      tokenHash: hash,
      expiresAt: new Date(Date.now() - 1000),
      usedAt: null,
      createdAt: new Date(),
    })

    await expect(resetPassword(raw, "NewPass123!")).rejects.toThrow("Invalid or expired token")
  })

  it("rejects an already-used token", async () => {
    const raw = "used-reset-token"
    const hash = hashToken(raw)

    vi.mocked(prisma.authToken.findUnique).mockResolvedValue({
      id: "tok-6",
      userId: "user-1",
      type: "PASSWORD_RESET" as const,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + 3600_000),
      usedAt: new Date(),
      createdAt: new Date(),
    })

    await expect(resetPassword(raw, "NewPass123!")).rejects.toThrow("Invalid or expired token")
  })
})

// ─── Invite flow ───────────────────────────────────────────────────────────────
describe("acceptInvite", () => {
  it("rejects an INVITE token that has already been used", async () => {
    const raw = "used-invite-token"
    const hash = hashToken(raw)

    vi.mocked(prisma.authToken.findUnique).mockResolvedValue({
      id: "tok-7",
      userId: "doctor-1",
      type: "INVITE" as const,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + 86400_000),
      usedAt: new Date(),
      createdAt: new Date(),
    })

    await expect(acceptInvite(raw, "MyNewPass123!")).rejects.toThrow("Invalid or expired invite link")
  })

  it("rejects an INVITE token that has expired", async () => {
    const raw = "expired-invite-token"
    const hash = hashToken(raw)

    vi.mocked(prisma.authToken.findUnique).mockResolvedValue({
      id: "tok-8",
      userId: "doctor-1",
      type: "INVITE" as const,
      tokenHash: hash,
      expiresAt: new Date(Date.now() - 1000),
      usedAt: null,
      createdAt: new Date(),
    })

    await expect(acceptInvite(raw, "MyNewPass123!")).rejects.toThrow("Invalid or expired invite link")
  })

  it("rejects a token of the wrong type used as an invite", async () => {
    const raw = "wrong-type-invite"
    const hash = hashToken(raw)

    vi.mocked(prisma.authToken.findUnique).mockResolvedValue({
      id: "tok-9",
      userId: "doctor-1",
      type: "EMAIL_VERIFY" as const,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + 86400_000),
      usedAt: null,
      createdAt: new Date(),
    })

    await expect(acceptInvite(raw, "MyNewPass123!")).rejects.toThrow("Invalid or expired invite link")
  })
})
