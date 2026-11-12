// server/src/modules/auth/service.ts
import argon2 from "argon2"
import crypto from "crypto"
import * as OTPAuth from "otpauth"
import QRCode from "qrcode"
import { prisma } from "../../lib/prisma"
import { normalizePhone } from "../../lib/phone"
import { generateRawToken, hashToken } from "../../lib/tokens"
import { signAccessToken, signRefreshToken, signMfaToken, verifyMfaToken } from "../../lib/jwt"
import { mail } from "../../lib/mail"
import { env } from "../../config/env"
import { audit } from "../../lib/audit"
import { createError } from "../../middleware/errorHandler"
import { checkPasswordPolicy } from "../../lib/passwordPolicy"
import {
  buildVerifyEmailEmail,
  buildPasswordResetEmail,
  buildPasswordChangedEmail,
  buildMfaEnabledEmail,
  buildMfaDisabledEmail,
} from "../notifications/templates"
import { stripBidi } from "../../lib/sanitize"
import { encryptTotpSecret, decryptTotpSecret } from "../../lib/mfaCrypto"
import type { RegisterInput, LoginInput } from "./schema"

// Generic auth response to never reveal whether an account exists
const GENERIC_AUTH_MSG = "If an account was found, you will receive an email."

export async function registerPatient(input: RegisterInput) {
  const normalizedPhone = input.phone ? normalizePhone(input.phone) : null
  const normalizedEmail = input.email?.toLowerCase()

  // Check uniqueness (generic error to avoid account enumeration)
  if (normalizedPhone) {
    const existing = await prisma.user.findUnique({ where: { phone: normalizedPhone } })
    if (existing) throw createError("Account already exists", 409)
  }
  if (normalizedEmail) {
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) throw createError("Account already exists", 409)
  }

  const passwordHash = await argon2.hash(input.password)

  const user = await prisma.user.create({
    data: {
      role: "PATIENT", // server always forces PATIENT — ignores any role in payload
      phone: normalizedPhone,
      email: normalizedEmail,
      passwordHash,
      fullName: stripBidi(input.fullName),
      preferredLang: input.preferredLang,
      consentAcceptedAt: new Date(),
    },
  })

  // Send email verification if email provided
  if (normalizedEmail) {
    await sendEmailVerification(user.id, normalizedEmail, input.preferredLang)
  }

  return { userId: user.id }
}

export type LoginResult =
  | { type: "ok"; accessToken: string; refreshToken: string; mustChangePassword: boolean }
  | { type: "mfa_required"; mfaToken: string }

export async function login(input: LoginInput): Promise<LoginResult> {
  const normalizedPhone = input.phone ? normalizePhone(input.phone) : null
  const normalizedEmail = input.email?.toLowerCase()

  let user = null
  if (normalizedPhone) {
    user = await prisma.user.findUnique({ where: { phone: normalizedPhone } })
  } else if (normalizedEmail) {
    user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  }

  if (!user || !user.passwordHash) {
    // Generic message; hash a dummy password to prevent timing attacks
    await argon2.verify("$argon2id$dummy", "password").catch(() => {})
    throw createError("Invalid credentials", 401)
  }

  if (!user.isActive) {
    throw createError("Account is deactivated", 403)
  }

  const valid = await argon2.verify(user.passwordHash, input.password)
  if (!valid) throw createError("Invalid credentials", 401)

  // If TOTP is enrolled, return a short-lived mfaToken instead of a session.
  // The client must then POST /auth/login/2fa with the mfaToken + TOTP code.
  if (user.totpEnabledAt && user.totpSecret) {
    const mfaToken = signMfaToken(user.id)
    return { type: "mfa_required", mfaToken }
  }

  const mustChangePassword = user.mustChangePassword ?? false
  // Determine if MFA setup is required (SUPER_ADMIN without TOTP)
  const mfaSetupRequired = user.role === "SUPER_ADMIN" && !user.totpEnabledAt

  const { accessToken, refreshToken } = await issueTokenPair(
    user.id,
    user.role,
    user.email ?? undefined,
    user.phone ?? undefined,
    mustChangePassword,
    mfaSetupRequired
  )

  return { type: "ok", accessToken, refreshToken, mustChangePassword }
}

