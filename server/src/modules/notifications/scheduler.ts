// server/src/modules/notifications/scheduler.ts
// Schedules the doctor daily digest job
import PgBoss from "pg-boss"
import { env } from "../../config/env"
import { logger } from "../../lib/logger"

export function scheduleDailyDigests(boss: PgBoss): void {
  // Schedule at DOCTOR_DIGEST_HOUR in Africa/Algiers (UTC+1, no DST)
  const hourUtc = (env.DOCTOR_DIGEST_HOUR - 1 + 24) % 24
  const cronExpr = `0 ${hourUtc} * * *` // daily at UTC equivalent

  boss.schedule("send-doctor-digest", cronExpr, {}).catch((err) => {
    logger.error(err, "failed to schedule doctor digest")
  })

  boss.work("send-doctor-digest", async () => {
    // In Phase 5: query all active doctors, build daily digest, send via Notification outbox
    logger.info("doctor daily digest job fired (implementation in Phase 5)")
  })
}
