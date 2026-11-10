// server/src/modules/appointments/controller.ts
import { Request, Response, NextFunction } from "express"
import * as svc from "./service"

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const appt = await svc.createAppointment(req.user!.sub, req.body)
    res.status(201).json({ data: appt })
  } catch (err) { next(err) }
}

export async function mine(req: Request, res: Response, next: NextFunction) {
  try {
    const appts = await svc.getPatientAppointments(req.user!.sub)
    res.json({ data: appts })
  } catch (err) { next(err) }
}

export async function cancel(req: Request, res: Response, next: NextFunction) {
  try {
    const appt = await svc.cancelAppointment(
      req.params.id,
      req.user!.sub,
      req.user!.role
    )
    res.json({ data: appt })
  } catch (err) { next(err) }
}

export async function doctorList(req: Request, res: Response, next: NextFunction) {
  try {
    // Look up doctor record by userId
    const { prisma } = await import("../../lib/prisma")
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user!.sub } })
    if (!doctor) { res.status(404).json({ error: "Doctor profile not found" }); return }
    const appts = await svc.getDoctorAppointments(doctor.id)
    res.json({ data: appts })
  } catch (err) { next(err) }
}

export async function doctorUpdateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const appt = await svc.updateDoctorAppointmentStatus(
      req.params.id,
      req.user!.sub,
      req.body.status
    )
    res.json({ data: appt })
  } catch (err) { next(err) }
}
