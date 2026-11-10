// server/prisma/seed.ts
// Seeds ONLY real reference data:
//   - Khenchela wilaya (code 40) and its communes
//   - Medical specialties (Arabic + French)
//   - Algerian national emergency numbers
//   - Institution templates from prisma/data/khenchela-institutions.json
// NO fake doctors, patients, appointments or reviews.

import { PrismaClient, InstitutionType, InstitutionSector, InstitutionStatus } from "@prisma/client"
import { z } from "zod"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

// ── Khenchela communes ────────────────────────────────────────────────────
// Source: official commune list for Khenchela wilaya (40), Algeria
const KHENCHELA_COMMUNES = [
  "خنشلة",        // Khenchela (chef-lieu)
  "بغاي",         // Baghay
  "أولاد رشاش",   // Ouled Rechache
  "أنزة",         // Anza
  "تامزة",        // Tamza
  "ششار",         // Chechar
  "خيران",        // Khirane
  "علي بن خليفة", // Ali Ben Khelifa
  "قايس",         // Kais
  "طامزة",        // Taouzient
  "مسارة",        // Massara
  "لمسان",        // Lamsen
  "سقانة",        // Sekana
  "مزرعة",        // Mazraa
  "بابار",        // Babar
  "الرميلة",      // Remila
  "الحامة",       // El Hamma
  "عين الطويلة",  // Ain Touila
  "قوراي",        // Kouri
  "سرج الغول",    // Sarj El Ghoul
  "الرابطة",      // Er-Remila
  "يبوس",         // Yabous
]

// ── Specialties ───────────────────────────────────────────────────────────
const SPECIALTIES = [
  { nameAr: "طب عام", nameFr: "Médecine générale", slug: "general-medicine" },
  { nameAr: "قلب وأوعية دموية", nameFr: "Cardiologie", slug: "cardiology" },
  { nameAr: "أمراض الأطفال", nameFr: "Pédiatrie", slug: "pediatrics" },
  { nameAr: "طب النساء والتوليد", nameFr: "Gynécologie-Obstétrique", slug: "gynecology" },
  { nameAr: "طب الأعصاب", nameFr: "Neurologie", slug: "neurology" },
  { nameAr: "الجراحة العامة", nameFr: "Chirurgie générale", slug: "general-surgery" },
  { nameAr: "أمراض الجهاز الهضمي", nameFr: "Gastro-entérologie", slug: "gastroenterology" },
  { nameAr: "أمراض الروماتيزم", nameFr: "Rhumatologie", slug: "rheumatology" },
  { nameAr: "أمراض الجلد", nameFr: "Dermatologie", slug: "dermatology" },
  { nameAr: "أمراض العيون", nameFr: "Ophtalmologie", slug: "ophthalmology" },
  { nameAr: "أمراض الأنف والأذن والحنجرة", nameFr: "ORL", slug: "ent" },
  { nameAr: "أمراض الصدر", nameFr: "Pneumologie", slug: "pulmonology" },
  { nameAr: "طب الباطنة", nameFr: "Médecine interne", slug: "internal-medicine" },
  { nameAr: "أمراض الكلى", nameFr: "Néphrologie", slug: "nephrology" },
  { nameAr: "أمراض الغدد الصماء والسكري", nameFr: "Endocrinologie-Diabétologie", slug: "endocrinology" },
  { nameAr: "الطب النفسي", nameFr: "Psychiatrie", slug: "psychiatry" },
  { nameAr: "طب الأورام", nameFr: "Oncologie", slug: "oncology" },
  { nameAr: "أمراض العظام والمفاصل", nameFr: "Orthopédie", slug: "orthopedics" },
  { nameAr: "طب وجراحة الأسنان", nameFr: "Dentisterie", slug: "dentistry" },
  { nameAr: "المخبر التحليلي", nameFr: "Biologie médicale", slug: "laboratory" },
  { nameAr: "الأشعة والتصوير الطبي", nameFr: "Radiologie", slug: "radiology" },
]

// ── Emergency numbers ─────────────────────────────────────────────────────
// Source: official Algerian emergency services
const EMERGENCY_NUMBERS = [
  { labelAr: "الحماية المدنية", labelFr: "Protection civile", number: "14", scope: "national" },
  { labelAr: "الشرطة الوطنية", labelFr: "Police nationale", number: "17", scope: "national" },
  { labelAr: "الدرك الوطني", labelFr: "Gendarmerie nationale", number: "1055", scope: "national" },
  { labelAr: "سامو (الإسعاف الطبي العاجل)", labelFr: "SAMU", number: "115", scope: "national" },
]

