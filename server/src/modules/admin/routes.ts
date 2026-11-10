// server/src/modules/admin/routes.ts
// All routes here require SUPER_ADMIN role
import { Router } from "express"
import { authenticate } from "../../middleware/auth"
import { canCreateAccounts } from "../../middleware/requireRole"
import { validate } from "../../middleware/validate"
import { emailRateLimit } from "../../middleware/rateLimit"
import { z } from "zod"
import { prisma } from "../../lib/prisma"
import { audit } from "../../lib/audit"
import { sendInvite, createDoctorAccount, createInstitutionAdminAccount } from "./service"

export const adminRouter = Router()

// All admin routes require auth + SUPER_ADMIN
adminRouter.use(authenticate, canCreateAccounts)

// ── Institutions ──────────────────────────────────────────────────────────

const createInstitutionSchema = z.object({
  type: z.enum(["CHU", "EPH", "EPSP", "EHS", "POLYCLINIC", "PRIVATE_CLINIC", "PRIVATE_LAB", "PRIVATE_IMAGING", "PHARMACY"]),
  sector: z.enum(["PUBLIC", "PRIVATE"]),
  nameAr: z.string().min(2),
  nameFr: z.string().min(2),
  communeId: z.number().int(),
  addressAr: z.string().optional(),
  addressFr: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  hasEmergency24h: z.boolean().default(false),
  sourceNote: z.string().optional(),
})

adminRouter.post("/institutions", validate(createInstitutionSchema), async (req, res, next) => {
  try {
    const institution = await prisma.institution.create({
      data: { ...req.body, status: "DRAFT" },
    })
    await audit({ userId: req.user!.sub, action: "CREATE_INSTITUTION", entity: "Institution", entityId: institution.id, ip: req.ip })
    res.status(201).json({ data: institution })
  } catch (err) { next(err) }
})

adminRouter.patch("/institutions/:id/verify", async (req, res, next) => {
  try {
    const institution = await prisma.institution.update({
      where: { id: req.params.id },
      data: { status: "VERIFIED" },
    })
    await audit({ userId: req.user!.sub, action: "VERIFY_INSTITUTION", entity: "Institution", entityId: institution.id, ip: req.ip })
    res.json({ data: institution })
  } catch (err) { next(err) }
})

adminRouter.patch("/institutions/:id/suspend", async (req, res, next) => {
  try {
    const institution = await prisma.institution.update({
      where: { id: req.params.id },
      data: { status: "SUSPENDED" },
    })
    await audit({ userId: req.user!.sub, action: "SUSPEND_INSTITUTION", entity: "Institution", entityId: institution.id, ip: req.ip })
    res.json({ data: institution })
  } catch (err) { next(err) }
})

// ── Institution admins ────────────────────────────────────────────────────

const createInstAdminSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  preferredLang: z.enum(["ar", "fr"]).default("ar"),
})

adminRouter.post("/institutions/:id/admins", emailRateLimit, validate(createInstAdminSchema), async (req, res, next) => {
  try {
    const result = await createInstitutionAdminAccount(req.user!.sub, req.params.id, req.body)
    await audit({ userId: req.user!.sub, action: "CREATE_INSTITUTION_ADMIN", entity: "User", entityId: result.userId, ip: req.ip })
    res.status(201).json({ data: result })
  } catch (err) { next(err) }
})

// ── Doctors ───────────────────────────────────────────────────────────────

const createDoctorSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  preferredLang: z.enum(["ar", "fr"]).default("ar"),
  specialtyId: z.string().min(1),
  institutionIds: z.array(z.string()).min(1),
  consultationFeeDZD: z.number().int().optional(),
  licenseNumber: z.string().optional(),
})

adminRouter.post("/doctors", emailRateLimit, validate(createDoctorSchema), async (req, res, next) => {
  try {
    const result = await createDoctorAccount(req.user!.sub, req.body)
    await audit({ userId: req.user!.sub, action: "CREATE_DOCTOR", entity: "Doctor", entityId: result.doctorId, ip: req.ip })
    res.status(201).json({ data: result })
  } catch (err) { next(err) }
})

// ── Users ─────────────────────────────────────────────────────────────────

