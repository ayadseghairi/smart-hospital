// server/src/modules/doctors/routes.ts
import { Router } from "express"
import { validate } from "../../middleware/validate"
import { listDoctorsSchema, slotsQuerySchema } from "./schema"
import * as ctrl from "./controller"

export const doctorsRouter = Router()

doctorsRouter.get("/", validate(listDoctorsSchema, "query"), ctrl.list)
doctorsRouter.get("/:id", ctrl.getOne)
doctorsRouter.get("/:id/slots", validate(slotsQuerySchema, "query"), ctrl.getSlots)
