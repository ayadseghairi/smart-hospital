// server/scripts/create-super-admin.ts
// Bootstrap the first SUPER_ADMIN account — idempotent.
// Run with: npm run create-super-admin
//
// Behavior:
//   - If SUPER_ADMIN_INITIAL_PASSWORD is set: creates account with temp password
//     (hashed with argon2id), sets mustChangePassword=true. Owner must change at first login
//     and then REMOVE SUPER_ADMIN_INITIAL_PASSWORD from .env.
//   - If SUPER_ADMIN_INITIAL_PASSWORD is empty: creates account without password, sends INVITE.
//
// NEVER prints the password. NEVER overwrites an existing SUPER_ADMIN.

// Load env before anything else
import "dotenv/config"
import { bootstrapSuperAdmin } from "../src/lib/bootstrap"
import { prisma } from "../src/lib/prisma"

async function main() {
  await bootstrapSuperAdmin()
  console.log("Done.")
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
