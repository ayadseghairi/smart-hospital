// tests/unit/phone.test.ts
// Pure unit tests — no database needed
import { describe, it, expect } from "vitest"
import { normalizePhone, isValidAlgerianPhone } from "../../src/lib/phone"

describe("normalizePhone", () => {
  it("normalizes 0-prefix mobile to +213 format", () => {
    expect(normalizePhone("0551234567")).toBe("+213551234567")
    expect(normalizePhone("0661234567")).toBe("+213661234567")
    expect(normalizePhone("0771234567")).toBe("+213771234567")
  })

  it("normalizes +213 prefix correctly", () => {
    expect(normalizePhone("+213551234567")).toBe("+213551234567")
    expect(normalizePhone("+213661234567")).toBe("+213661234567")
  })

  it("normalizes 00213 prefix correctly", () => {
    expect(normalizePhone("00213551234567")).toBe("+213551234567")
  })

  it("strips leading/trailing whitespace before normalizing", () => {
    expect(normalizePhone("  0551234567  ")).toBe("+213551234567")
    expect(normalizePhone("  +213551234567  ")).toBe("+213551234567")
  })

  it("strips all whitespace (including internal) before matching", () => {
    // The normalizer strips all whitespace first, so "+213 551234567" → "+213551234567"
    expect(normalizePhone(" +213 551234567")).toBe("+213551234567")
  })

  it("returns null for invalid numbers", () => {
    expect(normalizePhone("")).toBe(null)
    expect(normalizePhone("0123456789")).toBe(null) // starts with 0+1, not 05/06/07
    expect(normalizePhone("+33612345678")).toBe(null) // French number
    expect(normalizePhone("+966512345678")).toBe(null) // Saudi number
    expect(normalizePhone("997")).toBe(null) // emergency number, not mobile
    expect(normalizePhone("0551234")).toBe(null) // too short
    expect(normalizePhone("055123456789")).toBe(null) // too long
  })

  it("only accepts 05, 06, 07 prefixes (not 08, 09, etc.)", () => {
    expect(normalizePhone("0851234567")).toBe(null)
    expect(normalizePhone("0951234567")).toBe(null)
    expect(normalizePhone("0451234567")).toBe(null)
  })
})

describe("isValidAlgerianPhone", () => {
  it("returns true for valid numbers", () => {
    expect(isValidAlgerianPhone("0551234567")).toBe(true)
    expect(isValidAlgerianPhone("+213661234567")).toBe(true)
  })

  it("returns false for invalid numbers", () => {
    expect(isValidAlgerianPhone("+966512345678")).toBe(false)
    expect(isValidAlgerianPhone("997")).toBe(false)
    expect(isValidAlgerianPhone("")).toBe(false)
  })
})
