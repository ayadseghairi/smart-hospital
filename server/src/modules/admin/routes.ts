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

// ── Audit log ─────────────────────────────────────────────────────────────

adminRouter.get("/audit-log", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = 50
    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.auditLog.count(),
    ])
    res.json({ data: { logs, total, page, limit } })
  } catch (err) { next(err) }
})
