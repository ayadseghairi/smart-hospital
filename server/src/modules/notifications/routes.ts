// server/src/modules/notifications/routes.ts
import { Router } from "express"
import { authenticate } from "../../middleware/auth"
import { prisma } from "../../lib/prisma"
import { z } from "zod"
import { validate } from "../../middleware/validate"

const prefsSchema = z.object({
  emailReminders: z.boolean().optional(),
  emailDigest: z.boolean().optional(),
})

export const notificationsRouter = Router()

notificationsRouter.get("/preferences", authenticate, async (req, res, next) => {
  try {
    const prefs = await prisma.notificationPreference.upsert({
      where: { userId: req.user!.sub },
      create: { userId: req.user!.sub },
      update: {},
    })
    res.json({ data: prefs })
  } catch (err) { next(err) }
})

notificationsRouter.patch(
  "/preferences",
  authenticate,
  validate(prefsSchema),
  async (req, res, next) => {
    try {
      const prefs = await prisma.notificationPreference.upsert({
        where: { userId: req.user!.sub },
        create: { userId: req.user!.sub, ...req.body },
        update: req.body,
      })
      res.json({ data: prefs })
    } catch (err) { next(err) }
  }
)
