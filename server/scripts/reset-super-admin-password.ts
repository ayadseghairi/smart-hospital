// server/scripts/reset-super-admin-password.ts
// Emergency: generate a new one-time temporary password for the SUPER_ADMIN.
// Run with: npm run reset-super-admin-password (server shell only)
//
// - Reads the new temporary password from an interactive prompt (never from a file or arg)
// - Hashes it with argon2id and stores it
// - Sets mustChangePassword=true
// - Revokes all sessions
// - Writes an audit entry SUPER_ADMIN_PASSWORD_RESET
// - Prints the temporary password ONCE to the terminal (do not store it)
//
// The printed password must be communicated to the super admin over a secure channel.
// NEVER commit this output; NEVER store it in a file.

import "dotenv/config"
import readline from "readline/promises"
import argon2 from "argon2"
import crypto from "crypto"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const MIN_LENGTH = 16

function generateSecurePassword(length = 20): string {
  // Generate a URL-safe random string of the requested length
  // charset avoids ambiguous characters (0/O, 1/l/I)
  const charset = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%^&*"
  const bytes = crypto.randomBytes(length)
  return Array.from(bytes)
    .map((b) => charset[b % charset.length])
    .join("")
}

async function promptPassword(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  console.log("\nReset SUPER_ADMIN password")
  console.log("─".repeat(50))
  console.log("Options:")
  console.log("  1. Auto-generate a secure temporary password (recommended)")
  console.log("  2. Enter a new password manually")
  console.log("")

  const choice = (await rl.question("Enter 1 or 2: ")).trim()

  if (choice === "1") {
    rl.close()
    return generateSecurePassword()
  }

  if (choice === "2") {
    const pw = (await rl.question(`Enter new password (min ${MIN_LENGTH} chars): `)).trim()
    rl.close()
    return pw
  }

  rl.close()
  console.error("Invalid choice")
  process.exit(1)
}

async function main() {
  // Find the SUPER_ADMIN
  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN", isActive: true },
    select: { id: true, email: true, fullName: true },
  })

  if (!admin) {
    console.error("Error: No active SUPER_ADMIN account found.")
    process.exit(1)
  }

  console.log(`Found SUPER_ADMIN: ${admin.email ?? admin.id}`)

  const temporaryPassword = await promptPassword()

  if (temporaryPassword.length < MIN_LENGTH) {
    console.error(`Error: Password must be at least ${MIN_LENGTH} characters.`)
    process.exit(1)
  }

  const passwordHash = await argon2.hash(temporaryPassword, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  })

  // Update password, set mustChangePassword, revoke all sessions
  await prisma.$transaction([
    prisma.user.update({
      where: { id: admin.id },
      data: { passwordHash, mustChangePassword: true },
    }),
    prisma.refreshToken.updateMany({
      where: { userId: admin.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ])

  // Audit — no secret in the record
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "SUPER_ADMIN_PASSWORD_RESET",
      entity: "User",
      entityId: admin.id,
    },
  })

  console.log("\n" + "═".repeat(60))
  console.log("✓ SUPER_ADMIN password reset successfully")
  console.log("  Account:", admin.email ?? admin.id)
  console.log("")
  console.log("  TEMPORARY PASSWORD (shown once — do not store):")
  console.log("  " + temporaryPassword)
  console.log("")
  console.log("  ⚠️  The admin will be required to change this password")
  console.log("     immediately after their next login.")
  console.log("  ⚠️  Communicate this password over a secure channel only.")
  console.log("═".repeat(60) + "\n")
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
