// server/src/server.ts
import { env } from "./config/env"
import app from "./app"
import { logger } from "./lib/logger"
import { prisma } from "./lib/prisma"

async function main() {
  // Verify DB connection
  await prisma.$connect()
  logger.info("database connected")

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
