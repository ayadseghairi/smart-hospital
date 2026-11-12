// server/tests/unit/bootstrap.test.ts
// Tests for bootstrapSuperAdmin() and mustChangePassword flows.
// All DB, mail and external calls are mocked.
import { describe, it, expect, vi, beforeEach } from "vitest"

// ── Mocks ────────────────────────────────────────────────────────────────────

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
    SUPER_ADMIN_EMAIL: "admin@delin.dz",
    SUPER_ADMIN_FULL_NAME: "Test Admin",
    SUPER_ADMIN_INITIAL_PASSWORD: "StrongP@ssw0rd2025!",
  },
  reminderOffsets: [24, 2],
}))

vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    authToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditLog: { create: vi.fn() },
    $transaction: vi.fn(async (ops: unknown) => {
      if (Array.isArray(ops)) return Promise.all(ops)
      if (typeof ops === "function") return (ops as (tx: unknown) => unknown)({})
    }),
  },
}))

vi.mock("../../src/lib/mail", () => ({
  mail: { send: vi.fn().mockResolvedValue(undefined) },
}))

vi.mock("../../src/lib/audit", () => ({
  audit: vi.fn().mockResolvedValue(undefined),
}))

vi.mock("../../src/lib/jwt", () => ({
  signAccessToken: vi.fn(() => "mock-access-token"),
  signRefreshToken: vi.fn(() => "mock-refresh-token"),
}))

// ── Imports ──────────────────────────────────────────────────────────────────

import { prisma } from "../../src/lib/prisma"
import { mail } from "../../src/lib/mail"
import { audit } from "../../src/lib/audit"
import { checkPasswordPolicy, checkBootstrapPassword } from "../../src/lib/passwordPolicy"
import { bootstrapSuperAdmin } from "../../src/lib/bootstrap"

const mockUser = {
  id: "admin-1",
  role: "SUPER_ADMIN" as const,
  email: "admin@delin.dz",
  fullName: "Test Admin",
  preferredLang: "ar" as const,
  isActive: true,
  mustSetPassword: false,
  mustChangePassword: true,
  totpEnabledAt: null,
  totpSecret: null,
  passwordHash: null,
  emailVerifiedAt: new Date(),
  consentAcceptedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdById: null,
  phone: null,
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── Password policy unit tests ───────────────────────────────────────────────

describe("checkPasswordPolicy", () => {
  it("accepts a strong password", () => {
    const result = checkPasswordPolicy("V3ryStr0ng!Pass2025", { minLength: 10 })
    expect(result.ok).toBe(true)
  })

  it("rejects a password shorter than minLength", () => {
    const result = checkPasswordPolicy("short", { minLength: 10 })
    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/at least 10/)
    // reason must not contain the password value
    expect(result.reason).not.toContain("short")
  })

  it("rejects a common password", () => {
    const result = checkPasswordPolicy("admin", { minLength: 5 })
    expect(result.ok).toBe(false)
    expect(result.reason).not.toContain("admin")
  })

  it("rejects a password containing the email local part", () => {
    const result = checkPasswordPolicy("adminPass2025!", { email: "admin@delin.dz" })
    expect(result.ok).toBe(false)
    expect(result.reason).not.toContain("adminPass2025!")
  })

  it("never echoes the password value in the reason", () => {
    const secretPass = "mySecretPass123!"
    const result = checkPasswordPolicy(secretPass, { email: "mysecretpass@test.dz" })
    // Whether ok or not, reason must not contain the password
    if (result.reason) {
      expect(result.reason).not.toContain(secretPass)
    }
  })
})

describe("checkBootstrapPassword", () => {
  it("requires minimum 16 characters", () => {
    const result = checkBootstrapPassword("Short1Pass!")
    expect(result.ok).toBe(false)
    expect(result.reason).toMatch(/at least 16/)
  })

  it("accepts a 16+ char strong password", () => {
    const result = checkBootstrapPassword("V3ryStr0ngBootstrap2025!")
    expect(result.ok).toBe(true)
  })
})

// ─── Bootstrap idempotency tests ──────────────────────────────────────────────

describe("bootstrapSuperAdmin", () => {
  it("does nothing if a SUPER_ADMIN already exists (idempotent)", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as never)

    await bootstrapSuperAdmin()

    expect(prisma.user.create).not.toHaveBeenCalled()
    expect(mail.send).not.toHaveBeenCalled()
  })

  it("creates exactly one super admin when none exists", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as never)

    await bootstrapSuperAdmin()

    expect(prisma.user.create).toHaveBeenCalledOnce()
    const createData = vi.mocked(prisma.user.create).mock.calls[0][0]
    expect(createData.data.role).toBe("SUPER_ADMIN")
    expect(createData.data.mustChangePassword).toBe(true)
  })

  it("never logs or includes the initial password in audit or email", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as never)

    const consoleSpy = vi.spyOn(console, "log")
    const errorSpy = vi.spyOn(console, "error")

    await bootstrapSuperAdmin()

    // Check no log output contains the password value
    const initialPassword = "StrongP@ssw0rd2025!"
    for (const call of consoleSpy.mock.calls) {
      for (const arg of call) {
        expect(String(arg)).not.toContain(initialPassword)
      }
    }

    // Check audit was called without the password
    if (vi.mocked(audit).mock.calls.length > 0) {
      const auditCall = vi.mocked(audit).mock.calls[0][0]
      expect(JSON.stringify(auditCall)).not.toContain(initialPassword)
    }

    // Check email was called without the password
    if (vi.mocked(mail.send).mock.calls.length > 0) {
      const emailCall = vi.mocked(mail.send).mock.calls[0][0]
      expect(emailCall.html).not.toContain(initialPassword)
      expect(emailCall.text).not.toContain(initialPassword)
    }

    consoleSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it("writes SUPER_ADMIN_BOOTSTRAPPED audit entry", async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as never)

    await bootstrapSuperAdmin()

    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ action: "SUPER_ADMIN_BOOTSTRAPPED" })
    )
  })

  it("does not create a second admin on the second run", async () => {
    // First run: no admin exists
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(null)
    vi.mocked(prisma.user.create).mockResolvedValueOnce(mockUser as never)

    await bootstrapSuperAdmin()
    expect(prisma.user.create).toHaveBeenCalledOnce()

    // Second run: admin now exists
    vi.clearAllMocks()
    vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as never)

    await bootstrapSuperAdmin()
    expect(prisma.user.create).not.toHaveBeenCalled()
  })
})
