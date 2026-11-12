// server/src/server.ts
import "dotenv/config"
import { env } from "./config/env"
import app from "./app"
import { logger } from "./lib/logger"
import { prisma } from "./lib/prisma"
import { bootstrapSuperAdmin } from "./lib/bootstrap"

async function main() {
  // Verify DB connection
  await prisma.$connect()
  logger.info("database connected")

  // Bootstrap the first SUPER_ADMIN from env vars (idempotent — no-op if one exists)
  await bootstrapSuperAdmin()

  app.listen(env.PORT, () => {
    logger.info(
      { port: env.PORT, env: env.NODE_ENV, app: env.APP_NAME },
      "server started"
    )
  })
}

main().catch((err) => {
  logger.error(err, "failed to start server")
  process.exit(1)
})
