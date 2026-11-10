// tests/unit/normalize.test.ts
// Pure unit tests for Arabic/French search normalization
import { describe, it, expect } from "vitest"
import { normalizeArabic, normalizeFrench } from "../../src/modules/search/normalize"

describe("normalizeArabic", () => {
  it("strips Arabic diacritics (tashkeel)", () => {
    expect(normalizeArabic("مُحَمَّد")).toBe("محمد")
    expect(normalizeArabic("طَبِيبٌ")).toBe("طبيب")
  })

  it("unifies alef variants to bare alef", () => {
    expect(normalizeArabic("أحمد")).toBe("احمد")
    expect(normalizeArabic("إبراهيم")).toBe("ابراهيم")
    expect(normalizeArabic("آمنة")).toBe("امنه") // also ة → ه
  })

  it("unifies taa marbuta (ة → ه)", () => {
    expect(normalizeArabic("ممرضة")).toBe("ممرضه")
    expect(normalizeArabic("صحة")).toBe("صحه")
  })

  it("unifies alef maqsoura (ى → ي)", () => {
    expect(normalizeArabic("مستشفى")).toBe("مستشفي")
    expect(normalizeArabic("مستوى")).toBe("مستوي")
  })

  it("lowercases Latin characters", () => {
    expect(normalizeArabic("CHU Khenchela")).toBe("chu khenchela")
  })

  it("strips French accents", () => {
    expect(normalizeArabic("hôpital")).toBe("hopital")
  })

  it("is idempotent — normalizing twice yields the same result", () => {
    const input = "أحمدُ"
    expect(normalizeArabic(normalizeArabic(input))).toBe(normalizeArabic(input))
  })
})

describe("normalizeFrench", () => {
  it("removes French accents", () => {
    expect(normalizeFrench("hôpital")).toBe("hopital")
    expect(normalizeFrench("médecin")).toBe("medecin")
    expect(normalizeFrench("général")).toBe("general")
    expect(normalizeFrench("spécialité")).toBe("specialite")
  })

  it("lowercases the result", () => {
    expect(normalizeFrench("Hôpital")).toBe("hopital")
    expect(normalizeFrench("MÉDECIN")).toBe("medecin")
  })

  it("does not corrupt Arabic text", () => {
    const arabic = "مستشفى"
    expect(normalizeFrench(arabic)).toBe(arabic)
  })
})
