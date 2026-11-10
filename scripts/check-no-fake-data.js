#!/usr/bin/env node
/**
 * check-no-fake-data.js
 *
 * CI check that fails if any forbidden fake-data patterns are found
 * inside src/ (production code). Test fixtures under tests/ are excluded.
 *
 * Run: npm run check:no-fake-data
 */

import { execSync } from "child_process"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SRC_DIR = path.join(__dirname, "..", "src")

// Patterns that must not appear in src/
// Note: HTML input placeholder="..." is acceptable — we check for image placeholders and fake data only.
const FORBIDDEN = [
  { pattern: "/placeholder\\.svg", label: "placeholder SVG image" },
  { pattern: "via\\.placeholder\\.com", label: "via.placeholder.com (dead CDN)" },
  { pattern: "dummyData", label: "dummyData identifier" },
  { pattern: "mockData", label: "mockData identifier" },
  { pattern: "ريال", label: "Saudi Riyal currency (ريال)" },
  { pattern: "\\+966", label: "Saudi phone prefix (+966)" },
  { pattern: "\\b997\\b", label: "Saudi emergency number 997" },
  { pattern: "الملك فهد", label: "Saudi reference (الملك فهد)" },
  { pattern: "John Doe", label: "placeholder name (John Doe)" },
  { pattern: "Lorem ipsum", label: "Lorem ipsum placeholder text" },
  { pattern: "King Saud", label: "Saudi reference (King Saud)" },
  { pattern: "جامعة الملك سعود", label: "Saudi reference (جامعة الملك سعود)" },
]

let failed = false

for (const { pattern, label } of FORBIDDEN) {
  try {
    // Use grep -r; non-zero exit means no match (which is good)
    const result = execSync(
      `grep -r --include="*.jsx" --include="*.js" --include="*.ts" --include="*.tsx" -l "${pattern}" "${SRC_DIR}" 2>/dev/null`,
      { encoding: "utf8" }
    ).trim()

    if (result) {
      console.error(`\n❌  FAIL [${label}]\n   Found in:\n${result.split("\n").map(f => "   " + f).join("\n")}`)
      failed = true
    }
  } catch {
    // grep returns exit code 1 when no matches — that's success
  }
}

if (failed) {
  console.error("\n✗ check:no-fake-data failed. Remove all fake/mock/placeholder data from src/ before committing.\n")
  process.exit(1)
} else {
  console.log("✓ check:no-fake-data passed — no forbidden patterns found in src/")
  process.exit(0)
}
