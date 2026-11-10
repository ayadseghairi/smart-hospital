// server/src/modules/doctors/routes.ts
import { Router } from "express"
import { validate } from "../../middleware/validate"
import { authenticate } from "../../middleware/auth"
import { requireRole } from "../../middleware/requireRole"
import { listDoctorsSchema, slotsQuerySchema, availabilityRuleSchema, updateDoctorProfileSchema } from "./schema"
import * as ctrl from "./controller"

export const doctorsRouter = Router()

// Public routes
doctorsRouter.get("/", validate(listDoctorsSchema, "query"), ctrl.list)
doctorsRouter.get("/:id", ctrl.getOne)
doctorsRouter.get("/:id/slots", validate(slotsQuerySchema, "query"), ctrl.getSlots)

// Doctor-authenticated routes (note: mounted at /doctors in app.ts,
// but also exposed as /doctor/availability, /doctor/profile via the appointments
// sub-router — we use a separate path to avoid conflict)
doctorsRouter.get(
  "/me/availability",
  authenticate,
  requireRole("DOCTOR"),
  ctrl.listAvailability
)
doctorsRouter.post(
  "/me/availability",
  authenticate,
  requireRole("DOCTOR"),
  validate(availabilityRuleSchema),
  ctrl.createAvailability
)
doctorsRouter.delete(
  "/me/availability/:id",
  authenticate,
  requireRole("DOCTOR"),
  ctrl.deleteAvailability
)
doctorsRouter.patch(
  "/me/profile",
  authenticate,
  requireRole("DOCTOR"),
  validate(updateDoctorProfileSchema),
  ctrl.updateProfile
)
