// server/prisma/validateSeed.ts
// Lists institutions in the JSON file that are missing required data.
// Run with: npm run seed:validate

import * as fs from "fs"
import * as path from "path"

const dataPath = path.join(__dirname, "data", "khenchela-institutions.json")

if (!fs.existsSync(dataPath)) {
  console.error("Error: khenchela-institutions.json not found")
  process.exit(1)
}

const institutions = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as Array<{
  nameAr?: string
  phone?: string | null
  lat?: number | null
  lng?: number | null
  status?: string
  sourceNote?: string | null
}>

console.log(`\n=== Delin Smart Care — Seed Validation ===\n`)
console.log(`Total institutions: ${institutions.length}\n`)

const issues: Array<{ name: string; missing: string[] }> = []

for (const inst of institutions) {
  const missing: string[] = []
  if (!inst.phone) missing.push("phone")
  if (inst.lat == null) missing.push("lat")
  if (inst.lng == null) missing.push("lng")
  if (!inst.sourceNote) missing.push("sourceNote")
  if (inst.status === "VERIFIED" && (!inst.sourceNote || !inst.phone)) {
    missing.push("(VERIFIED but missing phone or sourceNote)")
  }
  if (missing.length) {
    issues.push({ name: inst.nameAr ?? "(unnamed)", missing })
  }
}

if (!issues.length) {
  console.log("✅ All institutions have required fields.")
} else {
  console.log(`⚠  ${issues.length} institution(s) with missing fields:\n`)
  for (const { name, missing } of issues) {
    console.log(`  • ${name}: ${missing.join(", ")}`)
  }
  console.log(
    `\nFill in the missing fields or set status to "DRAFT" until the data is verified.\n`
  )
}
