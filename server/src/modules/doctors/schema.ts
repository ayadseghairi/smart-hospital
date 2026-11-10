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
