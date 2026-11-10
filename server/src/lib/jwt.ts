// server/src/lib/jwt.ts
import jwt from "jsonwebtoken"
import { env } from "../config/env"

export interface AccessTokenPayload {
  sub: string        // userId
  role: string
  email?: string
  phone?: string
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
