// server/src/modules/appointments/ics.ts
// Generates a minimal RFC 5545-compliant iCalendar string for a single appointment.

type ApptForIcs = {
  id: string
  startsAt: Date
  endsAt: Date
  reason?: string | null
  doctor?: {
    user: { fullName: string }
    specialty?: { nameAr: string; nameFr: string } | null
  } | null
  service?: { nameAr: string; nameFr: string } | null
  institution?: { nameAr: string; nameFr: string } | null
}

function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "")
}

/** Fold long lines per RFC 5545 (max 75 octets, continuation with space) */
function fold(line: string): string {
  const bytes = Buffer.from(line, "utf8")
  if (bytes.length <= 75) return line
  const chunks: string[] = []
  let pos = 0
  let first = true
  while (pos < bytes.length) {
    const limit = first ? 75 : 74
    chunks.push(bytes.slice(pos, pos + limit).toString("utf8"))
    pos += limit
    first = false
  }
  return chunks.join("\r\n ")
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

export function buildIcs(appt: ApptForIcs, lang: "ar" | "fr"): string {
  const name = lang === "ar"
    ? (appt.doctor?.user.fullName ?? appt.service?.nameAr ?? "موعد")
    : (appt.doctor?.user.fullName ?? appt.service?.nameFr ?? "Rendez-vous")

  const location = lang === "ar"
    ? (appt.institution?.nameAr ?? "")
    : (appt.institution?.nameFr ?? "")

  const description = appt.reason ? esc(appt.reason) : ""

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Delin Smart Care//AR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${appt.id}@delin.dz`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(appt.startsAt)}`,
    `DTEND:${icsDate(appt.endsAt)}`,
    `SUMMARY:${esc(name)}`,
    location ? `LOCATION:${esc(location)}` : null,
    description ? `DESCRIPTION:${description}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .map((l) => fold(l as string))

  return lines.join("\r\n") + "\r\n"
}
