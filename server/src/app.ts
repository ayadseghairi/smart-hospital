// server/src/app.ts
import express from "express"
import helmet from "helmet"
import cors from "cors"
import cookieParser from "cookie-parser"
import { env } from "./config/env"
import { errorHandler } from "./middleware/errorHandler"

// Module routers
import { authRouter } from "./modules/auth/routes"
import { institutionsRouter } from "./modules/institutions/routes"
import { doctorsRouter } from "./modules/doctors/routes"
import { appointmentsRouter } from "./modules/appointments/routes"
import { searchRouter } from "./modules/search/routes"
import { emergencyRouter } from "./modules/emergency/routes"
import { assistantRouter } from "./modules/assistant/routes"
import { adminRouter } from "./modules/admin/routes"
import { notificationsRouter } from "./modules/notifications/routes"
import { contactRouter } from "./modules/contact/routes"

// Doctor self-service router (availability, profile, appointments)
import { authenticate } from "./middleware/auth"
import { requireRole } from "./middleware/requireRole"
import { validate } from "./middleware/validate"
import { availabilityRuleSchema, updateDoctorProfileSchema } from "./modules/doctors/schema"
import * as doctorCtrl from "./modules/doctors/controller"
import * as apptCtrl from "./modules/appointments/controller"
import { updateAppointmentStatusSchema } from "./modules/appointments/schema"

const app = express()

// ── Security ───────────────────────────────────────────────────────────────
app.use(
  helmet({
    // Allow token links in email to work without referrer leaking the token
    referrerPolicy: { policy: "no-referrer" },
  })
)

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true, // allow httpOnly cookies
  })
)

// ── Body parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── Health check ───────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    app: env.APP_NAME,
    env: env.NODE_ENV,
    time: new Date().toISOString(),
  })
})

// ── API v1 routes ──────────────────────────────────────────────────────────
// Doctor self-service sub-router (mounted at /doctor)
const doctorRouter = express.Router()
doctorRouter.get(
  "/availability",
  authenticate,
  requireRole("DOCTOR"),
  doctorCtrl.listAvailability
)
doctorRouter.post(
  "/availability",
  authenticate,
  requireRole("DOCTOR"),
  validate(availabilityRuleSchema),
  doctorCtrl.createAvailability
)
doctorRouter.delete(
  "/availability/:id",
  authenticate,
  requireRole("DOCTOR"),
  doctorCtrl.deleteAvailability
)
doctorRouter.patch(
  "/profile",
  authenticate,
  requireRole("DOCTOR"),
  validate(updateDoctorProfileSchema),
  doctorCtrl.updateProfile
)

// Doctor appointments (mirrors /appointments/doctor)
doctorRouter.get(
  "/appointments",
  authenticate,
  requireRole("DOCTOR"),
  apptCtrl.doctorList
)
doctorRouter.patch(
  "/appointments/:id/status",
  authenticate,
  requireRole("DOCTOR"),
  validate(updateAppointmentStatusSchema),
  apptCtrl.doctorUpdateStatus
)

const api = express.Router()
api.use("/auth", authRouter)
api.use("/institutions", institutionsRouter)
api.use("/doctors", doctorsRouter)
api.use("/appointments", appointmentsRouter)
api.use("/doctor", doctorRouter)
api.use("/search", searchRouter)
api.use("/emergency", emergencyRouter)
api.use("/assistant", assistantRouter)
api.use("/admin", adminRouter)
api.use("/notifications", notificationsRouter)
api.use("/contact", contactRouter)

app.use("/api/v1", api)

// ── 404 catch-all ──────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" })
})

// ── Error handler (must be last) ───────────────────────────────────────────
app.use(errorHandler)

export default app
