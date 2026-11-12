// server/scripts/mail-preview.ts
// Render all email templates in both languages to .mail-preview/*.html
// Uses clearly labelled placeholder values — never real addresses, tokens or patient data.
// Usage: npm run mail:preview
// Opens files in default browser if --open flag passed.
//
// Zero-fake-data rule: sample values are render-time placeholders only.
// This script never runs in production and never sends real emails.

import path from "path"
import fs from "fs"
import { env } from "../src/config/env"
import {
  buildVerifyEmailEmail,
  buildWelcomeEmail,
  buildPasswordResetEmail,
  buildPasswordChangedEmail,
  buildInviteEmail,
  buildAdminAccountReadyEmail,
  buildApptRequestedEmail,
  buildApptConfirmedEmail,
  buildApptCancelledEmail,
  buildAppointmentReminderEmail,
  buildDoctorNewRequestEmail,
  buildDoctorDailyDigestEmail,
  buildNewDeviceLoginEmail,
  buildMfaStatusEmail,
  buildAccountStatusEmail,
  buildInstitutionStatusEmail,
  buildAlreadyRegisteredEmail,
  buildContactReceivedEmail,
  buildAdminNoticeEmail,
  buildAccountDeletionEmail,
  buildDataExportEmail,
  buildEmailChangeConfirmEmail,
  buildEmailChangedNoticeEmail,
  buildTestEmail,
} from "../src/modules/notifications/templates"

// ── Placeholder values (never real data) ──────────────────────────────────────
const PLACEHOLDER_LINK = `${env.APP_BASE_URL}/[lien-exemple]`
const PLACEHOLDER_DATE = new Date("2025-06-15T09:00:00Z")
const PLACEHOLDER_NAME_FR = "[Nom du patient]"
const PLACEHOLDER_NAME_AR = "[اسم المريض]"
const PLACEHOLDER_DOCTOR_FR = "[Nom du médecin]"
const PLACEHOLDER_DOCTOR_AR = "[اسم الطبيب]"
const PLACEHOLDER_INST_FR = "[Nom de l'établissement]"
const PLACEHOLDER_INST_AR = "[اسم المؤسسة]"

type TemplateDef = {
  name: string
  templates: { lang: "ar" | "fr"; result: { subject: string; html: string; text: string } }[]
}

