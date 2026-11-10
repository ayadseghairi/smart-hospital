// server/src/modules/contact/routes.ts
import { Router } from "express"
import { validate } from "../../middleware/validate"
import { emailRateLimit } from "../../middleware/rateLimit"
import * as ctrl from "./controller"
import { contactSchema } from "./schema"

export const contactRouter = Router()

contactRouter.post("/", emailRateLimit, validate(contactSchema), ctrl.submitContact)
