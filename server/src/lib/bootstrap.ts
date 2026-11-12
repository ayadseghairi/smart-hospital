// server/src/lib/bootstrap.ts
// Idempotent SUPER_ADMIN bootstrap.
// Creates the first super admin from env vars at server start and on demand.
// NEVER logs the initial password; writes audit entry SUPER_ADMIN_BOOTSTRAPPED.
import argon2 from "argon2"
import { prisma } from "./prisma"
import { logger } from "./logger"
import { audit } from "./audit"
import { env } from "../config/env"
import { checkBootstrapPassword } from "./passwordPolicy"
import { generateRawToken, hashToken } from "./tokens"
import { sendInvite } from "../modules/admin/service"
import { mail } from "./mail"
import { buildAdminAccountReadyEmail } from "../modules/notifications/templates"

export async function bootstrapSuperAdmin(): Promise<void> {
  // Idempotency: do nothing if any SUPER_ADMIN already exists
  const existing = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } })
  if (existing) {
    logger.debug("bootstrapSuperAdmin: a SUPER_ADMIN already exists, skipping")
    return
  }

  const email = env.SUPER_ADMIN_EMAIL?.toLowerCase()
  const fullName = env.SUPER_ADMIN_FULL_NAME
  const initialPassword = env.SUPER_ADMIN_INITIAL_PASSWORD

  if (!email || !fullName) {
    logger.debug("bootstrapSuperAdmin: SUPER_ADMIN_EMAIL or SUPER_ADMIN_FULL_NAME not set, skipping")
    return
  }

  // ── Path A: initial password provided ──────────────────────────────────────
  if (initialPassword) {
    const policy = checkBootstrapPassword(initialPassword, email)
    if (!policy.ok) {
      // Never echo the password in the log message
      logger.error(
        { reason: policy.reason },
        "bootstrapSuperAdmin: SUPER_ADMIN_INITIAL_PASSWORD is too weak — " +
          policy.reason + ". Server will not create the account with this password."
      )
      return
    }

    const passwordHash = await argon2.hash(initialPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    })

    const user = await prisma.user.create({
      data: {
        role: "SUPER_ADMIN",
        email,
        fullName,
        preferredLang: "ar",
        isActive: true,
        emailVerifiedAt: new Date(), // owner declared this address
        passwordHash,
        mustSetPassword: false,
        mustChangePassword: true, // FORCED CHANGE at first login
      },
    })

    // Audit: no secret fields
    await audit({ userId: user.id, action: "SUPER_ADMIN_BOOTSTRAPPED", entity: "User", entityId: user.id })

    // Warn — never log the password value
    logger.warn(
      "⚠️   SUPER_ADMIN bootstrapped with a temporary password. " +
        "Remove SUPER_ADMIN_INITIAL_PASSWORD from .env after the first login."
    )

    // Send "account ready" email (no password inside — only login link + security notes)
    try {
      const tpl = buildAdminAccountReadyEmail(`${env.APP_BASE_URL}/login`, fullName, "ar")
      await mail.send({ to: email, ...tpl })
    } catch (err) {
      logger.error({ err }, "bootstrapSuperAdmin: failed to send account-ready email (non-fatal)")
    }

    logger.info({ email }, "✓ SUPER_ADMIN account created")
    return
  }

  // ── Path B: no initial password → send invite link ──────────────────────────
  const user = await prisma.user.create({
    data: {
      role: "SUPER_ADMIN",
      email,
      fullName,
      preferredLang: "ar",
      isActive: true,
      mustSetPassword: true,
      mustChangePassword: false,
    },
  })

  await audit({ userId: user.id, action: "SUPER_ADMIN_BOOTSTRAPPED", entity: "User", entityId: user.id })

  try {
    await sendInvite(user.id)
    logger.info({ email }, "✓ SUPER_ADMIN invite email sent")
  } catch (err) {
    logger.error({ err }, "bootstrapSuperAdmin: failed to send invite email")
  }
}