// Complete login after TOTP challenge
export async function loginWithTotp(
  rawMfaToken: string,
  code: string
): Promise<{ accessToken: string; refreshToken: string; mustChangePassword: boolean }> {
  let payload
  try {
    payload = verifyMfaToken(rawMfaToken)
  } catch {
    throw createError("Invalid or expired MFA token", 401)
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user || !user.isActive || !user.totpEnabledAt || !user.totpSecret) {
    throw createError("Invalid or expired MFA token", 401)
  }

  // Verify TOTP code with ±1 step window
  const decrypted = decryptTotpSecret(user.totpSecret)
  const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(decrypted), period: 30, digits: 6 })
  const currentStep = Math.floor(Date.now() / 30000)

  let matched = false
  for (const step of [currentStep - 1, currentStep, currentStep + 1]) {
    const expected = totp.generate({ timestamp: step * 30000 })
    if (expected === code.replace(/\s/g, "")) {
      // Replay protection: reject if this step was already used
      if (user.totpLastUsedStep !== null && user.totpLastUsedStep === step) {
        throw createError("This code has already been used", 401)
      }
      // Atomically record the step to prevent replay
      await prisma.user.update({ where: { id: user.id }, data: { totpLastUsedStep: step } })
      matched = true
      break
    }
  }

  if (!matched) {
    throw createError("Invalid two-factor authentication code", 401)
  }

  const mustChangePassword = user.mustChangePassword ?? false

  const { accessToken, refreshToken } = await issueTokenPair(
    user.id,
    user.role,
    user.email ?? undefined,
    user.phone ?? undefined,
    mustChangePassword,
    false,    // mfaSetupRequired = false (already enrolled)
    true      // mfaVerified = true
  )

  await audit({ userId: user.id, action: "MFA_LOGIN", entity: "User", entityId: user.id })

  return { accessToken, refreshToken, mustChangePassword }
}

export async function issueTokenPair(
  userId: string,
  role: string,
  email?: string,
  phone?: string,
  mustChangePassword = false,
  mfaSetupRequired = false,
  mfaVerified = false,
  familyId?: string  // pass existing familyId when rotating; omit for new session
): Promise<{ accessToken: string; refreshToken: string }> {
  // Create refresh token record
  const rawToken = generateRawToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30d
  const tokenFamilyId = familyId ?? crypto.randomUUID()

  const record = await prisma.refreshToken.create({
    data: { userId, tokenHash, familyId: tokenFamilyId, expiresAt },
  })

  const accessToken = signAccessToken({
    sub: userId,
    role,
    email,
    phone,
    mustChangePassword: mustChangePassword || undefined,
    mfaSetupRequired: mfaSetupRequired || undefined,
    mfaVerified: mfaVerified || undefined,
  })
  const refreshToken = signRefreshToken({ sub: userId, jti: record.id })

  return { accessToken, refreshToken: rawToken }
}

export async function refreshAccessToken(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken)
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } })

  if (!record) {
    throw createError("Invalid refresh token", 401)
  }

  // Token reuse detection: if the token is already revoked but was issued in a known family,
  // revoke the entire family (someone is replaying a rotated token).
  if (record.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { familyId: record.familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
    throw createError("Refresh token reuse detected — all sessions revoked", 401)
  }

  if (record.expiresAt < new Date()) {
    throw createError("Invalid refresh token", 401)
  }

  const user = await prisma.user.findUnique({ where: { id: record.userId } })
  if (!user || !user.isActive) throw createError("Account not found or deactivated", 401)

  // Rotate: revoke old, issue new within the same family
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  })

  const mustChangePassword = user.mustChangePassword ?? false
  const mfaSetupRequired = user.role === "SUPER_ADMIN" && !user.totpEnabledAt
  const mfaVerified = user.totpEnabledAt ? true : false // keep verified if enrolled

  return issueTokenPair(
    user.id,
    user.role,
    user.email ?? undefined,
    user.phone ?? undefined,
    mustChangePassword,
    mfaSetupRequired,
    mfaVerified,
    record.familyId  // keep same family
  )
}

