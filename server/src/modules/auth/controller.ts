// server/src/modules/auth/controller.ts
import { Request, Response, NextFunction } from "express"
import * as authService from "./service"
import { env } from "../../config/env"
import { signStepUpToken } from "../../lib/jwt"
import { buildNewDeviceLoginEmail } from "../notifications/templates"
import { mail } from "../../lib/mail"

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
    const result = await authService.login(req.body)
    if (result.type === "mfa_required") {
      // Password was correct but TOTP is required — return a short-lived challenge token
      res.json({ data: { mfaRequired: true, mfaToken: result.mfaToken } })
      return
    }
    setRefreshCookie(res, result.refreshToken)
    res.json({ data: { accessToken: result.accessToken, mustChangePassword: result.mustChangePassword } })

    // Send NEW_DEVICE_LOGIN alert for staff roles (non-blocking)
    void (async () => {
      try {
        const { prisma } = await import("../../lib/prisma")
        const jwt = await import("jsonwebtoken")
        const decoded = jwt.default.decode(result.accessToken) as { sub?: string } | null
        const userId = decoded?.sub
        if (!userId) return
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, email: true, fullName: true, preferredLang: true } })
        const staffRoles = ["DOCTOR", "INSTITUTION_ADMIN", "SUPER_ADMIN"]
        if (user?.email && staffRoles.includes(user.role)) {
          const ip = req.ip ?? "unknown"
          const tpl = buildNewDeviceLoginEmail(
            { fullName: user.fullName, time: new Date(), deviceInfo: ip },
            user.preferredLang as "ar" | "fr"
          )
          await mail.send({ to: user.email, ...tpl })
        }
      } catch { /* non-fatal */ }
    })()
  } catch (err) {
    next(err)
  }
}

export async function loginTotp(req: Request, res: Response, next: NextFunction) {
  try {
    const { mfaToken, code } = req.body
    const result = await authService.loginWithTotp(mfaToken, code)
    setRefreshCookie(res, result.refreshToken)
    res.json({ data: { accessToken: result.accessToken, mustChangePassword: result.mustChangePassword } })
  } catch (err) {
    next(err)
  }
}

export async function loginRecoveryCode(req: Request, res: Response, next: NextFunction) {
  try {
    const { mfaToken, recoveryCode } = req.body
    const result = await authService.loginWithRecoveryCode(mfaToken, recoveryCode)
    setRefreshCookie(res, result.refreshToken)
    res.json({ data: { accessToken: result.accessToken, mustChangePassword: result.mustChangePassword } })
  } catch (err) {
    next(err)
  }
}

export async function mfaSetup(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) { res.status(401).json({ error: "Unauthorized" }); return }
    const result = await authService.setupTotp(req.user.sub)
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function mfaEnable(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) { res.status(401).json({ error: "Unauthorized" }); return }
    const codes = await authService.enableTotp(req.user.sub, req.body.code)
    res.json({ data: { recoveryCodes: codes, message: "Two-factor authentication has been enabled." } })
  } catch (err) { next(err) }
}

export async function mfaDisable(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) { res.status(401).json({ error: "Unauthorized" }); return }
    await authService.disableTotp(req.user.sub, req.body.password)
    res.json({ data: { ok: true } })
  } catch (err) { next(err) }
}

export async function mfaRecoveryCodes(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) { res.status(401).json({ error: "Unauthorized" }); return }
    const codes = await authService.regenerateRecoveryCodes(req.user.sub, req.body.code)
    res.json({ data: { recoveryCodes: codes } })
  } catch (err) { next(err) }
}

export async function mfaStatus(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) { res.status(401).json({ error: "Unauthorized" }); return }
    const status = await authService.getMfaStatus(req.user.sub)
    res.json({ data: status })
  } catch (err) { next(err) }
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

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) { res.status(401).json({ error: "Unauthorized" }); return }
    const { prisma } = await import("../../lib/prisma")
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      select: {
        id: true,
        role: true,
        fullName: true,
        email: true,
        phone: true,
        emailVerifiedAt: true,
        preferredLang: true,
        consentAcceptedAt: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
      },
    })
    if (!user || !user.isActive) { res.status(401).json({ error: "Account not found or deactivated" }); return }
    res.json({
      data: {
        ...req.user,           // keep JWT fields (mfaSetupRequired, mfaVerified, etc.)
        fullName: user.fullName,
        email: user.email ?? req.user.email,
        phone: user.phone ?? req.user.phone,
        emailVerifiedAt: user.emailVerifiedAt,
        preferredLang: user.preferredLang,
        consentAcceptedAt: user.consentAcceptedAt,
        createdAt: user.createdAt,
      },
    })
  } catch (err) { next(err) }
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

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) { res.status(401).json({ error: "Unauthorized" }); return }
    const user = await authService.updateProfile(req.user.sub, req.body)
    res.json({ data: user })
  } catch (err) { next(err) }
}

export async function addEmail(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) { res.status(401).json({ error: "Unauthorized" }); return }
    await authService.addEmail(req.user.sub, req.body.email)
    res.json({ data: { message: "Verification email sent." } })
  } catch (err) { next(err) }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) { res.status(401).json({ error: "Unauthorized" }); return }
    const rawToken = req.cookies[REFRESH_COOKIE]
    await authService.changePassword(req.user.sub, req.body.currentPassword, req.body.newPassword, rawToken)
    res.json({ data: { ok: true } })
  } catch (err) { next(err) }
}

export async function listSessions(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) { res.status(401).json({ error: "Unauthorized" }); return }
    const sessions = await authService.listSessions(req.user.sub)
    res.json({ data: sessions })
  } catch (err) { next(err) }
}

export async function revokeOtherSessions(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) { res.status(401).json({ error: "Unauthorized" }); return }
    const rawToken = req.cookies[REFRESH_COOKIE]
    const revoked = await authService.revokeOtherSessions(req.user.sub, rawToken)
    res.json({ data: { revoked } })
  } catch (err) { next(err) }
}

export async function stepUp(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.sub) { res.status(401).json({ error: "Unauthorized" }); return }
    // Verify current password
    const { prisma } = await import("../../lib/prisma")
    const argon2 = await import("argon2")
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } })
    if (!user?.passwordHash) { res.status(401).json({ error: "Unauthorized" }); return }
    const valid = await argon2.default.verify(user.passwordHash, req.body.password)
    if (!valid) {
      res.status(401).json({ error: "Invalid password", code: "INVALID_PASSWORD" })
      return
    }
    const stepUpToken = signStepUpToken(req.user.sub)
    res.json({ data: { stepUpToken } })
  } catch (err) { next(err) }
}

