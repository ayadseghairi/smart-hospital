// server/src/modules/institutions/schema.ts
import { z } from "zod"

export const listInstitutionsSchema = z.object({
  type: z.string().optional(),
  sector: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  communeId: z.coerce.number().optional(),
  q: z.string().optional(),
  emergency24h: z.coerce.boolean().optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
})
