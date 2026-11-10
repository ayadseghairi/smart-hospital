// server/src/modules/doctors/service.ts
import { prisma } from "../../lib/prisma"
import { createError } from "../../middleware/errorHandler"
import type { z } from "zod"
import type { listDoctorsSchema } from "./schema"

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
