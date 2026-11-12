// server/src/middleware/requirePasswordChange.ts
// Server-side gate: blocks every authenticated endpoint except the three
// allowed ones when the user has mustChangePassword = true in their JWT.
// The frontend redirect is convenience; this is the real control.
import { Request, Response, NextFunction } from "express"

// Endpoints that remain accessible while a password change is required
const ALLOWED_PATHS = new Set([
  "/api/v1/auth/me",
  "/api/v1/auth/password",
  "/api/v1/auth/logout",
])

export function requirePasswordChange(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Only block when the user IS authenticated and the flag is set
  if (req.user?.mustChangePassword) {
    const path = req.path.split("?")[0]
    const fullPath = req.originalUrl.split("?")[0]

    if (!ALLOWED_PATHS.has(fullPath) && !ALLOWED_PATHS.has(path)) {
      res.status(403).json({
        error: "You must change your password before continuing",
        code: "PASSWORD_CHANGE_REQUIRED",
      })
      return
    }
  }
  next()
}
