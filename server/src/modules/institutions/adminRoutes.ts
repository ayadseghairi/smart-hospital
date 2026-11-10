// server/src/modules/institutions/adminRoutes.ts
// All routes here require INSTITUTION_ADMIN role and scope to the owned institution
import { Router } from "express"
import { z } from "zod"
import { authenticate } from "../../middleware/auth"
import { requireRole } from "../../middleware/requireRole"
import { validate } from "../../middleware/validate"
import { prisma } from "../../lib/prisma"
import { audit } from "../../lib/audit"
import { createError } from "../../middleware/errorHandler"

export const institutionAdminRouter = Router()

// All routes require INSTITUTION_ADMIN
institutionAdminRouter.use(authenticate, requireRole("INSTITUTION_ADMIN"))

/** Helper: get the institution ID owned by this admin, or 404 */
async function getOwnedInstitutionId(userId: string): Promise<string> {
  const link = await prisma.institutionAdmin.findFirst({ where: { userId } })
  if (!link) throw createError("No institution linked to this account", 404)
  return link.institutionId
}

// ── Institution profile ─────────────────────────────────────────────────────

institutionAdminRouter.get("/mine", async (req, res, next) => {
  try {
    const institutionId = await getOwnedInstitutionId(req.user!.sub)
    const institution = await prisma.institution.findUnique({ where: { id: institutionId } })
    res.json({ data: institution })
  } catch (err) { next(err) }
})

const updateInstSchema = z.object({
  nameAr: z.string().min(2).max(200).optional(),
  nameFr: z.string().min(2).max(200).optional(),
  addressAr: z.string().max(300).optional(),
  addressFr: z.string().max(300).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal("")),
  hasEmergency24h: z.boolean().optional(),
  openingHours: z.record(z.unknown()).optional(),
})

institutionAdminRouter.patch("/mine", validate(updateInstSchema), async (req, res, next) => {
  try {
    const institutionId = await getOwnedInstitutionId(req.user!.sub)
    const institution = await prisma.institution.update({
      where: { id: institutionId },
      data: req.body,
    })
    await audit({ userId: req.user!.sub, action: "UPDATE_INSTITUTION", entity: "Institution", entityId: institutionId, ip: req.ip })
    res.json({ data: institution })
  } catch (err) { next(err) }
})

// ── Appointments ────────────────────────────────────────────────────────────

institutionAdminRouter.get("/mine/appointments", async (req, res, next) => {
  try {
    const institutionId = await getOwnedInstitutionId(req.user!.sub)
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20))
    const status = req.query.status as string | undefined

    const where = {
      institutionId,
      ...(status ? { status: status as never } : {}),
    }

    const [appointments, total] = await prisma.$transaction([
      prisma.appointment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startsAt: "asc" },
        select: {
          id: true, startsAt: true, endsAt: true, status: true, reason: true, createdAt: true,
          patient: { select: { id: true, fullName: true, phone: true, email: true } },
          doctor: { select: { id: true, user: { select: { fullName: true } }, specialty: { select: { nameAr: true, nameFr: true } } } },
        },
      }),
      prisma.appointment.count({ where }),
    ])
    res.json({ data: { appointments, total, page, limit } })
  } catch (err) { next(err) }
})

const updateApptStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"]),
})

institutionAdminRouter.patch("/mine/appointments/:id/status", validate(updateApptStatusSchema), async (req, res, next) => {
  try {
    const institutionId = await getOwnedInstitutionId(req.user!.sub)
    const appt = await prisma.appointment.findUnique({ where: { id: req.params.id } })
    if (!appt || appt.institutionId !== institutionId) throw createError("Appointment not found", 404)

    const { status } = req.body
    if (status === "CONFIRMED" && appt.status !== "PENDING") throw createError("Only PENDING appointments can be confirmed", 400)
    if (status === "CANCELLED" && !["PENDING", "CONFIRMED"].includes(appt.status)) throw createError("Cannot cancel this appointment", 400)

    const updated = await prisma.appointment.update({
      where: { id: appt.id },
      data: { status, ...(status === "CANCELLED" ? { cancelledById: req.user!.sub } : {}) },
    })
    await audit({ userId: req.user!.sub, action: `APPT_${status}`, entity: "Appointment", entityId: appt.id, ip: req.ip })
    res.json({ data: updated })
  } catch (err) { next(err) }
})

