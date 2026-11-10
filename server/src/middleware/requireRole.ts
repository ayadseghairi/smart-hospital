// server/src/middleware/requireRole.ts
import { Request, Response, NextFunction } from "express"
import { UserRole } from "@prisma/client"

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" })
      return
    }
    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({ error: "Forbidden" })
      return
    }
    next()
  }
}

// Convenience guard — only super admin can create accounts
export function canCreateAccounts(req: Request, res: Response, next: NextFunction): void {
  requireRole(UserRole.SUPER_ADMIN)(req, res, next)
}
