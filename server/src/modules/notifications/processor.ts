// server/src/modules/notifications/processor.ts
// Processes a single notification job from the queue
import { prisma } from "../../lib/prisma"
import { mail } from "../../lib/mail"
import { logger } from "../../lib/logger"
import { buildAppointmentReminderEmail } from "./templates"

const MAX_ATTEMPTS = 5

export async function processNotificationJob(data: { notificationId: string }): Promise<void> {
  const notif = await prisma.notification.findUnique({
    where: { id: data.notificationId },
    include: { user: { select: { email: true, preferredLang: true } } },
  })

  if (!notif) {
    logger.warn({ notificationId: data.notificationId }, "notification not found")
    return
  }

  // Skip if already handled or max attempts reached
  if (notif.status === "SENT" || notif.status === "SKIPPED") return
  if (notif.attempts >= MAX_ATTEMPTS) {
    await prisma.notification.update({
      where: { id: notif.id },
      data: { status: "FAILED", lastError: "max attempts reached" },
    })
    return
  }

  await prisma.notification.update({
    where: { id: notif.id },
    data: { attempts: { increment: 1 } },
  })

  try {
    const email = notif.user.email
    if (!email) {
      await prisma.notification.update({ where: { id: notif.id }, data: { status: "SKIPPED" } })
      return
    }

    const lang = notif.locale

    if (notif.kind === "APPT_REMINDER") {
      const payload = notif.payload as {
        appointmentId: string
        offsetHours: number
      }
      const appt = await prisma.appointment.findUnique({
        where: { id: payload.appointmentId },
        include: {
          doctor: { include: { user: { select: { fullName: true } } } },
          institution: { select: { nameAr: true, nameFr: true } },
        },
      })

      if (!appt || appt.status !== "CONFIRMED") {
        // Appointment was cancelled — skip
        await prisma.notification.update({ where: { id: notif.id }, data: { status: "SKIPPED" } })
        return
      }

      const doctorName = appt.doctor?.user.fullName ?? "الطبيب"
      const institutionName = lang === "ar" ? appt.institution.nameAr : appt.institution.nameFr

      const tpl = buildAppointmentReminderEmail(
        { doctorName, institutionName, startsAt: appt.startsAt },
        lang
      )
      await mail.send({ to: email, ...tpl })
    }
    // Add other kinds (APPT_CONFIRMED, DOCTOR_DAILY_DIGEST, etc.) here

    await prisma.notification.update({
      where: { id: notif.id },
      data: { status: "SENT", sentAt: new Date() },
    })
  } catch (err) {
    const lastError = err instanceof Error ? err.message : String(err)
    await prisma.notification.update({
      where: { id: notif.id },
      data: { lastError },
    })
    throw err // re-throw so pg-boss retries
  }
}