// ── Services ─────────────────────────────────────────────────────────────────

institutionAdminRouter.get("/mine/services", async (req, res, next) => {
  try {
    const institutionId = await getOwnedInstitutionId(req.user!.sub)
    const services = await prisma.service.findMany({ where: { institutionId }, orderBy: { category: "asc" } })
    res.json({ data: services })
  } catch (err) { next(err) }
})

const createServiceSchema = z.object({
  nameAr: z.string().min(2).max(200),
  nameFr: z.string().min(2).max(200),
  category: z.enum(["IMAGING", "LAB", "NURSING", "PHARMACY"]),
  priceDZD: z.number().int().positive().optional(),
  durationMin: z.number().int().positive(),
  isActive: z.boolean().default(true),
})

institutionAdminRouter.post("/mine/services", validate(createServiceSchema), async (req, res, next) => {
  try {
    const institutionId = await getOwnedInstitutionId(req.user!.sub)
    const service = await prisma.service.create({ data: { ...req.body, institutionId } })
    await audit({ userId: req.user!.sub, action: "CREATE_SERVICE", entity: "Service", entityId: service.id, ip: req.ip })
    res.status(201).json({ data: service })
  } catch (err) { next(err) }
})

const updateServiceSchema = createServiceSchema.partial()

institutionAdminRouter.patch("/mine/services/:id", validate(updateServiceSchema), async (req, res, next) => {
  try {
    const institutionId = await getOwnedInstitutionId(req.user!.sub)
    const existing = await prisma.service.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.institutionId !== institutionId) throw createError("Service not found", 404)
    const service = await prisma.service.update({ where: { id: req.params.id }, data: req.body })
    res.json({ data: service })
  } catch (err) { next(err) }
})

institutionAdminRouter.delete("/mine/services/:id", async (req, res, next) => {
  try {
    const institutionId = await getOwnedInstitutionId(req.user!.sub)
    const existing = await prisma.service.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.institutionId !== institutionId) throw createError("Service not found", 404)
    await prisma.service.update({ where: { id: req.params.id }, data: { isActive: false } })
    await audit({ userId: req.user!.sub, action: "DEACTIVATE_SERVICE", entity: "Service", entityId: req.params.id, ip: req.ip })
    res.json({ data: { ok: true } })
  } catch (err) { next(err) }
})

// ── Stats ────────────────────────────────────────────────────────────────────

institutionAdminRouter.get("/mine/stats", async (req, res, next) => {
  try {
    const institutionId = await getOwnedInstitutionId(req.user!.sub)

    const [pending, confirmed, completed, cancelled, noShow, totalServices] = await prisma.$transaction([
      prisma.appointment.count({ where: { institutionId, status: "PENDING" } }),
      prisma.appointment.count({ where: { institutionId, status: "CONFIRMED" } }),
      prisma.appointment.count({ where: { institutionId, status: "COMPLETED" } }),
      prisma.appointment.count({ where: { institutionId, status: "CANCELLED" } }),
      prisma.appointment.count({ where: { institutionId, status: "NO_SHOW" } }),
      prisma.service.count({ where: { institutionId, isActive: true } }),
    ])

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentAppointments = await prisma.appointment.count({
      where: { institutionId, createdAt: { gte: thirtyDaysAgo } },
    })

    res.json({
      data: {
        appointmentsByStatus: [
          { status: "PENDING", count: pending },
          { status: "CONFIRMED", count: confirmed },
          { status: "COMPLETED", count: completed },
          { status: "CANCELLED", count: cancelled },
          { status: "NO_SHOW", count: noShow },
        ],
        totalServices,
        recentAppointments,
      },
    })
  } catch (err) { next(err) }
})
