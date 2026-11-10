// server/src/modules/emergency/routes.ts
import { Router } from "express"
import { prisma } from "../../lib/prisma"
import { haversineKm } from "../../lib/geo"

export const emergencyRouter = Router()

emergencyRouter.get("/numbers", async (_req, res, next) => {
  try {
    const numbers = await prisma.emergencyNumber.findMany({ orderBy: { number: "asc" } })
    res.json({ data: numbers })
  } catch (err) { next(err) }
})

emergencyRouter.get("/nearby", async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat as string)
    const lng = parseFloat(req.query.lng as string)
    if (isNaN(lat) || isNaN(lng)) {
      res.status(400).json({ error: "lat and lng are required" })
      return
    }

    const institutions = await prisma.institution.findMany({
      where: { status: "VERIFIED", hasEmergency24h: true, lat: { not: null }, lng: { not: null } },
      select: { id: true, nameAr: true, nameFr: true, lat: true, lng: true, phone: true, addressAr: true, addressFr: true },
    })

    const withDistance = institutions
      .map((inst: { id: string; nameAr: string; nameFr: string; lat: number | null; lng: number | null; phone: string | null; addressAr: string | null; addressFr: string | null }) => ({
        ...inst,
        distanceKm: haversineKm(lat, lng, inst.lat!, inst.lng!),
      }))
      .sort((a: { distanceKm: number }, b: { distanceKm: number }) => a.distanceKm - b.distanceKm)

    res.json({ data: withDistance })
  } catch (err) { next(err) }
})
