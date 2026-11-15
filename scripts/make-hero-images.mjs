// scripts/make-hero-images.mjs
// Usage:  npm i -D sharp  &&  node scripts/make-hero-images.mjs [--position=attention|centre|top|bottom|left|right]
//
// Input  (owner supplies; NOT generated here):
//   assets/hero/hospital-wide-source.jpg   (or public/home.jpg)  landscape photo, ideally >= 2560x1440
//   assets/hero/hospital-tall-source.jpg   optional  portrait photo; if absent a portrait crop is derived from the wide one
// Output: public/images/hero/hospital-{wide|tall}-{width}.{avif|webp|jpg}
//
// Notes: never upscales, strips EXIF/GPS metadata, warns when files are too heavy for mobile.
import sharp from "sharp"
import fs from "node:fs"
import path from "node:path"

const SRC_DIR = "assets/hero"
const OUT_DIR = "public/images/hero"
const WIDE_SRC = [path.join(SRC_DIR, "hospital-wide-source.jpg"), "public/home.jpg"].find((f) => fs.existsSync(f))
const TALL_SRC = path.join(SRC_DIR, "hospital-tall-source.jpg")

const WIDE = { name: "hospital-wide", widths: [768, 1280, 1920, 2560], ratio: 9 / 16 }
const TALL = { name: "hospital-tall", widths: [480, 768, 1080], ratio: 5 / 4 } // height = width * 1.25

const arg = process.argv.find((a) => a.startsWith("--position="))
const position = arg ? arg.split("=")[1] : "attention"
const posValue = position === "attention" ? sharp.strategy.attention : position

if (!WIDE_SRC) {
  console.error("Missing source. Put your photo at public/home.jpg (or assets/hero/hospital-wide-source.jpg).")
  process.exit(1)
}
fs.mkdirSync(OUT_DIR, { recursive: true })

if (WIDE_SRC === "public/home.jpg") console.log("Using public/home.jpg as the source. After generating, move the ORIGINAL out of public/ (e.g. assets/hero/) so the heavy file is not shipped or precached.")
const wideMeta = await sharp(WIDE_SRC).metadata()
if ((wideMeta.width ?? 0) < 2560) {
  console.warn(`WARNING: wide source is ${wideMeta.width}px wide; sizes above that are skipped (no upscaling). Use >= 2560px for best quality.`)
}

async function build(src, { name, widths, ratio }) {
  const meta = await sharp(src).metadata()
  for (const w of widths) {
    if (meta.width && w > meta.width) continue // no upscaling
    const h = Math.round(w * ratio)
    const base = sharp(src).rotate().resize(w, h, { fit: "cover", position: posValue })
    // sharp drops metadata (EXIF, GPS) by default; do not call withMetadata()
    const outputs = [
      ["avif", base.clone().avif({ quality: 50, effort: 6 })],
      ["webp", base.clone().webp({ quality: 72 })],
      ["jpg", base.clone().jpeg({ quality: 74, mozjpeg: true, progressive: true })],
    ]
    for (const [ext, pipe] of outputs) {
      const file = path.join(OUT_DIR, `${name}-${w}.${ext}`)
      await pipe.toFile(file)
      const kb = Math.round(fs.statSync(file).size / 1024)
      const budget = name.includes("tall") ? 150 : 300
      console.log(`${file}  ${kb} KB${kb > budget ? `   <-- over the ${budget} KB budget, lower quality or simplify the photo` : ""}`)
    }
  }
}

await build(WIDE_SRC, WIDE)
await build(fs.existsSync(TALL_SRC) ? TALL_SRC : WIDE_SRC, TALL)
console.log("Done. Commit nothing from assets/ if the photo license forbids redistribution of the original.")