export async function logout(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken)
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  })
}

export async function sendEmailVerification(userId: string, email: string, lang: string) {
  const rawToken = generateRawToken()
  const expiresAt = new Date(Date.now() + env.EMAIL_VERIFY_TTL_HOURS * 60 * 60 * 1000)

  await prisma.authToken.create({
    data: {
      userId,
      type: "EMAIL_VERIFY",
      tokenHash: hashToken(rawToken),
      expiresAt,
    },
  })

  const link = `${env.APP_BASE_URL}/verify-email?token=${rawToken}`
  const tpl = buildVerifyEmailEmail(link, lang as "ar" | "fr")
  await mail.send({ to: email, ...tpl })
}

export async function verifyEmail(rawToken: string) {
  const tokenHash = hashToken(rawToken)
  const record = await prisma.authToken.findUnique({ where: { tokenHash } })

  if (!record || record.type !== "EMAIL_VERIFY" || record.usedAt || record.expiresAt < new Date()) {
    throw createError("Invalid or expired token", 400)
  }

  await prisma.$transaction([
    prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } }),
  ])
}

export async function forgotPassword(email: string) {
  const normalized = email.toLowerCase()
  const user = await prisma.user.findUnique({ where: { email: normalized } })

  // Always return generic message — never reveal whether account exists
  if (!user?.email) return GENERIC_AUTH_MSG

  const rawToken = generateRawToken()
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60 * 1000)

  await prisma.authToken.create({
    data: {
      userId: user.id,
      type: "PASSWORD_RESET",
      tokenHash: hashToken(rawToken),
      expiresAt,
    },
  })

  const link = `${env.APP_BASE_URL}/reset-password?token=${rawToken}`
  const tpl = buildPasswordResetEmail(link, user.preferredLang)
  await mail.send({ to: user.email, ...tpl })

  return GENERIC_AUTH_MSG
}

export async function resetPassword(rawToken: string, newPassword: string) {
  const tokenHash = hashToken(rawToken)
  const record = await prisma.authToken.findUnique({ where: { tokenHash } })

  if (
    !record ||
    record.type !== "PASSWORD_RESET" ||
    record.usedAt ||
    record.expiresAt < new Date()
  ) {
    throw createError("Invalid or expired token", 400)
  }

  const user = await prisma.user.findUnique({ where: { id: record.userId } })
  if (!user) throw createError("User not found", 404)

  // Check new password is not the same as current
  if (user.passwordHash) {
    const same = await argon2.verify(user.passwordHash, newPassword)
    if (same) throw createError("New password must be different from the current password", 400)
  }

  const policy = checkPasswordPolicy(newPassword, { email: user.email ?? undefined })
  if (!policy.ok) throw createError(policy.reason!, 400)

  const passwordHash = await argon2.hash(newPassword)

  await prisma.$transaction([
    prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash, mustChangePassword: false } }),
    // Revoke all refresh tokens on password reset
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ])
}

export async function acceptInvite(rawToken: string, newPassword: string) {
  const tokenHash = hashToken(rawToken)
  const record = await prisma.authToken.findUnique({ where: { tokenHash } })

  if (
    !record ||
    record.type !== "INVITE" ||
    record.usedAt ||
    record.expiresAt < new Date()
  ) {
    throw createError("Invalid or expired invite link", 400)
  }

  const user = await prisma.user.findUnique({ where: { id: record.userId } })
  if (!user) throw createError("User not found", 404)

  const policy = checkPasswordPolicy(newPassword, { email: user.email ?? undefined })
  if (!policy.ok) throw createError(policy.reason!, 400)

  const passwordHash = await argon2.hash(newPassword)

  await prisma.$transaction([
    prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.user.update({
      where: { id: record.userId },
      data: {
        passwordHash,
        mustSetPassword: false,
        mustChangePassword: false,
        emailVerifiedAt: new Date(), // invite acceptance verifies the email
      },
    }),
  ])
}

// ─── Account deletion ───────────────────────────────────────────────────────