adminRouter.patch("/users/:id/deactivate", async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } })
    await audit({ userId: req.user!.sub, action: "DEACTIVATE_USER", entity: "User", entityId: user.id, ip: req.ip })
    res.json({ data: { ok: true } })
  } catch (err) { next(err) }
})

adminRouter.patch("/users/:id/reactivate", async (req, res, next) => {
  try {
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: true } })
    await audit({ userId: req.user!.sub, action: "REACTIVATE_USER", entity: "User", entityId: user.id, ip: req.ip })
    res.json({ data: { ok: true } })
  } catch (err) { next(err) }
})

adminRouter.post("/users/:id/resend-invite", emailRateLimit, async (req, res, next) => {
  try {
    await sendInvite(req.params.id)
    await audit({ userId: req.user!.sub, action: "RESEND_INVITE", entity: "User", entityId: req.params.id, ip: req.ip })
    res.json({ data: { ok: true } })
  } catch (err) { next(err) }
})

// ── Users list ────────────────────────────────────────────────────────────

adminRouter.get("/users", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20)
    const q = req.query.q as string | undefined
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where: q ? {
          OR: [
            { fullName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ]
        } : {},
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, role: true, fullName: true, email: true, phone: true, isActive: true, mustSetPassword: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: q ? { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] } : {} }),
    ])
    res.json({ data: { users, total, page, limit } })
  } catch (err) { next(err) }
})

// ── Audit log ─────────────────────────────────────────────────────────────

adminRouter.get("/audit-log", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = 50
    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.auditLog.count(),
    ])
    res.json({ data: { logs, total, page, limit } })
  } catch (err) { next(err) }
})

// ── Stats ─────────────────────────────────────────────────────────────────

adminRouter.get("/stats", async (req, res, next) => {
  try {
    const [verified, draft, suspended, doctorCount, patientCount, pendingAppts, failedNotifs] = await prisma.$transaction([
      prisma.institution.count({ where: { status: "VERIFIED" } }),
      prisma.institution.count({ where: { status: "DRAFT" } }),
      prisma.institution.count({ where: { status: "SUSPENDED" } }),
      prisma.doctor.count(),
      prisma.user.count({ where: { role: "PATIENT" } }),
      prisma.appointment.count({ where: { status: "PENDING" } }),
      prisma.notification.count({ where: { status: "FAILED" } }),
    ])
    res.json({
      data: {
        institutions: { total: verified + draft + suspended, verified, draft, suspended },
        doctors: doctorCount,
        patients: patientCount,
        pendingAppointments: pendingAppts,
        failedNotifications: failedNotifs,
      },
    })
  } catch (err) { next(err) }
})

// ── Messages ──────────────────────────────────────────────────────────────

adminRouter.get("/messages", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20)
    const status = req.query.status as string | undefined
    const type = req.query.type as string | undefined
    const where = {
      ...(status ? { status: status as never } : {}),
      ...(type ? { type: type as never } : {}),
    }
    const [messages, total] = await prisma.$transaction([
      prisma.contactMessage.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.contactMessage.count({ where }),
    ])
    res.json({ data: { messages, total, page, limit } })
  } catch (err) { next(err) }
})

adminRouter.patch("/messages/:id", async (req, res, next) => {
  try {
    const s = req.body.status as string
    if (!["READ", "REPLIED"].includes(s)) { res.status(400).json({ error: "Invalid status" }); return }
    const msg = await prisma.contactMessage.update({ where: { id: req.params.id }, data: { status: s as never } })
    res.json({ data: msg })
  } catch (err) { next(err) }
})

// ── Notifications log ──────────────────────────────────────────────────────

adminRouter.get("/notifications-log", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20)
    const status = req.query.status as string | undefined
    const where = status ? { status: status as never } : {}
    const [notifications, total] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, kind: true, status: true, attempts: true, lastError: true, sentAt: true, createdAt: true, channel: true, locale: true },
      }),
      prisma.notification.count({ where }),
    ])
    res.json({ data: { notifications, total, page, limit } })
  } catch (err) { next(err) }
})

// ── Data quality ───────────────────────────────────────────────────────────

