// server/src/modules/doctors/controller.ts
import { Request, Response, NextFunction } from "express"
import * as svc from "./service"

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await svc.listDoctors(req.query as unknown as Parameters<typeof svc.listDoctors>[0])
    res.json({ data: result })
  } catch (err) { next(err) }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const doctor = await svc.getDoctor(req.params.id)
    res.json({ data: doctor })
  } catch (err) { next(err) }
}

export async function getSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const slots = await svc.getDoctorSlots(req.params.id, req.query.date as string)
    res.json({ data: slots })
  } catch (err) { next(err) }
}
