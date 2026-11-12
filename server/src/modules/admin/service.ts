// server/src/modules/admin/service.ts
import argon2 from "argon2"
import { prisma } from "../../lib/prisma"
import { generateRawToken, hashToken } from "../../lib/tokens"
import { mail } from "../../lib/mail"
import { env } from "../../config/env"
import { createError } from "../../middleware/errorHandler"
import { buildInviteEmail } from "../notifications/templates"

/**
 * Send (or resend) an invite link to a user.
 * Admin never chooses or sees the password.
 */
export async function sendInvite(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw createError("User not found", 404)
  if (!user.email) throw createError("User has no email address", 400)

  // Invalidate any existing unused INVITE tokens
  await prisma.authToken.updateMany({
    where: { userId, type: "INVITE", usedAt: null },
    data: { usedAt: new Date() }, // mark as used = expired
  })

  const rawToken = generateRawToken()
  const expiresAt = new Date(Date.now() + env.INVITE_TTL_HOURS * 60 * 60 * 1000)

  await prisma.authToken.create({
    data: {
      userId,
      type: "INVITE",
      tokenHash: hashToken(rawToken),
      expiresAt,
    },
  })

  const link = `${env.APP_BASE_URL}/accept-invite?token=${rawToken}`
  const tpl = buildInviteEmail(link, user.fullName, user.preferredLang)
  await mail.send({ to: user.email, ...tpl })
}

interface CreateInstAdminInput {
  fullName: string
  email: string
  preferredLang: "ar" | "fr"
}

export async function createInstitutionAdminAccount(
  createdById: string,
  institutionId: string,
  input: CreateInstAdminInput
) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } })
  if (existing) throw createError("An account with this email already exists", 409)

  const user = await prisma.user.create({
    data: {
      role: "INSTITUTION_ADMIN",
      email: input.email.toLowerCase(),
      fullName: input.fullName,
      preferredLang: input.preferredLang,
      mustSetPassword: true,
      createdById,
    },
  })

  await prisma.institutionAdmin.create({
    data: { userId: user.id, institutionId },
  })

  await sendInvite(user.id)

  return { userId: user.id }
}

interface CreateDoctorInput {
  fullName: string
  email: string
  preferredLang: "ar" | "fr"
  specialtyId: string
  institutionIds: string[] // may be empty for independent/private doctors
  consultationFeeDZD?: number
  licenseNumber?: string
}

export async function createDoctorAccount(createdById: string, input: CreateDoctorInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } })
  if (existing) throw createError("An account with this email already exists", 409)

  const user = await prisma.user.create({
    data: {
      role: "DOCTOR",
      email: input.email.toLowerCase(),
      fullName: input.fullName,
      preferredLang: input.preferredLang,
      mustSetPassword: true,
      createdById,
    },
  })

  const doctor = await prisma.doctor.create({
    data: {
      userId: user.id,
      specialtyId: input.specialtyId,
      consultationFeeDZD: input.consultationFeeDZD,
      licenseNumber: input.licenseNumber,
    },
  })

  // Link to institutions only if provided (independent doctors have none)
  if (input.institutionIds.length > 0) {
    await prisma.doctorInstitution.createMany({
      data: input.institutionIds.map((institutionId, i) => ({
        doctorId: doctor.id,
        institutionId,
        isPrimary: i === 0,
      })),
    })
  }

  await sendInvite(user.id)

  return { userId: user.id, doctorId: doctor.id }
}
