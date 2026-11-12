/**
 * scripts/generate-icons.js
 * Generates PWA icons from public/logo.jpg using sharp.
 *
 * NOTE (AUDIT): The source logo.jpg is 720×586 (medium resolution, 72 dpi).
 * Icons at 512×512 are already close to the source resolution; anything larger
 * would be upscaled and lose quality. The owner should provide an SVG or a
 * high-resolution PNG source (≥1024×1024) for best icon quality.
 *
 * Run: node scripts/generate-icons.js
 */

import sharp from "sharp"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const SRC = path.join(ROOT, "public", "logo.jpg")
const OUT = path.join(ROOT, "public", "icons")

fs.mkdirSync(OUT, { recursive: true })

/** Background colour for maskable/apple-touch-icon safe zone */
const BG_COLOR = { r: 235, g: 243, b: 250, alpha: 1 } // #EBF3FA

/**
 * Produce a maskable icon: the logo is scaled to fill 76% of the canvas
 * (i.e. 20% padding on each side) centred on a solid background.
 */
async function maskable(size, filename) {
  const logoSize = Math.round(size * 0.76)
  const offset = Math.round((size - logoSize) / 2)

  const logoBuffer = await sharp(SRC)
    .resize(logoSize, logoSize, { fit: "contain", background: BG_COLOR })
    .png()
    .toBuffer()

  const outPath = path.join(OUT, filename)
  const info = await sharp({
    create: { width: size, height: size, channels: 4, background: BG_COLOR },
  })
    .composite([{ input: logoBuffer, left: offset, top: offset }])
    .png()
    .toFile(outPath)

  const bytes = fs.statSync(outPath).size
  console.log(`✓ ${filename.padEnd(30)} ${size}×${size}  ${(bytes / 1024).toFixed(1)} KB`)
  return info
}

/** Plain icon: logo resized to fill the canvas (cover, no padding). */
async function plain(size, filename) {
  const outPath = path.join(OUT, filename)
  const info = await sharp(SRC)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(outPath)

  const bytes = fs.statSync(outPath).size
  console.log(`✓ ${filename.padEnd(30)} ${size}×${size}  ${(bytes / 1024).toFixed(1)} KB`)
  return info
}

console.log("Generating PWA icons from public/logo.jpg …\n")

await plain(192, "icon-192.png")
await plain(512, "icon-512.png")
await maskable(192, "icon-maskable-192.png")
await maskable(512, "icon-maskable-512.png")
await maskable(180, "apple-touch-icon.png")
await plain(32, "favicon-32.png")
await plain(16, "favicon-16.png")

console.log("\nDone. Icons written to public/icons/")
