// server/src/modules/contact/schema.ts
import { z } from "zod"

export const contactSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  message: z.string().min(5).max(1000),
  type: z.enum(["GENERAL", "INSTITUTION_REQUEST", "REPORT_ERROR"]).default("GENERAL"),
  // Honeypot: must be empty (bots fill it, humans don't)
  website: z.string().max(0, "Spam detected").default(""),
})

export type ContactInput = z.infer<typeof contactSchema>
