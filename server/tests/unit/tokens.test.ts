// tests/unit/tokens.test.ts
// Pure unit tests for token generation and hashing
import { describe, it, expect } from "vitest"
import { generateRawToken, hashToken } from "../../src/lib/tokens"
import crypto from "crypto"

describe("generateRawToken", () => {
  it("returns a non-empty hex string", () => {
    const token = generateRawToken()
    expect(token).toMatch(/^[0-9a-f]+$/i)
  })

  it("returns 64 chars for default 32 bytes (hex encoding doubles length)", () => {
    const token = generateRawToken(32)
    expect(token).toHaveLength(64)
  })

  it("returns a different token each time (cryptographic randomness)", () => {
    const t1 = generateRawToken()
    const t2 = generateRawToken()
    expect(t1).not.toBe(t2)
  })

  it("respects the byteLength parameter", () => {
    const token = generateRawToken(16)
    expect(token).toHaveLength(32) // 16 bytes × 2 hex chars/byte
  })
})

describe("hashToken", () => {
  it("returns a 64-char hex string (SHA-256)", () => {
    const hash = hashToken("some-raw-token")
    expect(hash).toHaveLength(64)
    expect(hash).toMatch(/^[0-9a-f]+$/i)
  })

  it("is deterministic — same input → same hash", () => {
    const token = "consistent-token-abc123"
    expect(hashToken(token)).toBe(hashToken(token))
  })

  it("matches the expected SHA-256 output", () => {
    const token = "hello"
    const expected = crypto.createHash("sha256").update("hello").digest("hex")
    expect(hashToken(token)).toBe(expected)
  })

  it("different inputs produce different hashes (collision resistance)", () => {
    expect(hashToken("tokenA")).not.toBe(hashToken("tokenB"))
  })

  it("never stores raw token — hash is not equal to input", () => {
    const raw = generateRawToken()
    const hash = hashToken(raw)
    expect(hash).not.toBe(raw)
  })
})
