// server/src/middleware/auth.ts
import { Request, Response, NextFunction } from "express"
import { verifyAccessToken, AccessTokenPayload } from "../lib/jwt"

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }
  const token = authHeader.slice(7)
  try {
    req.user = verifyAccessToken(token)
    next()
  } catch {
    res.status(401).json({ error: "Invalid or expired token" })
  }
}

export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith("Bearer ")) {
    try {
      req.user = verifyAccessToken(authHeader.slice(7))
    } catch {
      // ignore — optional auth
    }
  }
  next()
}
