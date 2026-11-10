// server/src/modules/doctors/service.ts
import { prisma } from "../../lib/prisma"
import { createError } from "../../middleware/errorHandler"
import type { z } from "zod"
import type { listDoctorsSchema, availabilityRuleSchema, updateDoctorProfileSchema } from "./schema"

type ListInput = z.infer<typeof listDoctorsSchema>

const DOCTOR_SELECT = {
  id: true,
  status: true,
  bioAr: true,
  bioFr: true,
  yearsExperience: true,
  languages: true,
  consultationFeeDZD: true,
  user: { select: { fullName: true, preferredLang: true } },
  specialty: { select: { id: true, nameAr: true, nameFr: true, slug: true } },
  institutionLinks: {
    select: {
      isPrimary: true,
      institution: {
        select: { id: true, nameAr: true, nameFr: true, communeId: true },
      },
    },
  },
}

export async function listDoctors(input: ListInput) {
  const where: Record<string, unknown> = { status: "ACTIVE" }

  if (input.specialty) {
    where.specialty = { slug: input.specialty }
  }
  if (input.institutionId) {
    where.institutionLinks = { some: { institutionId: input.institutionId } }
  }
  if (input.q) {
    where.user = { fullName: { contains: input.q, mode: "insensitive" } }
  }

  const skip = (input.page - 1) * input.limit

  const [doctors, total] = await prisma.$transaction([
    prisma.doctor.findMany({
      where,
      select: DOCTOR_SELECT,
      skip,
      take: input.limit,
      orderBy: { user: { fullName: "asc" } },
    }),
    prisma.doctor.count({ where }),
  ])

  return { doctors, total, page: input.page, limit: input.limit }
}

export async function getDoctor(id: string) {
  const doctor = await prisma.doctor.findFirst({
    where: { id, status: "ACTIVE" },
    select: DOCTOR_SELECT,
  })
  if (!doctor) throw createError("Doctor not found", 404)
  return doctor
}

/**
 * Compute available slots for a doctor on a given date.
 * Returns list of ISO-8601 start times (UTC) that are not yet booked.
 */
export async function getDoctorSlots(doctorId: string, date: string) {
  const doctor = await prisma.doctor.findFirst({
    where: { id: doctorId, status: "ACTIVE" },
    select: { id: true, availabilityRules: true },
  })
  if (!doctor) throw createError("Doctor not found", 404)

  // Parse the date in Africa/Algiers (UTC+1, no DST)
  const [year, month, day] = date.split("-").map(Number)
  const dateLocal = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - 60 * 60 * 1000) // subtract 1h for Algiers UTC+1
  const weekday = new Date(Date.UTC(year, month - 1, day)).getDay()

  const rules = doctor.availabilityRules.filter((r: { weekday: number; fromTime: string; toTime: string; slotMinutes: number }) => r.weekday === weekday)
  if (!rules.length) return []

  // Collect all booked starts for this doctor on this date
  const dayStart = new Date(`${date}T00:00:00+01:00`)
  const dayEnd = new Date(`${date}T23:59:59+01:00`)

  const booked = await prisma.appointment.findMany({
    where: {
      doctorId,
      status: { not: "CANCELLED" },
      startsAt: { gte: dayStart, lte: dayEnd },
    },
    select: { startsAt: true },
  })
  const bookedTimes = new Set(booked.map((a: { startsAt: Date }) => a.startsAt.toISOString()))

  // Generate slots
  const slots: string[] = []
  for (const rule of rules) {
    const [fromH, fromM] = rule.fromTime.split(":").map(Number)
    const [toH, toM] = rule.toTime.split(":").map(Number)
    let cursor = new Date(`${date}T${rule.fromTime}:00+01:00`)
    const end = new Date(`${date}T${rule.toTime}:00+01:00`)

    while (cursor < end) {
      const iso = cursor.toISOString()
      if (!bookedTimes.has(iso)) {
        slots.push(iso)
      }
      cursor = new Date(cursor.getTime() + rule.slotMinutes * 60 * 1000)
    }
  }

  return slots
}

