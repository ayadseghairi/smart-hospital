// server/src/modules/institutions/service.ts
import { prisma } from "../../lib/prisma"
import { haversineKm } from "../../lib/geo"
import { createError } from "../../middleware/errorHandler"
import type { z } from "zod"
import type { listInstitutionsSchema } from "./schema"

type ListInput = z.infer<typeof listInstitutionsSchema>

const PUBLIC_INSTITUTION_SELECT = {
  id: true,
  type: true,
  sector: true,
  nameAr: true,
  nameFr: true,
  addressAr: true,
  addressFr: true,
  lat: true,
  lng: true,
  phone: true,
  email: true,
  website: true,
  hasEmergency24h: true,
  openingHours: true,
  commune: { select: { nameAr: true, nameFr: true, wilaya: { select: { code: true, nameAr: true, nameFr: true } } } },
}

export async function listInstitutions(input: ListInput) {
  const where: Record<string, unknown> = {
    status: "VERIFIED", // only show verified institutions publicly
  }

  if (input.type) where.type = input.type
  if (input.sector) where.sector = input.sector
  if (input.communeId) where.communeId = input.communeId
  if (input.emergency24h !== undefined) where.hasEmergency24h = input.emergency24h
  if (input.q) {
    where.OR = [
      { nameAr: { contains: input.q, mode: "insensitive" } },
      { nameFr: { contains: input.q, mode: "insensitive" } },
    ]
  }

  const skip = (input.page - 1) * input.limit

  let institutions = await prisma.institution.findMany({
    where,
    select: PUBLIC_INSTITUTION_SELECT,
    skip,
    take: input.limit,
    orderBy: { nameAr: "asc" },
  })

  // Sort by distance if lat/lng provided
  if (input.lat != null && input.lng != null) {
    institutions = institutions
      .map((inst: typeof institutions[number]) => ({
        ...inst,
        distanceKm:
          inst.lat != null && inst.lng != null
            ? haversineKm(input.lat!, input.lng!, inst.lat, inst.lng)
            : null,
      }))
      .sort((a: { distanceKm: number | null }, b: { distanceKm: number | null }) => {
        if (a.distanceKm == null) return 1
        if (b.distanceKm == null) return -1
        return a.distanceKm - b.distanceKm
      })
  }

  const total = await prisma.institution.count({ where })

  return { institutions, total, page: input.page, limit: input.limit }
}

export async function getInstitution(id: string) {
  const institution = await prisma.institution.findFirst({
    where: { id, status: "VERIFIED" },
    select: {
      ...PUBLIC_INSTITUTION_SELECT,
      services: {
        where: { isActive: true },
        select: { id: true, category: true, nameAr: true, nameFr: true, priceDZD: true, durationMin: true },
      },
    },
  })
  if (!institution) throw createError("Institution not found", 404)
  return institution
}

export async function getInstitutionDoctors(institutionId: string) {
  const institution = await prisma.institution.findFirst({
    where: { id: institutionId, status: "VERIFIED" },
    select: { id: true },
  })
  if (!institution) throw createError("Institution not found", 404)

  return prisma.doctorInstitution.findMany({
    where: { institutionId },
    include: {
      doctor: {
        include: {
          user: { select: { fullName: true } },
          specialty: { select: { nameAr: true, nameFr: true } },
        },
      },
    },
  })
}

export async function getInstitutionServices(institutionId: string, category?: string) {
  const institution = await prisma.institution.findFirst({
    where: { id: institutionId, status: "VERIFIED" },
    select: { id: true },
  })
  if (!institution) throw createError("Institution not found", 404)

  return prisma.service.findMany({
    where: {
      institutionId,
      isActive: true,
      ...(category ? { category: category as "IMAGING" | "LAB" | "NURSING" | "PHARMACY" } : {}),
    },
    select: { id: true, category: true, nameAr: true, nameFr: true, priceDZD: true, durationMin: true },
  })
}
