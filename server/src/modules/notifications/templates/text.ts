// server/src/modules/notifications/templates/text.ts
// Generate plain-text alternatives from structured content.
// All links are preserved as absolute URLs. No HTML entities.

export interface TextSection {
  type: "heading" | "paragraph" | "button" | "info" | "notice" | "divider"
  text?: string
  href?: string
  label?: string
  rows?: Array<{ label: string; value: string }>
  lines?: string[]
}

export function buildPlainText(sections: TextSection[]): string {
  const parts: string[] = []

  for (const s of sections) {
    switch (s.type) {
      case "heading":
        parts.push(s.text ?? "")
        parts.push("=".repeat(Math.min((s.text ?? "").length, 60)))
        break
      case "paragraph":
        parts.push(s.text ?? "")
        break
      case "button":
        parts.push(s.label ?? "")
        parts.push(s.href ?? "")
        break
      case "info":
        if (s.rows) {
          for (const r of s.rows) {
            parts.push(`${r.label}: ${r.value}`)
          }
        }
        break
      case "notice":
        if (s.lines) {
          parts.push("---")
          for (const l of s.lines) {
            parts.push(`• ${l}`)
          }
          parts.push("---")
        }
        break
      case "divider":
        parts.push("─".repeat(40))
        break
    }
    parts.push("")
  }

  return parts.join("\n").trim()
}
