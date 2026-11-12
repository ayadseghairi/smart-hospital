/**
 * scripts/generate-sitemap.mjs
 * Generates public/sitemap.xml from the production domain.
 *
 * Usage: APP_BASE_URL=https://delin.dz node scripts/generate-sitemap.mjs
 *
 * The APP_BASE_URL env var must be set to the real production domain before running.
 * This script is meant to run as a build step (not at runtime — static routes only).
 */
import { writeFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dir = dirname(fileURLToPath(import.meta.url))
const BASE_URL = (process.env.APP_BASE_URL ?? "https://delin.dz").replace(/\/$/, "")

if (!process.env.APP_BASE_URL) {
  console.warn("⚠️  APP_BASE_URL is not set — using placeholder 'https://delin.dz'")
  console.warn("   Set APP_BASE_URL=https://your-domain before running in production.\n")
}

const now = new Date().toISOString().split("T")[0]

// Public static routes only — no authenticated or dynamic routes
const routes = [
  { path: "/",                      priority: "1.0", changefreq: "weekly" },
  { path: "/institutions",          priority: "0.9", changefreq: "daily"  },
  { path: "/doctors",               priority: "0.9", changefreq: "daily"  },
  { path: "/specialties",           priority: "0.8", changefreq: "weekly" },
  { path: "/emergency",             priority: "0.9", changefreq: "weekly" },
  { path: "/search",                priority: "0.7", changefreq: "daily"  },
  { path: "/about",                 priority: "0.6", changefreq: "monthly"},
  { path: "/how-it-works",          priority: "0.6", changefreq: "monthly"},
  { path: "/for-institutions",      priority: "0.6", changefreq: "monthly"},
  { path: "/contact",               priority: "0.5", changefreq: "monthly"},
  { path: "/faq",                   priority: "0.5", changefreq: "monthly"},
  { path: "/privacy",               priority: "0.4", changefreq: "monthly"},
  { path: "/terms",                 priority: "0.4", changefreq: "monthly"},
  { path: "/cookies",               priority: "0.3", changefreq: "yearly" },
  { path: "/install",               priority: "0.3", changefreq: "monthly"},
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(r => `  <url>
    <loc>${BASE_URL}${r.path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join("\n")}
</urlset>
`

const dest = resolve(__dir, "../public/sitemap.xml")
writeFileSync(dest, xml, "utf-8")
console.log(`✅ Sitemap written to public/sitemap.xml (${routes.length} routes)`)
console.log(`   Base URL: ${BASE_URL}`)
