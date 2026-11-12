// server/src/lib/mail.ts
// MailTransport interface with SMTP (nodemailer) and console implementations.
// Never log SMTP_PASS, tokens or full email bodies in production.
import crypto from "crypto"
import nodemailer, { type Transporter } from "nodemailer"
import { env } from "../config/env"
import { logger } from "./logger"

export interface MailAttachment {
  filename: string
  content: Buffer | string
  contentType: string
  /** Set to provide CID for inline images (e.g. logo) */
  cid?: string
}

export interface MailMessage {
  to: string
  subject: string
  html: string
  text: string
  /** Additional arbitrary headers */
  headers?: Record<string, string>
  attachments?: MailAttachment[]
}

export interface MailTransport {
  send(msg: MailMessage): Promise<void>
}

// ── SMTP implementation ────────────────────────────────────────────────────

class SmtpMailTransport implements MailTransport {
  private transporter: Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST!,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE, // true = implicit TLS (port 465)
      // requireTLS = true enforces STARTTLS upgrade on port 587 and rejects
      // cleartext connections. Never allow rejectUnauthorized: false in production.
      requireTLS: !env.SMTP_SECURE, // if not implicit TLS, require STARTTLS
      auth: env.SMTP_USER
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
      tls: {
        // Enforce server certificate validation in production
        rejectUnauthorized: env.NODE_ENV === "production",
      },
    })
  }

  async send(msg: MailMessage): Promise<void> {
    const messageId = `<${crypto.randomUUID()}@${new URL(env.APP_BASE_URL).hostname}>`

    await this.transporter.sendMail({
      messageId,
      from: `"${env.MAIL_FROM_NAME}" <${env.MAIL_FROM_ADDRESS}>`,
      replyTo: env.MAIL_REPLY_TO || undefined,
      to: msg.to,
      subject: msg.subject,
      html: msg.html,
      text: msg.text,
      headers: {
        "Auto-Submitted": "auto-generated",
        ...msg.headers,
      },
      attachments: msg.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
        cid: a.cid,
      })),
    })
    // Log metadata only — no credentials, no body, no tokens
    logger.info({ to: msg.to, subject: msg.subject, messageId }, "email sent")
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
    if (msg.headers) {
      for (const [k, v] of Object.entries(msg.headers)) {
        console.log(`${k}: ${v}`)
      }
    }
    console.log("BODY:")
    console.log(msg.text)
    console.log("─".repeat(60))
  }
}

// ── Singleton ──────────────────────────────────────────────────────────────

export const mail: MailTransport = env.MAIL_ENABLED
  ? new SmtpMailTransport()
  : new ConsoleMailTransport()
