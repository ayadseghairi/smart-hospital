// server/scripts/create-super-admin.ts
// Creates the first SUPER_ADMIN account and sends them an invite email.
// Run with: npm run create-super-admin
// Reads SUPER_ADMIN_EMAIL and SUPER_ADMIN_FULL_NAME from .env
// No default password is ever set or stored.

import { PrismaClient } from "@prisma/client"

// Inline minimal env access to avoid loading the full app config
const email = process.env.SUPER_ADMIN_EMAIL
const fullName = process.env.SUPER_ADMIN_FULL_NAME

if (!email || !fullName) {
  console.error("Error: SUPER_ADMIN_EMAIL and SUPER_ADMIN_FULL_NAME must be set in .env")
  process.exit(1)
}

const prisma = new PrismaClient()

async function main() {
  // Check if super admin already exists
  const existing = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  })
  if (existing) {
    console.error(`Error: A SUPER_ADMIN account already exists (${existing.email ?? existing.id})`)
    console.error("To create an additional admin, use the admin panel.")
    process.exit(1)
  }

  const user = await prisma.user.create({
    data: {
      role: "SUPER_ADMIN",
      email: email!.toLowerCase(),
      fullName: fullName!,
      preferredLang: "ar",
      mustSetPassword: true,
    },
  })

  console.log(`✓ Super admin account created: ${user.email}`)

  // Import and send the invite
  const { sendInvite } = await import("../src/modules/admin/service")
  await sendInvite(user.id)

  console.log(`✓ Invite email sent to ${user.email}`)
  console.log("  The administrator must use the invite link to set their password.")
  console.log("  No password has been set or stored.")
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
