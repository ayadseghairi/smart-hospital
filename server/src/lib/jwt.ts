// server/src/lib/jwt.ts
import jwt from "jsonwebtoken"
import { env } from "../config/env"

export interface AccessTokenPayload {
  sub: string        // userId
  role: string
  email?: string
  phone?: string
  /** True when the user must change their password before accessing any other endpoint */
  mustChangePassword?: boolean
  /** True when a SUPER_ADMIN has not yet enrolled TOTP */
  mfaSetupRequired?: boolean
  /** True when TOTP challenge was successfully passed (for roles that need it) */
  mfaVerified?: boolean
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    issuer: "delin-smart-care",
    audience: "delin-api",
  })
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "delin-smart-care",
    audience: "delin-api",
  }) as AccessTokenPayload
}

export interface RefreshTokenPayload {
  sub: string   // userId
  jti: string   // token DB id for revocation
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    issuer: "delin-smart-care",
    audience: "delin-refresh",
  })
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: "delin-smart-care",
    audience: "delin-refresh",
  }) as RefreshTokenPayload
}

// Short-lived MFA challenge token (5 minutes) — proves password was correct,
// but does NOT grant access until the TOTP code is submitted.
export interface MfaTokenPayload {
  sub: string    // userId
  purpose: "mfa-challenge"
}

export function signMfaToken(userId: string): string {
  return jwt.sign(
    { sub: userId, purpose: "mfa-challenge" } satisfies MfaTokenPayload,
    env.JWT_ACCESS_SECRET,
    { expiresIn: "5m", issuer: "delin-smart-care", audience: "delin-mfa" }
  )
}

export function verifyMfaToken(token: string): MfaTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "delin-smart-care",
    audience: "delin-mfa",
  }) as MfaTokenPayload
}

// Step-up re-authentication token (10 minutes) — issued after password re-entry,
// required on the X-Step-Up-Token header for sensitive admin actions.
export interface StepUpTokenPayload {
  sub: string
  purpose: "step-up"
}

export function signStepUpToken(userId: string): string {
  return jwt.sign(
    { sub: userId, purpose: "step-up" } satisfies StepUpTokenPayload,
    env.JWT_ACCESS_SECRET,
    { expiresIn: "10m", issuer: "delin-smart-care", audience: "delin-step-up" }
  )
}

export function verifyStepUpToken(token: string): StepUpTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "delin-smart-care",
    audience: "delin-step-up",
  }) as StepUpTokenPayload
}
