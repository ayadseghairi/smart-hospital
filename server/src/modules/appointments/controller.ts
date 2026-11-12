// server/src/modules/appointments/controller.ts
import { Request, Response, NextFunction } from "express"
import * as svc from "./service"
import { buildIcs } from "./ics"

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

export async function downloadIcs(req: Request, res: Response, next: NextFunction) {
  try {
    const { prisma } = await import("../../lib/prisma")
    const appt = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        doctor: { include: { user: { select: { fullName: true } }, specialty: true } },
        service: true,
        institution: { select: { nameAr: true, nameFr: true } },
      },
    })
    if (!appt) { res.status(404).json({ error: "Appointment not found" }); return }
    // Only the patient who owns the appointment may download it
    if (appt.patientId !== req.user!.sub) { res.status(403).json({ error: "Forbidden" }); return }

    const lang = (req.headers["accept-language"] ?? "ar") === "fr" ? "fr" : "ar"
    const ics = buildIcs(appt, lang)
    res.setHeader("Content-Type", "text/calendar; charset=utf-8")
    res.setHeader("Content-Disposition", `attachment; filename="appointment-${appt.id}.ics"`)
    res.send(ics)
  } catch (err) { next(err) }
}
