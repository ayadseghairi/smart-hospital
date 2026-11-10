// server/src/modules/search/routes.ts
// Arabic + French full-text search across doctors, institutions, services, specialties
import { Router } from "express"
import { prisma } from "../../lib/prisma"
import { normalizeArabic, normalizeFrench } from "./normalize"

export const searchRouter = Router()

searchRouter.get("/", async (req, res, next) => {
  try {
    const q = (req.query.q as string) ?? ""
    if (!q.trim()) {
      res.json({ data: { doctors: [], institutions: [], services: [], specialties: [] } })
      return
    }

    const norm = normalizeArabic(q) // also normalizes French accents
    const mode = "insensitive" as const
    const contains = (field: string) => ({ [field]: { contains: norm, mode } })

    const [doctors, institutions, services, specialties] = await Promise.all([
      prisma.user.findMany({
        where: { role: "DOCTOR", fullName: { contains: norm, mode } },
        select: { id: true, fullName: true },
        take: 10,
      }),
      prisma.institution.findMany({
        where: {
          status: "VERIFIED",
          OR: [{ nameAr: { contains: norm, mode } }, { nameFr: { contains: norm, mode } }],
        },
        select: { id: true, nameAr: true, nameFr: true, type: true },
        take: 10,
      }),
      prisma.service.findMany({
        where: {
          isActive: true,
          OR: [{ nameAr: { contains: norm, mode } }, { nameFr: { contains: norm, mode } }],
        },
        select: { id: true, nameAr: true, nameFr: true, category: true, institution: { select: { nameAr: true, nameFr: true } } },
        take: 10,
      }),
      prisma.specialty.findMany({
        where: {
          OR: [{ nameAr: { contains: norm, mode } }, { nameFr: { contains: norm, mode } }, { slug: { contains: norm, mode } }],
        },
        select: { id: true, nameAr: true, nameFr: true, slug: true },
        take: 10,
      }),
    ])

    res.json({ data: { doctors, institutions, services, specialties } })
  } catch (err) { next(err) }
})
