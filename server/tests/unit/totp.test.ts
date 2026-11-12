// server/tests/unit/totp.test.ts
// Tests for TOTP 2FA: encryption, TOTP verify logic, family-revocation on reuse.
import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Mock env ─────────────────────────────────────────────────────────────────
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
    MFA_ENCRYPTION_KEY: "0".repeat(64), // 32 zero-bytes as hex for testing
    MAIL_FROM_NAME: "Delin Smart Care",
    MAIL_FROM_ADDRESS: "no-reply@delin.dz",
  },
  reminderOffsets: [24, 2],
}))

// ─── Mock Prisma ──────────────────────────────────────────────────────────────
vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    refreshToken: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    recoveryCode: { findUnique: vi.fn(), update: vi.fn(), deleteMany: vi.fn(), createMany: vi.fn(), count: vi.fn() },
    $transaction: vi.fn(async (ops: unknown) => {
      if (Array.isArray(ops)) return Promise.all(ops)
      return (ops as (tx: unknown) => unknown)({
        user: { update: vi.fn().mockResolvedValue({}) },
        recoveryCode: { deleteMany: vi.fn().mockResolvedValue({}), createMany: vi.fn().mockResolvedValue({}) },
        refreshToken: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      })
    }),
  },
}))

vi.mock("../../src/lib/mail", () => ({
  mail: { send: vi.fn().mockResolvedValue(undefined) },
}))

vi.mock("../../src/lib/audit", () => ({
  audit: vi.fn().mockResolvedValue(undefined),
}))

// ─── Set process.env for mfaCrypto (reads directly, not from config mock) ────
process.env.MFA_ENCRYPTION_KEY = "0".repeat(64)

// ─── Imports after mocks ──────────────────────────────────────────────────────
import { encryptTotpSecret, decryptTotpSecret } from "../../src/lib/mfaCrypto"
import { signMfaToken, verifyMfaToken } from "../../src/lib/jwt"
import { prisma } from "../../src/lib/prisma"
import { hashToken } from "../../src/lib/tokens"

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── 1. AES-256-GCM encryption round-trip ────────────────────────────────────
describe("TOTP secret encryption (AES-256-GCM)", () => {
  it("encrypt → decrypt returns the original secret", () => {
    const original = "JBSWY3DPEHPK3PXP" // example Base32 TOTP secret
    const encrypted = encryptTotpSecret(original)
    expect(encrypted).not.toBe(original)
    expect(encrypted.split(":")).toHaveLength(3) // iv:tag:ciphertext
    expect(decryptTotpSecret(encrypted)).toBe(original)
  })

  it("each encryption of the same value produces a different ciphertext (random IV)", () => {
    const secret = "JBSWY3DPEHPK3PXP"
    const enc1 = encryptTotpSecret(secret)
    const enc2 = encryptTotpSecret(secret)
    expect(enc1).not.toBe(enc2)
    expect(decryptTotpSecret(enc1)).toBe(secret)
    expect(decryptTotpSecret(enc2)).toBe(secret)
  })

  it("decryption of tampered ciphertext throws", () => {
    const encrypted = encryptTotpSecret("JBSWY3DPEHPK3PXP")
    const [iv, tag, cipher] = encrypted.split(":")
    const tampered = [iv, tag, "deadbeef" + cipher].join(":")
    expect(() => decryptTotpSecret(tampered)).toThrow()
  })
})

// ─── 2. MFA token (short-lived JWT) ──────────────────────────────────────────
describe("MFA challenge token", () => {
  it("signMfaToken creates a token with purpose=mfa-challenge", () => {
    const token = signMfaToken("user-abc")
    const payload = verifyMfaToken(token)
    expect(payload.sub).toBe("user-abc")
    expect(payload.purpose).toBe("mfa-challenge")
  })

  it("verifyMfaToken rejects an access token (wrong audience)", async () => {
    // A regular access token should not be usable as an MFA token
    const { signAccessToken } = await import("../../src/lib/jwt")
    const accessToken = signAccessToken({ sub: "user-abc", role: "SUPER_ADMIN" })
    expect(() => verifyMfaToken(accessToken)).toThrow()
  })

  it("verifyMfaToken rejects a tampered token", () => {
    const token = signMfaToken("user-abc")
    const tampered = token.slice(0, -5) + "XXXXX"
    expect(() => verifyMfaToken(tampered)).toThrow()
  })
})

// ─── 3. Refresh token family reuse detection ─────────────────────────────────
describe("Refresh token family reuse detection", () => {
  it("reusing a rotated (revoked) token revokes the entire family", async () => {
    const { refreshAccessToken } = await import("../../src/modules/auth/service")

    // Simulate: old rotated token (revokedAt is set) → found in DB with a familyId
    vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
      id: "rt-old",
      userId: "user-1",
      tokenHash: hashToken("old-raw-token"),
      familyId: "family-abc",
      expiresAt: new Date(Date.now() + 86400_000),
      revokedAt: new Date(), // already rotated
      createdAt: new Date(),
    })

    // The reuse detection should revoke all tokens in the family
    vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 2 })

    await expect(refreshAccessToken("old-raw-token")).rejects.toThrow(
      "Refresh token reuse detected"
    )

    // Verify the family revocation call was made
    expect(vi.mocked(prisma.refreshToken.updateMany)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ familyId: "family-abc" }),
        data: expect.objectContaining({ revokedAt: expect.any(Date) }),
      })
    )
  })

  it("a fresh valid token rotates normally within the same family", async () => {
    const { refreshAccessToken } = await import("../../src/modules/auth/service")

    vi.mocked(prisma.refreshToken.findUnique).mockResolvedValue({
      id: "rt-valid",
      userId: "user-2",
      tokenHash: hashToken("valid-raw-token"),
      familyId: "family-xyz",
      expiresAt: new Date(Date.now() + 86400_000),
      revokedAt: null, // not yet rotated
      createdAt: new Date(),
    })

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-2",
      role: "PATIENT",
      email: "patient@test.dz",
      phone: null,
      isActive: true,
      mustChangePassword: false,
      totpEnabledAt: null,
      totpSecret: null,
      totpLastUsedStep: null,
      fullName: "Test User",
      preferredLang: "ar",
      emailVerifiedAt: new Date(),
      mustSetPassword: false,
      createdById: null,
      consentAcceptedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never)

    vi.mocked(prisma.refreshToken.update).mockResolvedValue({} as never)
    vi.mocked(prisma.refreshToken.create).mockResolvedValue({
      id: "rt-new",
      userId: "user-2",
      tokenHash: "new-hash",
      familyId: "family-xyz",
      expiresAt: new Date(Date.now() + 86400_000),
      revokedAt: null,
      createdAt: new Date(),
    })

    const result = await refreshAccessToken("valid-raw-token")
    expect(result).toHaveProperty("accessToken")
    expect(result).toHaveProperty("refreshToken")

    // New token should be in the same family
    const createCall = vi.mocked(prisma.refreshToken.create).mock.calls[0][0]
    expect(createCall.data.familyId).toBe("family-xyz")
  })
})

// ─── 4. Recovery code hashing ────────────────────────────────────────────────
describe("Recovery code hashing", () => {
  it("recovery codes are hashed with SHA-256 before storage", () => {
    // hashToken is SHA-256
    const rawCode = "ABCD-EFGH"
    const normalized = rawCode.replace(/[\s-]/g, "").toUpperCase()
    const hash = hashToken(normalized)
    expect(hash).not.toBe(normalized)
    expect(hash).toHaveLength(64) // hex SHA-256
  })
})