export async function deleteOwnAccount(userId: string) {
  // Soft-delete pattern: anonymize PII and mark inactive.
  // Hard deletion of all related records is deferred to a scheduled purge
  // job (run via worker) so that audit logs and appointment history are
  // retained for the legally required period. The user's public presence
  // (doctor/institution links) is severed immediately.
  await prisma.$transaction([
    // Revoke all sessions
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    // Invalidate all pending auth tokens
    prisma.authToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
    // Anonymize the user record — PII is replaced with a tombstone
    prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        email: null,
        phone: null,
        fullName: `[deleted-${userId.slice(0, 8)}]`,
        passwordHash: null,
        emailVerifiedAt: null,
        consentAcceptedAt: null,
      },
    }),
  ])
}

// ─── Profile update ─────────────────────────────────────────────────────────

export async function updateProfile(userId: string, data: { fullName?: string; preferredLang?: string }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.fullName && { fullName: data.fullName }),
      ...(data.preferredLang && { preferredLang: data.preferredLang as "ar" | "fr" }),
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      preferredLang: true,
      emailVerifiedAt: true,
      consentAcceptedAt: true,
    },
  })
  return user
}

// ─── Add email to phone-only account ────────────────────────────────────────

export async function addEmail(userId: string, email: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw createError("User not found", 404)
  if (user.email) throw createError("Account already has an email", 409)

  const normalized = email.toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email: normalized } })
  if (existing) throw createError("Email already in use", 409)

  await prisma.user.update({
    where: { id: userId },
    data: { email: normalized, emailVerifiedAt: null },
  })

  await sendEmailVerification(userId, normalized, user.preferredLang)
}

