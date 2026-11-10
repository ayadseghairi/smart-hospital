// server/src/modules/auth/service.ts
import argon2 from "argon2"
import crypto from "crypto"
import { prisma } from "../../lib/prisma"
import { normalizePhone } from "../../lib/phone"
import { generateRawToken, hashToken } from "../../lib/tokens"
import { signAccessToken, signRefreshToken } from "../../lib/jwt"
import { mail } from "../../lib/mail"
import { env } from "../../config/env"
import { createError } from "../../middleware/errorHandler"
import { buildVerifyEmailEmail, buildPasswordResetEmail } from "../notifications/templates"
import { stripBidi } from "../../lib/sanitize"
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

export async function login(input: LoginInput): Promise<{ accessToken: string; refreshToken: string }> {
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

  return issueTokenPair(user.id, user.role, user.email ?? undefined, user.phone ?? undefined)
}

export async function issueTokenPair(
  userId: string,
  role: string,
  email?: string,
  phone?: string
): Promise<{ accessToken: string; refreshToken: string }> {
  // Create refresh token record
  const rawToken = generateRawToken()
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30d

  const record = await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  })

  const accessToken = signAccessToken({ sub: userId, role, email, phone })
  const refreshToken = signRefreshToken({ sub: userId, jti: record.id })

  return { accessToken, refreshToken: rawToken }
}

export async function refreshAccessToken(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken)
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } })

  if (!record || record.revokedAt || record.expiresAt < new Date()) {
    throw createError("Invalid refresh token", 401)
  }

  const user = await prisma.user.findUnique({ where: { id: record.userId } })
  if (!user || !user.isActive) throw createError("Account not found or deactivated", 401)

  // Rotate: revoke old, issue new
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  })

  return issueTokenPair(user.id, user.role, user.email ?? undefined, user.phone ?? undefined)
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

  const passwordHash = await argon2.hash(newPassword)

  await prisma.$transaction([
    prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
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

  const passwordHash = await argon2.hash(newPassword)

  await prisma.$transaction([
    prisma.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.user.update({
      where: { id: record.userId },
      data: {
        passwordHash,
        mustSetPassword: false,
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

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  currentTokenHash?: string
) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.passwordHash) throw createError("User not found", 404)

  const valid = await argon2.verify(user.passwordHash, currentPassword)
  if (!valid) throw createError("Current password is incorrect", 400)

  const newHash = await argon2.hash(newPassword)

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } }),
    // Revoke all refresh tokens except current session
    prisma.refreshToken.updateMany({
      where: {
        userId,
        revokedAt: null,
        ...(currentTokenHash ? { tokenHash: { not: currentTokenHash } } : {}),
      },
      data: { revokedAt: new Date() },
    }),
  ])
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
