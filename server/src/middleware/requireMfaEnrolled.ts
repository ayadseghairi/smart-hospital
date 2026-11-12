// server/src/middleware/requireMfaEnrolled.ts
// Server-side gate for /admin/* routes: a SUPER_ADMIN without TOTP enrollment
// is blocked until they complete 2FA setup at /account/security/2fa-setup.
// The 2FA setup endpoints (/api/v1/auth/2fa/*) are allowed through always.
import { Request, Response, NextFunction } from "express"

export function requireMfaEnrolled(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user?.mfaSetupRequired) {
    res.status(403).json({
      error: "Two-factor authentication setup is required before accessing the admin panel",
      code: "MFA_SETUP_REQUIRED",
    })
    return
  }
  next()
}
