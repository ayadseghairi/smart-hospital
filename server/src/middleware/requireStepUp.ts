// server/src/middleware/requireStepUp.ts
// Step-up re-authentication for sensitive admin actions.
// The client must first POST /auth/step-up (password re-entry) to get a 10-minute
// step-up token, then pass it as X-Step-Up-Token header on the sensitive request.
import { Request, Response, NextFunction } from "express"
import { verifyStepUpToken } from "../lib/jwt"

export function requireStepUp(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers["x-step-up-token"] as string | undefined
  if (!token) {
    res.status(403).json({
      error: "This action requires recent password verification",
      code: "STEP_UP_REQUIRED",
    })
    return
  }
  try {
    const payload = verifyStepUpToken(token)
    // Step-up token must belong to the authenticated user
    if (!req.user || payload.sub !== req.user.sub) {
      res.status(403).json({
        error: "Step-up token does not match the authenticated user",
        code: "STEP_UP_INVALID",
      })
      return
    }
    next()
  } catch {
    res.status(403).json({
      error: "Step-up token is invalid or expired",
      code: "STEP_UP_EXPIRED",
    })
  }
}
