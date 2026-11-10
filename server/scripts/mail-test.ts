// server/scripts/mail-test.ts
// Send a test email to validate SMTP settings.
// Usage: npm run mail:test -- recipient@example.dz

import { mail } from "../src/lib/mail"
import { env } from "../src/config/env"

const to = process.argv[2]
if (!to) {
  console.error("Usage: npm run mail:test -- recipient@example.dz")
  process.exit(1)
}

async function main() {
  console.log(`Sending test email to: ${to}`)
  console.log(`MAIL_ENABLED: ${env.MAIL_ENABLED}`)
  if (env.MAIL_ENABLED) {
    console.log(`SMTP: ${env.SMTP_HOST}:${env.SMTP_PORT}`)
  }

  await mail.send({
    to,
    subject: `Test email — ${env.APP_NAME}`,
    html: `<p>This is a test email from <strong>${env.APP_NAME}</strong>.</p><p>If you received this, your SMTP settings are correct.</p>`,
    text: `Test email from ${env.APP_NAME}.\n\nIf you received this, your SMTP settings are correct.`,
  })

  console.log("✓ Test email sent successfully")
}

main().catch((err) => {
  console.error("✗ Failed to send test email:")
  console.error(err.message)
  process.exit(1)
})