// ── Institution JSON schema ───────────────────────────────────────────────
const institutionSchema = z.object({
  type: z.enum(["CHU", "EPH", "EPSP", "EHS", "POLYCLINIC", "PRIVATE_CLINIC", "PRIVATE_LAB", "PRIVATE_IMAGING", "PHARMACY"]),
  sector: z.enum(["PUBLIC", "PRIVATE"]),
  nameAr: z.string().min(1),
  nameFr: z.string().min(1),
  communeIndex: z.number().int().min(0), // index into KHENCHELA_COMMUNES
  addressAr: z.string().nullable(),
  addressFr: z.string().nullable(),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  phone: z.string().nullable(),
  email: z.string().email().nullable().optional(),
  website: z.string().url().nullable().optional(),
  hasEmergency24h: z.boolean().default(false),
  status: z.enum(["DRAFT", "VERIFIED", "SUSPENDED"]).default("DRAFT"),
  sourceNote: z.string().nullable().optional(),
})

async function main() {
  console.log("🌱 Seeding Delin Smart Care database...")

  // Wilaya
  const wilaya = await prisma.wilaya.upsert({
    where: { code: 40 },
    create: { code: 40, nameAr: "خنشلة", nameFr: "Khenchela" },
    update: {},
  })
  console.log(`✓ Wilaya: ${wilaya.nameAr}`)

  // Communes
  const communes = await Promise.all(
    KHENCHELA_COMMUNES.map((nameAr, i) =>
      prisma.commune.upsert({
        where: { id: i + 1 },
        create: {
          id: i + 1,
          wilayaId: wilaya.id,
          nameAr,
          nameFr: nameAr, // placeholder — owner must add proper French names
        },
        update: {},
      })
    )
  )
  console.log(`✓ ${communes.length} communes seeded`)

  // Specialties
  for (const spec of SPECIALTIES) {
    await prisma.specialty.upsert({
      where: { slug: spec.slug },
      create: spec,
      update: { nameAr: spec.nameAr, nameFr: spec.nameFr },
    })
  }
  console.log(`✓ ${SPECIALTIES.length} specialties seeded`)

  // Emergency numbers
  for (const num of EMERGENCY_NUMBERS) {
    await prisma.emergencyNumber.upsert({
      where: { id: num.number }, // use number as a stable ID
      create: { id: num.number, ...num },
      update: { labelAr: num.labelAr, labelFr: num.labelFr },
    })
  }
  console.log(`✓ ${EMERGENCY_NUMBERS.length} emergency numbers seeded`)

  // Institutions from JSON
  const dataPath = path.join(__dirname, "data", "khenchela-institutions.json")
  if (fs.existsSync(dataPath)) {
    const raw = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as unknown[]
    let created = 0
    for (const entry of raw) {
      const parsed = institutionSchema.safeParse(entry)
      if (!parsed.success) {
        console.warn("⚠ Skipping invalid institution entry:", parsed.error.issues)
        continue
      }
      const d = parsed.data
      const communeId = communes[d.communeIndex]?.id
      if (!communeId) {
        console.warn(`⚠ communeIndex ${d.communeIndex} out of range — skipping`)
        continue
      }
      await prisma.institution.upsert({
        where: { id: `seed-${d.nameAr.replace(/\s+/g, "-")}` },
        create: {
          id: `seed-${d.nameAr.replace(/\s+/g, "-")}`,
          type: d.type as InstitutionType,
          sector: d.sector as InstitutionSector,
          nameAr: d.nameAr,
          nameFr: d.nameFr,
          addressAr: d.addressAr,
          addressFr: d.addressFr,
          communeId,
          lat: d.lat,
          lng: d.lng,
          phone: d.phone,
          email: d.email ?? null,
          website: d.website ?? null,
          hasEmergency24h: d.hasEmergency24h,
          status: (d.status ?? "DRAFT") as InstitutionStatus,
          sourceNote: d.sourceNote ?? null,
        },
        update: {},
      })
      created++
    }
    console.log(`✓ ${created} institutions seeded from JSON`)
  } else {
    console.log("ℹ  No khenchela-institutions.json found — skipping institution seed")
    console.log("   Create server/prisma/data/khenchela-institutions.json to add institutions")
  }

  console.log("✅ Seed complete.")
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