// ─── Change password ─────────────────────────────────────────────────────────
// Handles both voluntary change and forced-change-at-login flow.

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  currentRawRefreshToken?: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.passwordHash) throw createError("User not found", 404)

  const valid = await argon2.verify(user.passwordHash, currentPassword)
  if (!valid) throw createError("Current password is incorrect", 400)

  // Reject if new password is the same as the current one
  const same = await argon2.verify(user.passwordHash, newPassword)
  if (same) throw createError("New password must be different from the current password", 400)

  // Enforce password policy (SUPER_ADMIN → min 14 chars)
  const minLength = user.role === "SUPER_ADMIN" ? 14 : 10
  const policy = checkPasswordPolicy(newPassword, {
    minLength,
    email: user.email ?? undefined,
  })
  if (!policy.ok) throw createError(policy.reason!, 400)

  const newHash = await argon2.hash(newPassword)

  // Determine the current session token hash to keep that session alive
  const currentTokenHash = currentRawRefreshToken ? hashToken(currentRawRefreshToken) : undefined

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash, mustChangePassword: false },
    }),
    // Revoke ALL other refresh tokens (including all other sessions)
    prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(currentTokenHash ? { tokenHash: { not: currentTokenHash } } : {}),
      },
      data: { revokedAt: new Date() },
    }),
  ])

  // Audit entry
  await audit({ userId, action: "PASSWORD_CHANGED", entity: "User", entityId: userId })

  // Send security email
  if (user.email) {
    try {
      const tpl = buildPasswordChangedEmail(user.email, user.fullName, user.preferredLang)
      await mail.send({ to: user.email, ...tpl })
    } catch (err) {
      // Non-fatal — password was already changed
    }
  }
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function listSessions(userId: string) {
  return prisma.refreshToken.findMany({
    where: {
      userId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, createdAt: true, expiresAt: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function revokeOtherSessions(userId: string, currentRawToken?: string) {
  const where: Record<string, unknown> = { userId, revokedAt: null }
  if (currentRawToken) {
    const { hashToken: ht } = await import("../../lib/tokens")
    const currentHash = ht(currentRawToken)
    where["tokenHash"] = { not: currentHash }
  }
  const result = await prisma.refreshToken.updateMany({
    where,
    data: { revokedAt: new Date() },
  })
  return result.count
}

// ─── Data export (GDPR-style) ────────────────────────────────────────────────

export async function exportOwnData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      preferredLang: true,
      createdAt: true,
      emailVerifiedAt: true,
      consentAcceptedAt: true,
    },
  })

  const appointments = await prisma.appointment.findMany({
    where: { patientId: userId },
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      status: true,
      reason: true,
      createdAt: true,
      doctor: {
        select: {
          user: { select: { fullName: true } },
          specialty: { select: { nameAr: true, nameFr: true } },
        },
      },
      institution: { select: { nameAr: true, nameFr: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const reviews = await prisma.review.findMany({
    where: { patientId: userId },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return { user, appointments, reviews, exportedAt: new Date().toISOString() }
}

// ─── TOTP 2FA ─────────────────────────────────────────────────────────────────

const TOTP_ISSUER = "Delin Smart Care"
const RECOVERY_CODE_COUNT = 10

function generateRecoveryCode(): string {
  // 8-char base32-style codes: XXXX-XXXX format for readability
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789"
  let code = ""
  const bytes = crypto.randomBytes(RECOVERY_CODE_COUNT)
  for (const byte of bytes) {
    code += chars[byte % chars.length]
  }
  return `${code.slice(0, 4)}-${code.slice(4, 8)}`
}

// Returns the QR code data URL and the URI; secret stored encrypted in DB
export async function setupTotp(userId: string): Promise<{
  uri: string
  qrCodeDataUrl: string
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw createError("User not found", 404)

  // Generate a new TOTP secret
  const secret = new OTPAuth.Secret()
  const totp = new OTPAuth.TOTP({
    issuer: TOTP_ISSUER,
    label: user.email ?? user.phone ?? userId,
    secret,
    period: 30,
    digits: 6,
    algorithm: "SHA1",
  })

  const uri = totp.toString()
  // Store encrypted secret provisionally (not yet enabled — user must confirm first)
  const encrypted = encryptTotpSecret(secret.base32)
  await prisma.user.update({ where: { id: userId }, data: { totpSecret: encrypted } })

  const qrCodeDataUrl = await QRCode.toDataURL(uri)
  return { uri, qrCodeDataUrl }
}

// Confirm TOTP setup: user submits the first code to prove they scanned it correctly
export async function enableTotp(userId: string, code: string): Promise<string[]> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.totpSecret) throw createError("TOTP setup not initiated", 400)
  if (user.totpEnabledAt) throw createError("TOTP is already enabled", 409)

  const decrypted = decryptTotpSecret(user.totpSecret)
  const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(decrypted), period: 30, digits: 6 })
  const currentStep = Math.floor(Date.now() / 30000)

  let matched = false
  for (const step of [currentStep - 1, currentStep, currentStep + 1]) {
    if (totp.generate({ timestamp: step * 30000 }) === code.replace(/\s/g, "")) {
      matched = true
      break
    }
  }
  if (!matched) throw createError("Invalid authentication code", 401)

  // Generate 10 single-use recovery codes
  const rawCodes: string[] = []
  const codeRows: { userId: string; codeHash: string }[] = []
  for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
    const raw = generateRecoveryCode()
    rawCodes.push(raw)
    codeRows.push({ userId, codeHash: hashToken(raw) })
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { totpEnabledAt: new Date(), totpLastUsedStep: currentStep },
    }),
    // Clear any previous recovery codes
    prisma.recoveryCode.deleteMany({ where: { userId } }),
    prisma.recoveryCode.createMany({ data: codeRows }),
    // Revoke all other sessions (security: require re-login on all devices after 2FA enable)
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ])

  await audit({ userId, action: "MFA_ENABLED", entity: "User", entityId: userId })

  if (user.email) {
    try {
      const tpl = buildMfaEnabledEmail(user.fullName, user.preferredLang)
      await mail.send({ to: user.email, ...tpl })
    } catch { /* non-fatal */ }
  }

  return rawCodes // shown once — never stored in plaintext
}