const defs: TemplateDef[] = [
  {
    name: "EMAIL_VERIFY",
    templates: [
      { lang: "fr", result: buildVerifyEmailEmail(PLACEHOLDER_LINK, "fr") },
      { lang: "ar", result: buildVerifyEmailEmail(PLACEHOLDER_LINK, "ar") },
    ],
  },
  {
    name: "WELCOME",
    templates: [
      { lang: "fr", result: buildWelcomeEmail(PLACEHOLDER_NAME_FR, "fr") },
      { lang: "ar", result: buildWelcomeEmail(PLACEHOLDER_NAME_AR, "ar") },
    ],
  },
  {
    name: "PASSWORD_RESET",
    templates: [
      { lang: "fr", result: buildPasswordResetEmail(PLACEHOLDER_LINK, "fr") },
      { lang: "ar", result: buildPasswordResetEmail(PLACEHOLDER_LINK, "ar") },
    ],
  },
  {
    name: "PASSWORD_CHANGED",
    templates: [
      { lang: "fr", result: buildPasswordChangedEmail("[email@exemple.dz]", PLACEHOLDER_NAME_FR, "fr") },
      { lang: "ar", result: buildPasswordChangedEmail("[email@exemple.dz]", PLACEHOLDER_NAME_AR, "ar") },
    ],
  },
  {
    name: "INVITE",
    templates: [
      { lang: "fr", result: buildInviteEmail(PLACEHOLDER_LINK, PLACEHOLDER_NAME_FR, "fr") },
      { lang: "ar", result: buildInviteEmail(PLACEHOLDER_LINK, PLACEHOLDER_NAME_AR, "ar") },
    ],
  },
  {
    name: "ADMIN_ACCOUNT_READY",
    templates: [
      { lang: "fr", result: buildAdminAccountReadyEmail(`${env.APP_BASE_URL}/login`, "[Administrateur]", "fr") },
      { lang: "ar", result: buildAdminAccountReadyEmail(`${env.APP_BASE_URL}/login`, "[المشرف]", "ar") },
    ],
  },
  {
    name: "APPT_REQUESTED",
    templates: [
      { lang: "fr", result: buildApptRequestedEmail({ doctorName: PLACEHOLDER_DOCTOR_FR, institutionName: PLACEHOLDER_INST_FR, startsAt: PLACEHOLDER_DATE }, "fr") },
      { lang: "ar", result: buildApptRequestedEmail({ doctorName: PLACEHOLDER_DOCTOR_AR, institutionName: PLACEHOLDER_INST_AR, startsAt: PLACEHOLDER_DATE }, "ar") },
    ],
  },
  {
    name: "APPT_CONFIRMED",
    templates: [
      { lang: "fr", result: buildApptConfirmedEmail({ doctorName: PLACEHOLDER_DOCTOR_FR, institutionName: PLACEHOLDER_INST_FR, institutionAddress: "[Adresse de l'établissement]", startsAt: PLACEHOLDER_DATE, endsAt: new Date(PLACEHOLDER_DATE.getTime() + 30 * 60 * 1000), institutionLat: 35.4369, institutionLng: 7.1463 }, "fr") },
      { lang: "ar", result: buildApptConfirmedEmail({ doctorName: PLACEHOLDER_DOCTOR_AR, institutionName: PLACEHOLDER_INST_AR, institutionAddress: "[عنوان المؤسسة]", startsAt: PLACEHOLDER_DATE, endsAt: new Date(PLACEHOLDER_DATE.getTime() + 30 * 60 * 1000), institutionLat: 35.4369, institutionLng: 7.1463 }, "ar") },
    ],
  },
  {
    name: "APPT_CANCELLED",
    templates: [
      { lang: "fr", result: buildApptCancelledEmail({ doctorName: PLACEHOLDER_DOCTOR_FR, institutionName: PLACEHOLDER_INST_FR, startsAt: PLACEHOLDER_DATE, cancelReason: "[Motif de catégorie]" }, "fr") },
      { lang: "ar", result: buildApptCancelledEmail({ doctorName: PLACEHOLDER_DOCTOR_AR, institutionName: PLACEHOLDER_INST_AR, startsAt: PLACEHOLDER_DATE, cancelReason: "[فئة السبب]" }, "ar") },
    ],
  },
  {
    name: "APPT_REMINDER_24h",
    templates: [
      { lang: "fr", result: buildAppointmentReminderEmail({ doctorName: PLACEHOLDER_DOCTOR_FR, institutionName: PLACEHOLDER_INST_FR, startsAt: PLACEHOLDER_DATE, offsetHours: 24 }, "fr") },
      { lang: "ar", result: buildAppointmentReminderEmail({ doctorName: PLACEHOLDER_DOCTOR_AR, institutionName: PLACEHOLDER_INST_AR, startsAt: PLACEHOLDER_DATE, offsetHours: 24 }, "ar") },
    ],
  },
  {
    name: "DOCTOR_NEW_REQUEST",
    templates: [
      { lang: "fr", result: buildDoctorNewRequestEmail({ patientName: PLACEHOLDER_NAME_FR, startsAt: PLACEHOLDER_DATE, institutionName: PLACEHOLDER_INST_FR }, "fr") },
      { lang: "ar", result: buildDoctorNewRequestEmail({ patientName: PLACEHOLDER_NAME_AR, startsAt: PLACEHOLDER_DATE, institutionName: PLACEHOLDER_INST_AR }, "ar") },
    ],
  },
  {
    name: "DOCTOR_DAILY_DIGEST",
    templates: [
      { lang: "fr", result: buildDoctorDailyDigestEmail({ doctorName: PLACEHOLDER_DOCTOR_FR, date: PLACEHOLDER_DATE, appointments: [{ time: "09:00", patientName: "[Patient 1]", institutionName: PLACEHOLDER_INST_FR }, { time: "10:30", patientName: "[Patient 2]", institutionName: PLACEHOLDER_INST_FR }] }, "fr") },
      { lang: "ar", result: buildDoctorDailyDigestEmail({ doctorName: PLACEHOLDER_DOCTOR_AR, date: PLACEHOLDER_DATE, appointments: [{ time: "09:00", patientName: "[مريض 1]", institutionName: PLACEHOLDER_INST_AR }, { time: "10:30", patientName: "[مريض 2]", institutionName: PLACEHOLDER_INST_AR }] }, "ar") },
    ],
  },
  {
    name: "NEW_DEVICE_LOGIN",
    templates: [
      { lang: "fr", result: buildNewDeviceLoginEmail({ fullName: PLACEHOLDER_NAME_FR, time: PLACEHOLDER_DATE, deviceInfo: "[Firefox 120 / Windows]" }, "fr") },
      { lang: "ar", result: buildNewDeviceLoginEmail({ fullName: PLACEHOLDER_NAME_AR, time: PLACEHOLDER_DATE, deviceInfo: "[Firefox 120 / Windows]" }, "ar") },
    ],
  },
  {
    name: "MFA_ENABLED",
    templates: [
      { lang: "fr", result: buildMfaStatusEmail({ fullName: PLACEHOLDER_NAME_FR, enabled: true }, "fr") },
      { lang: "ar", result: buildMfaStatusEmail({ fullName: PLACEHOLDER_NAME_AR, enabled: true }, "ar") },
    ],
  },
  {
    name: "MFA_DISABLED",
    templates: [
      { lang: "fr", result: buildMfaStatusEmail({ fullName: PLACEHOLDER_NAME_FR, enabled: false }, "fr") },
      { lang: "ar", result: buildMfaStatusEmail({ fullName: PLACEHOLDER_NAME_AR, enabled: false }, "ar") },
    ],
  },
  {
    name: "ACCOUNT_DEACTIVATED",
    templates: [
      { lang: "fr", result: buildAccountStatusEmail({ fullName: PLACEHOLDER_NAME_FR, activated: false }, "fr") },
      { lang: "ar", result: buildAccountStatusEmail({ fullName: PLACEHOLDER_NAME_AR, activated: false }, "ar") },
    ],
  },
  {
    name: "ACCOUNT_REACTIVATED",
    templates: [
      { lang: "fr", result: buildAccountStatusEmail({ fullName: PLACEHOLDER_NAME_FR, activated: true }, "fr") },
      { lang: "ar", result: buildAccountStatusEmail({ fullName: PLACEHOLDER_NAME_AR, activated: true }, "ar") },
    ],
  },
  {
    name: "INSTITUTION_STATUS_CHANGED",
    templates: [
      { lang: "fr", result: buildInstitutionStatusEmail({ institutionName: PLACEHOLDER_INST_FR, newStatus: "VERIFIED" }, "fr") },
      { lang: "ar", result: buildInstitutionStatusEmail({ institutionName: PLACEHOLDER_INST_AR, newStatus: "VERIFIED" }, "ar") },
    ],
  },
  {
    name: "ALREADY_REGISTERED",
    templates: [
      { lang: "fr", result: buildAlreadyRegisteredEmail("fr") },
      { lang: "ar", result: buildAlreadyRegisteredEmail("ar") },
    ],
  },
  {
    name: "CONTACT_RECEIVED",
    templates: [
      { lang: "fr", result: buildContactReceivedEmail({ fullName: PLACEHOLDER_NAME_FR }, "fr") },
      { lang: "ar", result: buildContactReceivedEmail({ fullName: PLACEHOLDER_NAME_AR }, "ar") },
    ],
  },
  {
    name: "CONTACT_ADMIN_NOTICE",
    templates: [
      { lang: "fr", result: buildAdminNoticeEmail({ kind: "CONTACT", senderName: PLACEHOLDER_NAME_FR }, "fr") },
      { lang: "ar", result: buildAdminNoticeEmail({ kind: "CONTACT", senderName: PLACEHOLDER_NAME_AR }, "ar") },
    ],
  },
  {
    name: "ACCOUNT_DELETION_CONFIRM",
    templates: [
      { lang: "fr", result: buildAccountDeletionEmail({ fullName: PLACEHOLDER_NAME_FR }, "fr") },
      { lang: "ar", result: buildAccountDeletionEmail({ fullName: PLACEHOLDER_NAME_AR }, "ar") },
    ],
  },
  {
    name: "DATA_EXPORT_READY",
    templates: [
      { lang: "fr", result: buildDataExportEmail({ fullName: PLACEHOLDER_NAME_FR, exportLink: PLACEHOLDER_LINK }, "fr") },
      { lang: "ar", result: buildDataExportEmail({ fullName: PLACEHOLDER_NAME_AR, exportLink: PLACEHOLDER_LINK }, "ar") },
    ],
  },
  {
    name: "EMAIL_CHANGE_CONFIRM",
    templates: [
      { lang: "fr", result: buildEmailChangeConfirmEmail(PLACEHOLDER_LINK, "fr") },
      { lang: "ar", result: buildEmailChangeConfirmEmail(PLACEHOLDER_LINK, "ar") },
    ],
  },
  {
    name: "EMAIL_CHANGED_NOTICE",
    templates: [
      { lang: "fr", result: buildEmailChangedNoticeEmail({ fullName: PLACEHOLDER_NAME_FR, newEmail: "[nouveau@exemple.dz]" }, "fr") },
      { lang: "ar", result: buildEmailChangedNoticeEmail({ fullName: PLACEHOLDER_NAME_AR, newEmail: "[nouveau@exemple.dz]" }, "ar") },
    ],
  },
  {
    name: "TEST_EMAIL",
    templates: [
      { lang: "fr", result: buildTestEmail("fr") },
      { lang: "ar", result: buildTestEmail("ar") },
    ],
  },
]