adminRouter.get("/data-quality", async (req, res, next) => {
  try {
    const missingData = await prisma.institution.findMany({
      where: {
        OR: [
          { phone: null },
          { lat: null },
          { lng: null },
          { sourceNote: null },
        ],
        status: { not: "SUSPENDED" },
      },
      select: { id: true, nameAr: true, nameFr: true, status: true, phone: true, lat: true, lng: true, sourceNote: true },
      orderBy: { createdAt: "asc" },
    })
    const drafts = await prisma.institution.findMany({
      where: { status: "DRAFT" },
      select: { id: true, nameAr: true, nameFr: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    })
    res.json({ data: { missingData, drafts } })
  } catch (err) { next(err) }
})

// ── Specialties ────────────────────────────────────────────────────────────

adminRouter.get("/specialties", async (req, res, next) => {
  try {
    const specialties = await prisma.specialty.findMany({ orderBy: { nameAr: "asc" } })
    res.json({ data: specialties })
  } catch (err) { next(err) }
})

const specialtySchema = z.object({ nameAr: z.string().min(2), nameFr: z.string().min(2), slug: z.string().min(2).regex(/^[a-z0-9-]+$/) })

adminRouter.post("/specialties", validate(specialtySchema), async (req, res, next) => {
  try {
    const s = await prisma.specialty.create({ data: req.body })
    await audit({ userId: req.user!.sub, action: "CREATE_SPECIALTY", entity: "Specialty", entityId: s.id, ip: req.ip })
    res.status(201).json({ data: s })
  } catch (err) { next(err) }
})

adminRouter.patch("/specialties/:id", validate(specialtySchema.partial()), async (req, res, next) => {
  try {
    const s = await prisma.specialty.update({ where: { id: req.params.id }, data: req.body })
    await audit({ userId: req.user!.sub, action: "UPDATE_SPECIALTY", entity: "Specialty", entityId: s.id, ip: req.ip })
    res.json({ data: s })
  } catch (err) { next(err) }
})

// ── Emergency numbers ──────────────────────────────────────────────────────

const emergencySchema = z.object({
  labelAr: z.string().min(2),
  labelFr: z.string().min(2),
  number: z.string().min(1).max(20),
  scope: z.string().default("national"),
})

adminRouter.get("/emergency-numbers", async (req, res, next) => {
  try {
    const numbers = await prisma.emergencyNumber.findMany({ orderBy: { number: "asc" } })
    res.json({ data: numbers })
  } catch (err) { next(err) }
})

adminRouter.post("/emergency-numbers", validate(emergencySchema), async (req, res, next) => {
  try {
    const en = await prisma.emergencyNumber.create({ data: req.body })
    await audit({ userId: req.user!.sub, action: "CREATE_EMERGENCY_NUMBER", entity: "EmergencyNumber", entityId: en.id, ip: req.ip })
    res.status(201).json({ data: en })
  } catch (err) { next(err) }
})

adminRouter.patch("/emergency-numbers/:id", validate(emergencySchema.partial()), async (req, res, next) => {
  try {
    const en = await prisma.emergencyNumber.update({ where: { id: req.params.id }, data: req.body })
    await audit({ userId: req.user!.sub, action: "UPDATE_EMERGENCY_NUMBER", entity: "EmergencyNumber", entityId: en.id, ip: req.ip })
    res.json({ data: en })
  } catch (err) { next(err) }
})

adminRouter.delete("/emergency-numbers/:id", async (req, res, next) => {
  try {
    await prisma.emergencyNumber.delete({ where: { id: req.params.id } })
    await audit({ userId: req.user!.sub, action: "DELETE_EMERGENCY_NUMBER", entity: "EmergencyNumber", entityId: req.params.id, ip: req.ip })
    res.json({ data: { ok: true } })
  } catch (err) { next(err) }
})

// ── Institutions list ──────────────────────────────────────────────────────

adminRouter.get("/institutions", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20)
    const status = req.query.status as string | undefined
    const where = status ? { status: status as never } : {}
    const [institutions, total] = await prisma.$transaction([
      prisma.institution.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: { id: true, nameAr: true, nameFr: true, type: true, status: true, phone: true, lat: true, lng: true, sourceNote: true, createdAt: true },
      }),
      prisma.institution.count({ where }),
    ])
    res.json({ data: { institutions, total, page, limit } })
  } catch (err) { next(err) }
})
