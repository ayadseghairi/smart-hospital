// server/src/lib/mail.ts
// MailTransport interface with SMTP (nodemailer) and console implementations.
// Never log SMTP_PASS, tokens or full email bodies in production.
import nodemailer from "nodemailer"
import { env } from "../config/env"
import { logger } from "./logger"

export interface MailMessage {
  to: string
  subject: string
  html: string
  text: string
}

export interface MailTransport {
  send(msg: MailMessage): Promise<void>
}

// ── SMTP implementation ────────────────────────────────────────────────────

class SmtpMailTransport implements MailTransport {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST!,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: env.SMTP_USER
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
    })
  }

  async send(msg: MailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_ADDRESS}>`,
      replyTo: env.MAIL_REPLY_TO || undefined,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
    })
    logger.info({ to: msg.to, subject: msg.subject }, "email sent")
  }
}

// ── Console/dev implementation ─────────────────────────────────────────────

class ConsoleMailTransport implements MailTransport {
  async send(msg: MailMessage): Promise<void> {
    logger.info(
      { to: msg.to, subject: msg.subject },
      "📧  [DEV EMAIL — not sent] See below for text body:"
    )
    // Log text body only (no HTML, no tokens in structured fields)
    console.log("─".repeat(60))
    console.log(`TO:      ${msg.to}`)
    console.log(`SUBJECT: ${msg.subject}`)
    console.log("BODY:")
    console.log(msg.text)
    console.log("─".repeat(60))
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────

export const mail: MailTransport = env.MAIL_ENABLED
  ? new SmtpMailTransport()
  : new ConsoleMailTransport()
