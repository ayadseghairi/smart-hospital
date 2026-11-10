// server/src/modules/assistant/routes.ts
import { Router } from "express"
import { z } from "zod"
import { validate } from "../../middleware/validate"
import { reply } from "./engine"

const messageSchema = z.object({
  message: z.string().min(1).max(500),
  lang: z.enum(["ar", "fr"]).default("ar"),
})

export const assistantRouter = Router()

assistantRouter.post("/message", validate(messageSchema), (req, res) => {
  const { message, lang } = req.body
  const result = reply(message, lang)
  res.json({ data: result })
})