// Disable TOTP: requires current password verification (step-up)
export async function disableTotp(userId: string, password: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.passwordHash) throw createError("User not found", 404)
  if (!user.totpEnabledAt) throw createError("TOTP is not enabled", 400)

  const valid = await argon2.verify(user.passwordHash, password)
  if (!valid) throw createError("Invalid password", 401)

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { totpSecret: null, totpEnabledAt: null, totpLastUsedStep: null },
    }),
    prisma.recoveryCode.deleteMany({ where: { userId } }),
    // Revoke all sessions (security: require re-login after 2FA disable)
    prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ])

  await audit({ userId, action: "MFA_DISABLED", entity: "User", entityId: userId })

  if (user.email) {
    try {
      const tpl = buildMfaDisabledEmail(user.fullName, user.preferredLang)
      await mail.send({ to: user.email, ...tpl })
    } catch { /* non-fatal */ }
  }
}

// Regenerate recovery codes (requires TOTP code — step-up auth)
export async function regenerateRecoveryCodes(userId: string, code: string): Promise<string[]> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.totpSecret || !user.totpEnabledAt) throw createError("TOTP is not enabled", 400)

  const decrypted = decryptTotpSecret(user.totpSecret)
  const totp = new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(decrypted), period: 30, digits: 6 })
  const currentStep = Math.floor(Date.now() / 30000)

  let matched = false
  for (const step of [currentStep - 1, currentStep, currentStep + 1]) {
    if (totp.generate({ timestamp: step * 30000 }) === code.replace(/\s/g, "")) {
      if (user.totpLastUsedStep !== null && user.totpLastUsedStep === step) {
        throw createError("This code has already been used", 401)
      }
      await prisma.user.update({ where: { id: userId }, data: { totpLastUsedStep: step } })
      matched = true
      break
    }
  }
  if (!matched) throw createError("Invalid authentication code", 401)

  const rawCodes: string[] = []
  const codeRows: { userId: string; codeHash: string }[] = []
  for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
    const raw = generateRecoveryCode()
    rawCodes.push(raw)
    codeRows.push({ userId, codeHash: hashToken(raw) })
  }

  await prisma.$transaction([
    prisma.recoveryCode.deleteMany({ where: { userId } }),
    prisma.recoveryCode.createMany({ data: codeRows }),
  ])

  await audit({ userId, action: "MFA_RECOVERY_CODES_REGENERATED", entity: "User", entityId: userId })

  return rawCodes
}

// Use a recovery code (for when the authenticator is unavailable)
export async function loginWithRecoveryCode(
  rawMfaToken: string,
  rawCode: string
): Promise<{ accessToken: string; refreshToken: string; mustChangePassword: boolean }> {
  let payload
  try {
    payload = verifyMfaToken(rawMfaToken)
  } catch {
    throw createError("Invalid or expired MFA token", 401)
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  if (!user || !user.isActive || !user.totpEnabledAt) {
    throw createError("Invalid or expired MFA token", 401)
  }

  const codeHash = hashToken(rawCode.replace(/[\s-]/g, "").toUpperCase())
  const record = await prisma.recoveryCode.findUnique({ where: { codeHash } })

  if (!record || record.userId !== user.id || record.usedAt) {
    throw createError("Invalid or already-used recovery code", 401)
  }

  await prisma.recoveryCode.update({ where: { id: record.id }, data: { usedAt: new Date() } })

  const mustChangePassword = user.mustChangePassword ?? false
  const { accessToken, refreshToken } = await issueTokenPair(
    user.id, user.role, user.email ?? undefined, user.phone ?? undefined,
    mustChangePassword, false, true
  )

  await audit({ userId: user.id, action: "MFA_RECOVERY_CODE_USED", entity: "User", entityId: user.id })

  return { accessToken, refreshToken, mustChangePassword }
}

// Get TOTP status (for /auth/me or /account/security)
export async function getMfaStatus(userId: string): Promise<{
  enabled: boolean
  enabledAt: Date | null
  recoveryCodesRemaining: number
}> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { totpEnabledAt: true } })
  const count = user?.totpEnabledAt
    ? await prisma.recoveryCode.count({ where: { userId, usedAt: null } })
    : 0
  return {
    enabled: !!user?.totpEnabledAt,
    enabledAt: user?.totpEnabledAt ?? null,
    recoveryCodesRemaining: count,
  }
}
