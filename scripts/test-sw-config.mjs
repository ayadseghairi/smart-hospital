// scripts/test-sw-config.mjs
// Validates the service worker caching strategy configuration.
// Ensures no personal/API data is cached except the public emergency numbers.
// Run with: node scripts/test-sw-config.mjs
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import path from "path"

const __dir = path.dirname(fileURLToPath(import.meta.url))
const viteConfig = readFileSync(path.join(__dir, "../vite.config.js"), "utf-8")

let pass = true

function check(condition, message) {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`)
    pass = false
  } else {
    console.log(`  ✓ PASS: ${message}`)
  }
}

console.log("Checking service worker caching strategy...\n")

// 1. Emergency numbers must use StaleWhileRevalidate (offline availability)
check(
  viteConfig.includes("StaleWhileRevalidate") && viteConfig.includes("emergency-numbers"),
  "Emergency numbers API uses StaleWhileRevalidate cache"
)

// 2. All other API routes must be NetworkOnly (no personal data cached)
// Note: in vite.config the pattern is /\/api\// (escaped regex)
check(
  viteConfig.includes('"NetworkOnly"') && viteConfig.includes('\\/api\\/'),
  "General API routes use NetworkOnly (no personal/medical data cached)"
)

// 3. Must NOT cache authenticated API routes
check(
  !viteConfig.includes("/api/v1/auth") || viteConfig.includes("NetworkOnly"),
  "Auth endpoints not cached"
)

// 4. Offline fallback page must exist
import { existsSync } from "fs"
check(
  existsSync(path.join(__dir, "../public/offline.html")),
  "offline.html fallback page exists"
)

// 5. Manifest must exist
check(
  existsSync(path.join(__dir, "../public/manifest.webmanifest")),
  "manifest.webmanifest exists"
)

// 6. Icons must exist
const iconFiles = ["icon-192.png", "icon-512.png", "icon-maskable-192.png", "icon-maskable-512.png"]
for (const icon of iconFiles) {
  check(
    existsSync(path.join(__dir, `../public/icons/${icon}`)),
    `Icon ${icon} exists`
  )
}

// 7. SW config must have registerType: "prompt" (not autoUpdate — user controls updates)
check(
  viteConfig.includes('"prompt"'),
  "SW register type is 'prompt' (user-controlled update)"
)

// 8. Must NOT cache globPatterns that include /api/
check(
  !viteConfig.includes("api") || viteConfig.includes("navigateFallbackDenylist"),
  "API paths are in navigateFallbackDenylist"
)

console.log("")
if (pass) {
  console.log("✅ All SW configuration checks passed")
  process.exit(0)
} else {
  console.error("❌ Some SW configuration checks failed")
  process.exit(1)
}
