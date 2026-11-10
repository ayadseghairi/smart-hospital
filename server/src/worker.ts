// server/src/worker.ts
// Background worker: runs the pg-boss job queue and scheduled tasks
import PgBoss from "pg-boss"
import { env } from "./config/env"
import { logger } from "./lib/logger"
import { prisma } from "./lib/prisma"
import { processNotificationJob } from "./modules/notifications/processor"
import { scheduleDailyDigests } from "./modules/notifications/scheduler"
import { reminderSweep } from "./modules/appointments/reminderSweep"

const REMINDER_JOB = "send-notification"
const SWEEP_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

async function main() {
  await prisma.$connect()

  const boss = new PgBoss(env.DATABASE_URL)
  await boss.start()
  logger.info("pg-boss worker started")

  // ── Job handlers ──
  await boss.work(REMINDER_JOB, async (job) => {
    await processNotificationJob(job.data as { notificationId: string })
  })

  // ── Safety sweep every 5 minutes ──
  // Finds confirmed appointments with due reminders that haven't been sent yet
  // Idempotency keys prevent double sends
  setInterval(async () => {
    try {
      await reminderSweep(boss)
    } catch (err) {
      logger.error(err, "reminder sweep failed")
    }
  }, SWEEP_INTERVAL_MS)

  // ── Doctor daily digest (scheduled at DOCTOR_DIGEST_HOUR in Africa/Algiers) ──
  scheduleDailyDigests(boss)

  logger.info("worker ready")
}

main().catch((err) => {
  logger.error(err, "worker crashed")
  process.exit(1)
})
