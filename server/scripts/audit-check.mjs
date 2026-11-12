#!/usr/bin/env node
/**
 * audit-check.mjs
 *
 * Reads `npm audit --omit=dev --json` from stdin and exits 1 if any
 * high/critical advisories are found that are NOT in the accepted list.
 *
 * Usage (from CI):
 *   npm audit --omit=dev --json | node scripts/audit-check.mjs
 *
 * Accepted advisory source IDs (add with justification comment):
 *   1243066  GHSA-mrhx-c7xc-m3w5  zod <4.6.6 memory exhaustion on oversized
 *            constrained collections. Fix = upgrade to zod v4 (breaking API
 *            change). Mitigated by explicit .max() bounds on all schemas,
 *            express 100 kb body limit, and rate limiting.
 *            Schedule zod v4 migration post-launch.
 */

const ACCEPTED = new Set([
  "1243066", // zod GHSA-mrhx-c7xc-m3w5 — see comment above
])

const chunks = []
process.stdin.on("data", (c) => chunks.push(c))
process.stdin.on("end", () => {
  let report
  try {
    report = JSON.parse(chunks.join(""))
  } catch {
    console.error("audit-check: failed to parse npm audit JSON")
    process.exit(1)
  }

  const failing = Object.values(report.vulnerabilities ?? {}).filter((v) => {
    if (!["high", "critical"].includes(v.severity)) return false
    // Accepted if every direct advisory source is in the allow-list.
    return !v.via.every(
      (via) => typeof via === "object" && ACCEPTED.has(String(via.source)),
    )
  })

  if (failing.length > 0) {
    console.error(
      `\n✖ ${failing.length} unaccepted high/critical vulnerabilit${failing.length === 1 ? "y" : "ies"}:\n`,
    )
    for (const v of failing) {
      const advisories = v.via
        .filter((x) => typeof x === "object")
        .map((x) => `${x.source} (${x.url})`)
        .join(", ")
      console.error(`  ${v.severity.toUpperCase()}  ${v.name}: ${advisories}`)
    }
    console.error("")
    process.exit(1)
  }

  const acceptedUsed = Object.values(report.vulnerabilities ?? {})
    .flatMap((v) => v.via)
    .filter((via) => typeof via === "object" && ACCEPTED.has(String(via.source)))
    .map((via) => via.source)

  console.log(
    `✔ Audit passed.${acceptedUsed.length ? ` Accepted advisories: ${[...new Set(acceptedUsed)].join(", ")}` : ""}`,
  )
  process.exit(0)
})
