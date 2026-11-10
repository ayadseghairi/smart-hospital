// server/src/middleware/rateLimit.ts
import rateLimit from "express-rate-limit"
import { env } from "../config/env"

export const authRateLimit = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — please try again later" },
  skipSuccessfulRequests: false,
})

// Stricter limit for email-sending endpoints
export const emailRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many email requests — please try again later" },
})
