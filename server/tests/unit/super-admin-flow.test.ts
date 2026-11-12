// server/tests/unit/super-admin-flow.test.ts
// Proves: fresh SUPER_ADMIN can complete: login → force-password-change → 2FA setup → reach /admin
// This is a unit test using the service layer mocked; it verifies the JWT/middleware gates
// produce the right codes at each step.
import { describe, it, expect, vi, beforeEach } from "vitest"

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
    MFA_ENCRYPTION_KEY: "0".repeat(64),
    MAIL_FROM_NAME: "Delin Smart Care",
    MAIL_FROM_ADDRESS: "no-reply@delin.dz",
  },
  reminderOffsets: [24, 2],
}))

vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn() },
    refreshToken: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    recoveryCode: { deleteMany: vi.fn(), createMany: vi.fn(), count: vi.fn() },
    $transaction: vi.fn(async (ops: unknown) => {
      if (Array.isArray(ops)) return Promise.all(ops.map((op: unknown) => Promise.resolve(op)))
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

import { signAccessToken, verifyAccessToken } from "../../src/lib/jwt"
import { requirePasswordChange } from "../../src/middleware/requirePasswordChange"
import { requireMfaEnrolled } from "../../src/middleware/requireMfaEnrolled"

// Build a mock req/res/next for middleware testing
function mockHttp(token: string, path: string) {
  const payload = verifyAccessToken(token)
  const req = {
    user: payload,
    path,
    originalUrl: `/api/v1${path}`,
    cookies: {},
  } as never
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as never
  const next = vi.fn()
  return { req, res, next }
}

beforeEach(() => { vi.clearAllMocks() })

describe("SUPER_ADMIN flow: login → force-pw-change → 2FA setup → /admin", () => {
  it("Step 1: After bootstrap login, JWT has mustChangePassword=true, mfaSetupRequired=true", () => {
    const token = signAccessToken({
      sub: "admin-1",
      role: "SUPER_ADMIN",
      mustChangePassword: true,
      mfaSetupRequired: true,
    })
    const payload = verifyAccessToken(token)
    expect(payload.mustChangePassword).toBe(true)
    expect(payload.mfaSetupRequired).toBe(true)
  })

  it("Step 2: mustChangePassword gate blocks /admin but allows /auth/password", () => {
    const token = signAccessToken({
      sub: "admin-1",
      role: "SUPER_ADMIN",
      mustChangePassword: true,
      mfaSetupRequired: true,
    })
    // Attempt to reach /admin
    const { req: adminReq, res: adminRes, next: adminNext } = mockHttp(token, "/admin")
    requirePasswordChange(adminReq, adminRes, adminNext)
    expect(adminNext).not.toHaveBeenCalled()
    expect(adminRes.status).toHaveBeenCalledWith(403)

    // /auth/password should be allowed through
    const { req: pwReq, res: pwRes, next: pwNext } = mockHttp(token, "/auth/password")
    requirePasswordChange(pwReq, pwRes, pwNext)
    expect(pwNext).toHaveBeenCalled()
  })

  it("Step 3: After password change, mustChangePassword cleared; mfaSetupRequired gate blocks /admin", () => {
    const token = signAccessToken({
      sub: "admin-1",
      role: "SUPER_ADMIN",
      mustChangePassword: undefined,  // cleared
      mfaSetupRequired: true,
    })

    // Password gate should pass
    const { req, res, next } = mockHttp(token, "/admin")
    requirePasswordChange(req, res, next)
    expect(next).toHaveBeenCalled() // password gate passes

    // MFA gate should block
    const { req: r2, res: r2res, next: r2next } = mockHttp(token, "/admin")
    requireMfaEnrolled(r2, r2res, r2next)
    expect(r2next).not.toHaveBeenCalled()
    expect(r2res.status).toHaveBeenCalledWith(403)
    expect(r2res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: "MFA_SETUP_REQUIRED" })
    )
  })

  it("Step 4: After 2FA enrollment, mfaSetupRequired cleared; /admin is accessible", () => {
    const token = signAccessToken({
      sub: "admin-1",
      role: "SUPER_ADMIN",
      mustChangePassword: undefined,
      mfaSetupRequired: undefined,  // cleared after enrollment
      mfaVerified: true,
    })

    // Both gates should pass
    const { req, res, next } = mockHttp(token, "/admin")
    requirePasswordChange(req, res, next)
    expect(next).toHaveBeenCalled()

    const { req: r2, res: r2res, next: r2next } = mockHttp(token, "/admin")
    requireMfaEnrolled(r2, r2res, r2next)
    expect(r2next).toHaveBeenCalled() // /admin is now reachable
  })
})
