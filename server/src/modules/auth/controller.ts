// server/src/modules/auth/controller.ts
import { Request, Response, NextFunction } from "express"
import * as authService from "./service"
import { env } from "../../config/env"

const REFRESH_COOKIE = "delin_rt"

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
    path: "/api/v1/auth",
  })
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.registerPatient(req.body)
    res.status(201).json({ data: result })
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { accessToken, refreshToken } = await authService.login(req.body)
    setRefreshCookie(res, refreshToken)
    res.json({ data: { accessToken } })
  } catch (err) {
    next(err)
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const rawToken = req.cookies[REFRESH_COOKIE]
    if (!rawToken) {
      res.status(401).json({ error: "No refresh token" })
      return
    }
    const { accessToken, refreshToken } = await authService.refreshAccessToken(rawToken)
    setRefreshCookie(res, refreshToken)
    res.json({ data: { accessToken } })
  } catch (err) {
    next(err)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const rawToken = req.cookies[REFRESH_COOKIE]
    if (rawToken) await authService.logout(rawToken)
    res.clearCookie(REFRESH_COOKIE, { path: "/api/v1/auth" })
    res.json({ data: { ok: true } })
  } catch (err) {
    next(err)
  }
}

export async function me(req: Request, res: Response) {
  res.json({ data: req.user })
}

export async function verifyEmail(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.verifyEmail(req.body.token)
    res.json({ data: { ok: true } })
  } catch (err) {
    next(err)
  }
}

export async function resendVerification(req: Request, res: Response, next: NextFunction) {
  try {
    // Uses generic response regardless — never leak account existence
    if (req.user?.email) {
      const user = await import("../../lib/prisma").then(({ prisma }) =>
        prisma.user.findUnique({ where: { id: req.user!.sub } })
      )
      if (user?.email && !user.emailVerifiedAt) {
        await authService.sendEmailVerification(user.id, user.email, user.preferredLang)
      }
    }
    res.json({ data: { message: "If applicable, a verification email was sent." } })
  } catch (err) {
    next(err)
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const msg = await authService.forgotPassword(req.body.email)
    res.json({ data: { message: msg } })
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.resetPassword(req.body.token, req.body.password)
    res.json({ data: { ok: true } })
  } catch (err) {
    next(err)
  }
}

export async function acceptInvite(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.acceptInvite(req.body.token, req.body.password)
    res.json({ data: { ok: true } })
  } catch (err) {
    next(err)
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) { res.status(401).json({ error: "Unauthorized" }); return }
    await authService.deleteOwnAccount(req.user.sub)
    res.clearCookie("delin_rt", { path: "/api/v1/auth" })
    res.json({ data: { ok: true } })
  } catch (err) {
    next(err)
  }
}

export async function exportData(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) { res.status(401).json({ error: "Unauthorized" }); return }
    const data = await authService.exportOwnData(req.user.sub)
    res.setHeader("Content-Disposition", `attachment; filename="delin-export-${req.user.sub}.json"`)
    res.setHeader("Content-Type", "application/json; charset=utf-8")
    res.json(data)
  } catch (err) {
    next(err)
  }
}
