// server/src/modules/appointments/service.ts
import { Prisma } from "@prisma/client"
import { prisma } from "../../lib/prisma"
import { createError } from "../../middleware/errorHandler"
import type { z } from "zod"
import type { createAppointmentSchema } from "./schema"

type CreateInput = z.infer<typeof createAppointmentSchema>

export async function createAppointment(patientId: string, input: CreateInput) {
  // Patient must have a verified email before booking
  const patient = await prisma.user.findUnique({
    where: { id: patientId },
    select: { emailVerifiedAt: true, email: true },
  })
  if (!patient) throw createError("Patient not found", 404)
  if (!patient.emailVerifiedAt) {
    throw createError(
      "You must verify your email address before booking an appointment",
      403
    )
  }

  const startsAt = new Date(input.startsAt)

  // Check slot availability within a transaction to prevent double-booking
  const appointment = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    if (input.doctorId) {
      const conflict = await tx.appointment.findFirst({
        where: {
          doctorId: input.doctorId,
          startsAt,
          status: { notIn: ["CANCELLED"] },
        },
      })
      if (conflict) throw createError("This slot is no longer available. Please choose another.", 409)
    }

    // Calculate end time based on doctor slot rule or default 30 min
    const endsAt = new Date(startsAt.getTime() + 30 * 60 * 1000)

    return tx.appointment.create({
      data: {
        patientId,
        doctorId: input.doctorId,
        serviceId: input.serviceId,
        institutionId: input.institutionId,
        startsAt,
        endsAt,
        reason: input.reason,
      },
    })
  })

  return appointment
}

export async function getPatientAppointments(patientId: string) {
  return prisma.appointment.findMany({
    where: { patientId },
    include: {
      doctor: { include: { user: { select: { fullName: true } }, specialty: true } },
      service: true,
      institution: { select: { nameAr: true, nameFr: true } },
    },
    orderBy: { startsAt: "desc" },
  })
}

export async function getDoctorAppointments(doctorId: string) {
  return prisma.appointment.findMany({
    where: { doctorId },
    include: {
      patient: { select: { fullName: true, phone: true } },
      service: true,
      institution: { select: { nameAr: true, nameFr: true } },
    },
    orderBy: { startsAt: "asc" },
  })
}

export async function cancelAppointment(
  appointmentId: string,
  cancelledById: string,
  role: string
) {
  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } })
  if (!appt) throw createError("Appointment not found", 404)

  // Ownership check: patient can only cancel their own, doctor their own
  if (role === "PATIENT" && appt.patientId !== cancelledById) {
    throw createError("Forbidden", 403)
  }
  if (role === "DOCTOR" && appt.doctorId !== cancelledById) {
    throw createError("Forbidden", 403)
  }

  if (appt.status === "CANCELLED") throw createError("Appointment is already cancelled", 400)
  if (appt.status === "COMPLETED") throw createError("Cannot cancel a completed appointment", 400)

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED", cancelledById },
  })
}

export async function updateDoctorAppointmentStatus(
  appointmentId: string,
  doctorUserId: string,
  status: "CONFIRMED" | "COMPLETED" | "NO_SHOW" | "CANCELLED"
) {
  const doctor = await prisma.doctor.findUnique({ where: { userId: doctorUserId } })
  if (!doctor) throw createError("Doctor profile not found", 404)

  const appt = await prisma.appointment.findUnique({ where: { id: appointmentId } })
  if (!appt) throw createError("Appointment not found", 404)
  if (appt.doctorId !== doctor.id) throw createError("Forbidden", 403)

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      status,
      ...(status === "CANCELLED" ? { cancelledById: doctorUserId } : {}),
    },
  })
}