// ─── Availability rules ───────────────────────────────────────────────────────

type AvailabilityInput = z.infer<typeof availabilityRuleSchema>
type UpdateProfileInput = z.infer<typeof updateDoctorProfileSchema>

async function getDoctorByUserId(userId: string) {
  const doctor = await prisma.doctor.findUnique({ where: { userId } })
  if (!doctor) throw createError("Doctor profile not found", 404)
  return doctor
}

export async function listAvailabilityRules(userId: string) {
  const doctor = await getDoctorByUserId(userId)
  return prisma.availabilityRule.findMany({
    where: { doctorId: doctor.id },
    include: {
      doctor: {
        select: {
          institutionLinks: {
            select: {
              institution: { select: { id: true, nameAr: true, nameFr: true } },
            },
          },
        },
      },
    },
    orderBy: [{ weekday: "asc" }, { fromTime: "asc" }],
  }).then((rules) =>
    rules.map((r) => {
      const { doctor: _d, ...rest } = r
      return rest
    })
  )
}

export async function listAvailabilityRulesWithInstitution(userId: string) {
  const doctor = await getDoctorByUserId(userId)
  const rules = await prisma.availabilityRule.findMany({
    where: { doctorId: doctor.id },
    orderBy: [{ weekday: "asc" }, { fromTime: "asc" }],
  })
  // Attach institution info if institutionId is set
  const institutionIds = [...new Set(rules.map((r) => r.institutionId).filter(Boolean) as string[])]
  const institutions = institutionIds.length
    ? await prisma.institution.findMany({
        where: { id: { in: institutionIds } },
        select: { id: true, nameAr: true, nameFr: true },
      })
    : []
  const instMap = new Map(institutions.map((i) => [i.id, i]))
  return rules.map((r) => ({
    ...r,
    institution: r.institutionId ? (instMap.get(r.institutionId) ?? null) : null,
  }))
}

export async function createAvailabilityRule(userId: string, input: AvailabilityInput) {
  const doctor = await getDoctorByUserId(userId)
  // Verify institutionId belongs to this doctor if provided
  if (input.institutionId) {
    const link = await prisma.doctorInstitution.findUnique({
      where: { doctorId_institutionId: { doctorId: doctor.id, institutionId: input.institutionId } },
    })
    if (!link) throw createError("Institution not linked to this doctor", 403)
  }
  return prisma.availabilityRule.create({
    data: {
      doctorId: doctor.id,
      weekday: input.weekday,
      fromTime: input.fromTime,
      toTime: input.toTime,
      slotMinutes: input.slotMinutes,
      institutionId: input.institutionId,
    },
  })
}

export async function deleteAvailabilityRule(userId: string, ruleId: string) {
  const doctor = await getDoctorByUserId(userId)
  const rule = await prisma.availabilityRule.findUnique({ where: { id: ruleId } })
  if (!rule || rule.doctorId !== doctor.id) throw createError("Rule not found", 404)
  await prisma.availabilityRule.delete({ where: { id: ruleId } })
}

// ─── Doctor profile update ────────────────────────────────────────────────────

export async function updateDoctorProfile(userId: string, input: UpdateProfileInput) {
  const doctor = await getDoctorByUserId(userId)
  const updated = await prisma.doctor.update({
    where: { id: doctor.id },
    data: {
      ...(input.bioAr !== undefined && { bioAr: input.bioAr }),
      ...(input.bioFr !== undefined && { bioFr: input.bioFr }),
      ...(input.languages !== undefined && { languages: input.languages }),
      ...(input.consultationFeeDZD !== undefined && { consultationFeeDZD: input.consultationFeeDZD }),
    },
    select: {
      id: true,
      bioAr: true,
      bioFr: true,
      languages: true,
      consultationFeeDZD: true,
    },
  })
  return updated
}
