// server/src/modules/appointments/schema.ts
import { z } from "zod"

export const createAppointmentSchema = z.object({
  doctorId: z.string().optional(),
  serviceId: z.string().optional(),
  institutionId: z.string().min(1),
  startsAt: z.string().datetime({ message: "startsAt must be an ISO-8601 datetime" }),
  reason: z.string().max(500).optional(),
}).refine((d) => d.doctorId || d.serviceId, {
  message: "Either doctorId or serviceId is required",
  path: ["doctorId"],
})

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "COMPLETED", "NO_SHOW", "CANCELLED"]),
})

export const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
})
