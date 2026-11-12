// server/src/modules/appointments/routes.ts
import { Router } from "express"
import { authenticate } from "../../middleware/auth"
import { requireRole } from "../../middleware/requireRole"
import { validate } from "../../middleware/validate"
import { createAppointmentSchema, updateAppointmentStatusSchema, cancelSchema } from "./schema"
import * as ctrl from "./controller"

export const appointmentsRouter = Router()

// Patient routes
appointmentsRouter.post(
  "/",
  authenticate,
  requireRole("PATIENT"),
  validate(createAppointmentSchema),
  ctrl.create
)
appointmentsRouter.get("/mine", authenticate, requireRole("PATIENT"), ctrl.mine)
appointmentsRouter.get("/:id/ics", authenticate, requireRole("PATIENT"), ctrl.downloadIcs)
appointmentsRouter.patch(
  "/:id/cancel",
  authenticate,
  requireRole("PATIENT", "DOCTOR", "INSTITUTION_ADMIN"),
  validate(cancelSchema),
  ctrl.cancel
)

// Doctor routes
appointmentsRouter.get(
  "/doctor",
  authenticate,
  requireRole("DOCTOR"),
  ctrl.doctorList
)
appointmentsRouter.patch(
  "/doctor/:id/status",
  authenticate,
  requireRole("DOCTOR", "INSTITUTION_ADMIN"),
  validate(updateAppointmentStatusSchema),
  ctrl.doctorUpdateStatus
)
