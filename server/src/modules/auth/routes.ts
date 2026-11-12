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
  updateProfileSchema,
  addEmailSchema,
  changePasswordSchema,
  loginTotpSchema,
  loginRecoveryCodeSchema,
  mfaEnableSchema,
  mfaDisableSchema,
  mfaRecoveryCodesSchema,
} from "./schema"

export const authRouter = Router()

authRouter.post("/register", authRateLimit, validate(registerSchema), ctrl.register)
authRouter.post("/login", authRateLimit, validate(loginSchema), ctrl.login)
// Two-step login: TOTP challenge completion
authRouter.post("/login/2fa", authRateLimit, validate(loginTotpSchema), ctrl.loginTotp)
authRouter.post("/login/recovery-code", authRateLimit, validate(loginRecoveryCodeSchema), ctrl.loginRecoveryCode)
authRouter.post("/refresh", authRateLimit, ctrl.refresh)
authRouter.post("/logout", ctrl.logout)
authRouter.get("/me", authenticate, ctrl.me)
authRouter.post("/verify-email", validate(verifyEmailSchema), ctrl.verifyEmail)
authRouter.post("/resend-verification", emailRateLimit, authenticate, ctrl.resendVerification)
authRouter.post("/forgot-password", emailRateLimit, validate(forgotPasswordSchema), ctrl.forgotPassword)
authRouter.post("/reset-password", authRateLimit, validate(resetPasswordSchema), ctrl.resetPassword)
authRouter.post("/accept-invite", authRateLimit, validate(acceptInviteSchema), ctrl.acceptInvite)
authRouter.delete("/account", authenticate, ctrl.deleteAccount)
authRouter.get("/export", authenticate, ctrl.exportData)

// Profile & security
authRouter.patch("/profile", authenticate, validate(updateProfileSchema), ctrl.updateProfile)
authRouter.post("/add-email", emailRateLimit, authenticate, validate(addEmailSchema), ctrl.addEmail)
authRouter.patch("/password", authRateLimit, authenticate, validate(changePasswordSchema), ctrl.changePassword)
authRouter.get("/sessions", authenticate, ctrl.listSessions)
authRouter.delete("/sessions", authenticate, ctrl.revokeOtherSessions)

// Step-up re-authentication (password re-entry for sensitive admin actions)
authRouter.post("/step-up", authRateLimit, authenticate, ctrl.stepUp)

// TOTP 2FA management
authRouter.get("/2fa/status", authenticate, ctrl.mfaStatus)
authRouter.post("/2fa/setup", authRateLimit, authenticate, ctrl.mfaSetup)
authRouter.post("/2fa/enable", authRateLimit, authenticate, validate(mfaEnableSchema), ctrl.mfaEnable)
authRouter.post("/2fa/disable", authRateLimit, authenticate, validate(mfaDisableSchema), ctrl.mfaDisable)
authRouter.post("/2fa/recovery-codes", authRateLimit, authenticate, validate(mfaRecoveryCodesSchema), ctrl.mfaRecoveryCodes)
