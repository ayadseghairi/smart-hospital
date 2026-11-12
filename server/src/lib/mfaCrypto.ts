// server/src/lib/mfaCrypto.ts
// AES-256-GCM encryption for TOTP secrets at rest.
// Key is loaded from MFA_ENCRYPTION_KEY env var (64 hex chars = 32 bytes).
// Format: <iv-hex>:<authTag-hex>:<ciphertext-hex>
import crypto from "crypto"

const ALGORITHM = "aes-256-gcm"
const IV_BYTES = 12
const TAG_BYTES = 16

function getKey(): Buffer {
  const hex = process.env.MFA_ENCRYPTION_KEY
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error(
      "MFA_ENCRYPTION_KEY is missing or invalid. " +
      "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    )
  }
  return Buffer.from(hex, "hex")
}

export function encryptTotpSecret(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(IV_BYTES)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return [iv.toString("hex"), tag.toString("hex"), ciphertext.toString("hex")].join(":")
}

export function decryptTotpSecret(encrypted: string): string {
  const parts = encrypted.split(":")
  if (parts.length !== 3) throw new Error("Invalid encrypted TOTP secret format")
  const [ivHex, tagHex, cipherHex] = parts
  const key = getKey()
  const iv = Buffer.from(ivHex, "hex")
  const tag = Buffer.from(tagHex, "hex")
  const ciphertext = Buffer.from(cipherHex, "hex")
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8")
}
