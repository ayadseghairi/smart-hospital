// server/src/modules/institutions/controller.ts
import { Request, Response, NextFunction } from "express"
import * as svc from "./service"

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await svc.listInstitutions(req.query as unknown as Parameters<typeof svc.listInstitutions>[0])
    res.json({ data: result })
  } catch (err) {
    next(err)
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const institution = await svc.getInstitution(req.params.id)
    res.json({ data: institution })
  } catch (err) {
    next(err)
  }
}

export async function getDoctors(req: Request, res: Response, next: NextFunction) {
  try {
    const doctors = await svc.getInstitutionDoctors(req.params.id)
    res.json({ data: doctors })
  } catch (err) {
    next(err)
  }
}

export async function getServices(req: Request, res: Response, next: NextFunction) {
  try {
    const services = await svc.getInstitutionServices(
      req.params.id,
      req.query.category as string | undefined
    )
    res.json({ data: services })
  } catch (err) {
    next(err)
  }
}