// ── Write to .mail-preview/ ───────────────────────────────────────────────────

const previewDir = path.resolve(__dirname, "../.mail-preview")
if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true })

// Build index page
const indexLinks: string[] = []

for (const def of defs) {
  for (const { lang, result } of def.templates) {
    const filename = `${def.name}_${lang}.html`
    const filepath = path.join(previewDir, filename)
    fs.writeFileSync(filepath, result.html, "utf8")
    const sizeKb = (result.html.length / 1024).toFixed(1)
    console.log(`✓ ${filename} (${sizeKb} KB) — ${result.subject}`)
    indexLinks.push(`<li><a href="${filename}">${def.name} [${lang.toUpperCase()}]</a> — ${result.subject} <small>(${sizeKb} KB)</small></li>`)
  }
}

// Write index
const indexHtml = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Email Preview — Delin Smart Care</title>
<style>body{font-family:sans-serif;max-width:800px;margin:40px auto;padding:0 20px}li{margin:8px 0}a{color:#2C5F8A}</style>
</head>
<body>
<h1>Email Previews — Delin Smart Care</h1>
<p><strong>⚠️ These are previews using placeholder values only. Never real data.</strong></p>
<ul>${indexLinks.join("\n")}</ul>
</body></html>`

fs.writeFileSync(path.join(previewDir, "index.html"), indexHtml, "utf8")
console.log(`\n✓ ${defs.reduce((n, d) => n + d.templates.length, 0)} templates written to .mail-preview/`)
console.log("  Open: .mail-preview/index.html")
