// server/src/config/env.ts
// Zod-validated environment — fails fast at startup with a clear message.
// NEVER print secret values in error messages.
import { z } from "zod"

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(4000),
    TZ: z.string().default("Africa/Algiers"),

    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

    JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 chars"),
    JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 chars"),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

    APP_NAME: z.string().default("Delin Smart Care"),
    APP_BASE_URL: z.string().url("APP_BASE_URL must be a valid URL"),
    API_BASE_URL: z.string().url("API_BASE_URL must be a valid URL"),
    CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),

    MAIL_ENABLED: z
      .string()
      .optional()
      .transform((v) => v === "true" || v === "1")
      .default("false")
      .pipe(z.boolean()),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_SECURE: z
      .string()
      .optional()
      .transform((v) => v === "true" || v === "1")
      .default("false")
      .pipe(z.boolean()),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    MAIL_FROM_NAME: z.string().default("Delin Smart Care"),
    // MAIL_FROM_ADDRESS falls back to SMTP_USER (applied in superRefine below)
    MAIL_FROM_ADDRESS: z.string().optional(),
    MAIL_REPLY_TO: z.string().optional(),

    EMAIL_VERIFY_TTL_HOURS: z.coerce.number().default(24),
    INVITE_TTL_HOURS: z.coerce.number().default(48),
    PASSWORD_RESET_TTL_MINUTES: z.coerce.number().default(60),
    REMINDER_OFFSETS_HOURS: z.string().default("24,2"),
    DOCTOR_DIGEST_HOUR: z.coerce.number().min(0).max(23).default(7),

    AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900_000),
    AUTH_RATE_LIMIT_MAX: z.coerce.number().default(10),

    SUPER_ADMIN_EMAIL: z.string().email().optional(),
    SUPER_ADMIN_FULL_NAME: z.string().optional(),
    // TEMPORARY — hashed at first use; owner must remove after first login
    SUPER_ADMIN_INITIAL_PASSWORD: z.string().optional(),

    // AES-256-GCM key for encrypting stored TOTP secrets (must be exactly 32 bytes = 64 hex chars)
    // Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    MFA_ENCRYPTION_KEY: z
      .string()
      .regex(/^[0-9a-fA-F]{64}$/, "MFA_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)")
      .optional(),
  })
  .superRefine((data, ctx) => {
    // If MAIL_ENABLED=true, all SMTP settings must be present
    if (data.MAIL_ENABLED) {
      const required = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"] as const
      for (const key of required) {
        if (!data[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            // No secret values in the message — just the variable name
            message: `${key} is required when MAIL_ENABLED=true`,
            path: [key],
          })
        }
      }
    }
  })

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error("❌  Invalid environment variables:\n")
  for (const issue of parsed.error.issues) {
    console.error(`  • ${issue.path.join(".")}: ${issue.message}`)
  }
  console.error("\nFix these issues in server/.env (copy from server/.env.example)\n")
  process.exit(1)
}

// Apply MAIL_FROM_ADDRESS fallback (SMTP_USER) after validation
const raw = parsed.data
const MAIL_FROM_ADDRESS = raw.MAIL_FROM_ADDRESS || raw.SMTP_USER || "no-reply@delin.dz"

export const env = {
  ...raw,
  MAIL_FROM_ADDRESS,
}

export const reminderOffsets: number[] = env.REMINDER_OFFSETS_HOURS
  .split(",")
  .map((s) => parseInt(s.trim(), 10))
  .filter(Number.isFinite)
