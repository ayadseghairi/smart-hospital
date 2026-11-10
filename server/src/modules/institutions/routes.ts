// server/src/modules/institutions/routes.ts
import { Router } from "express"
import { validate } from "../../middleware/validate"
import { listInstitutionsSchema } from "./schema"
import * as ctrl from "./controller"

export const institutionsRouter = Router()

institutionsRouter.get("/", validate(listInstitutionsSchema, "query"), ctrl.list)
institutionsRouter.get("/:id", ctrl.getOne)
institutionsRouter.get("/:id/doctors", ctrl.getDoctors)
institutionsRouter.get("/:id/services", ctrl.getServices)
