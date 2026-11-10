// server/src/modules/doctors/schema.ts
import { z } from "zod"

export const listDoctorsSchema = z.object({
  specialty: z.string().optional(),
  institutionId: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
})

export const slotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
})

export const availabilityRuleSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  fromTime: z.string().regex(/^\d{2}:\d{2}$/, "fromTime must be HH:mm"),
  toTime: z.string().regex(/^\d{2}:\d{2}$/, "toTime must be HH:mm"),
  slotMinutes: z.number().int().refine((v) => [15, 20, 30, 45, 60].includes(v), {
    message: "slotMinutes must be 15, 20, 30, 45, or 60",
  }),
  institutionId: z.string().optional(),
})

export const updateDoctorProfileSchema = z.object({
  bioAr: z.string().max(1000).optional(),
  bioFr: z.string().max(1000).optional(),
  languages: z.array(z.string()).optional(),
  consultationFeeDZD: z.number().int().min(0).nullable().optional(),
})
