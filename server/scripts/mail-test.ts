// server/scripts/mail-test.ts
// Send a test email using the real template to validate SMTP settings.
// Usage: npm run mail:test -- recipient@example.dz [ar|fr]
// Prints SMTP result (success or sanitized error) — never prints credentials.

import { mail } from "../src/lib/mail"
import { env } from "../src/config/env"
import { buildTestEmail } from "../src/modules/notifications/templates"

const to = process.argv[2]
const lang = (process.argv[3] ?? "fr") as "ar" | "fr"

if (!to) {
  console.error("Usage: npm run mail:test -- recipient@example.dz [ar|fr]")
  process.exit(1)
}

// Validate it looks like an email to avoid accidentally printing a secret
if (!to.includes("@") || to.includes(" ")) {
  console.error("Error: first argument must be an email address")
  process.exit(1)
}

async function main() {
  console.log(`Sending test email to: ${to}`)
  console.log(`Language: ${lang}`)
  console.log(`MAIL_ENABLED: ${env.MAIL_ENABLED}`)
  if (env.MAIL_ENABLED) {
    // Print host:port only — never credentials
    console.log(`SMTP server: ${env.SMTP_HOST}:${env.SMTP_PORT} (secure=${env.SMTP_SECURE})`)
  }

  const tpl = buildTestEmail(lang)

  try {
    await mail.send({ to, ...tpl })
    console.log("✓ Test email sent successfully")
  } catch (err) {
    // Sanitize: never print SMTP credentials, tokens or passwords from the error
    const message = err instanceof Error ? err.message : String(err)
    // Strip any potential credential-like strings (basic heuristic)
    const sanitized = message
      .replace(/password[=:][^\s,)]+/gi, "password=[REDACTED]")
      .replace(/user[=:][^\s,)@]+@/gi, "user=[REDACTED]@")
    console.error("✗ Failed to send test email:")
    console.error("  " + sanitized)
    process.exit(1)
  }
}

main()
