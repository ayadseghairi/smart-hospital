// server/src/modules/appointments/reminderSweep.ts
// Safety sweep: find confirmed appointments with due reminders not yet enqueued.
// Idempotency keys make this safe to run repeatedly.
import PgBoss from "pg-boss"
import { prisma } from "../../lib/prisma"
import { reminderOffsets } from "../../config/env"
import { logger } from "../../lib/logger"

const REMINDER_JOB = "send-notification"

export async function reminderSweep(boss: PgBoss): Promise<void> {
  const now = new Date()

  // Look ahead for all confirmed appointments in the next 25 hours
  const lookAheadMs = (Math.max(...reminderOffsets) + 1) * 60 * 60 * 1000
  const windowEnd = new Date(now.getTime() + lookAheadMs)

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      startsAt: { gte: now, lte: windowEnd },
    },
    include: {
      patient: { select: { id: true, preferredLang: true } },
      doctor: { include: { user: { select: { id: true, preferredLang: true } } } },
    },
  })

  for (const appt of appointments) {
    for (const offsetHours of reminderOffsets) {
      const triggerAt = new Date(appt.startsAt.getTime() - offsetHours * 60 * 60 * 1000)
      if (triggerAt <= now) continue // already past

      // Patient reminder
      const patientKey = `APPT_REMINDER:${appt.id}:${offsetHours}:${appt.patient.id}`
      const existing = await prisma.notification.findUnique({
        where: { idempotencyKey: patientKey },
      })
      if (!existing) {
        const notification = await prisma.notification.create({
          data: {
            userId: appt.patient.id,
            kind: "APPT_REMINDER",
            channel: "EMAIL",
            locale: appt.patient.preferredLang,
            payload: { appointmentId: appt.id },
            idempotencyKey: patientKey,
            status: "QUEUED",
          },
        })
        await boss.sendAfter(
          REMINDER_JOB,
          { notificationId: notification.id },
          {},
          triggerAt
        )
      }

      // Doctor reminder
      if (appt.doctor) {
        const doctorKey = `APPT_REMINDER:${appt.id}:${offsetHours}:${appt.doctor.user.id}`
        const existingDoc = await prisma.notification.findUnique({
          where: { idempotencyKey: doctorKey },
        })
        if (!existingDoc) {
          const notification = await prisma.notification.create({
            data: {
              userId: appt.doctor.user.id,
              kind: "APPT_REMINDER",
              channel: "EMAIL",
              locale: appt.doctor.user.preferredLang,
              payload: { appointmentId: appt.id },
              idempotencyKey: doctorKey,
              status: "QUEUED",
            },
          })
          await boss.sendAfter(
            REMINDER_JOB,
            { notificationId: notification.id },
            {},
            triggerAt
          )
        }
      }
    }
  }

  logger.debug({ count: appointments.length }, "reminder sweep complete")
}
