// server/src/modules/auth/schema.ts
import { z } from "zod"

const ALGERIAN_PHONE = /^(?:\+213|00213|0)([567]\d{8})$/

export const registerSchema = z
  .object({
    phone: z.string().regex(ALGERIAN_PHONE, "Invalid Algerian phone number").optional(),
    email: z.string().email("Invalid email").optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    fullName: z.string().min(2).max(100),
    preferredLang: z.enum(["ar", "fr"]).default("ar"),
    consent: z.literal(true, { errorMap: () => ({ message: "You must accept the terms" }) }),
  })
  .refine((data) => data.phone || data.email, {
    message: "At least one of phone or email is required",
    path: ["phone"],
  })

export const loginSchema = z
  .object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(1),
  })
  .refine((data) => data.phone || data.email, {
    message: "Phone or email is required",
    path: ["phone"],
  })

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
