// server/src/modules/contact/service.ts
import { prisma } from "../../lib/prisma"
import type { ContactInput } from "./schema"

export async function createContactMessage(input: ContactInput) {
  const { website: _honeypot, ...data } = input
  const message = await prisma.contactMessage.create({
    data: {
      fullName: data.fullName,
      email: data.email.toLowerCase(),
      phone: data.phone ?? null,
      message: data.message,
      type: data.type,
    },
    select: { id: true, createdAt: true },
  })
  return message
}
