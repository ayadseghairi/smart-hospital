// server/src/modules/auth/routes.ts
import { Router } from "express"
import { validate } from "../../middleware/validate"
import { authenticate } from "../../middleware/auth"
import { authRateLimit, emailRateLimit } from "../../middleware/rateLimit"
import * as ctrl from "./controller"
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  acceptInviteSchema,
} from "./schema"

export const authRouter = Router()

authRouter.post("/register", authRateLimit, validate(registerSchema), ctrl.register)
authRouter.post("/login", authRateLimit, validate(loginSchema), ctrl.login)
authRouter.post("/refresh", authRateLimit, ctrl.refresh)
authRouter.post("/logout", ctrl.logout)
authRouter.get("/me", authenticate, ctrl.me)
authRouter.post("/verify-email", validate(verifyEmailSchema), ctrl.verifyEmail)
authRouter.post("/resend-verification", emailRateLimit, authenticate, ctrl.resendVerification)
authRouter.post("/forgot-password", emailRateLimit, validate(forgotPasswordSchema), ctrl.forgotPassword)
authRouter.post("/reset-password", authRateLimit, validate(resetPasswordSchema), ctrl.resetPassword)
authRouter.post("/accept-invite", authRateLimit, validate(acceptInviteSchema), ctrl.acceptInvite)
