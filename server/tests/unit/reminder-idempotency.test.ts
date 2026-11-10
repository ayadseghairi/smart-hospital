// tests/unit/reminder-idempotency.test.ts
// Tests that reminder scheduling is idempotent:
// running the sweep multiple times (e.g. after a worker restart) never creates
// duplicate Notification records for the same appointment/offset/user.
import { describe, it, expect, vi, beforeEach } from "vitest"

// ─── Mock config/env FIRST ───────────────────────────────────────────────────
vi.mock("../../src/config/env", () => ({
  env: {
    NODE_ENV: "test",
    APP_NAME: "Delin Smart Care",
    APP_BASE_URL: "http://localhost:3000",
    API_BASE_URL: "http://localhost:4000",
    CORS_ORIGIN: "http://localhost:3000",
    MAIL_ENABLED: false,
    REMINDER_OFFSETS_HOURS: "24,2",
    DOCTOR_DIGEST_HOUR: 7,
  },
  reminderOffsets: [24, 2],
}))

// ─── Mock Prisma — inline vi.fn() to avoid hoisting issues ───────────────────
vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    appointment: { findMany: vi.fn() },
    notification: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock("../../src/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

// ─── Import after mocks ───────────────────────────────────────────────────────
import { prisma } from "../../src/lib/prisma"
import { reminderSweep } from "../../src/modules/appointments/reminderSweep"

// ─── Mock pg-boss ─────────────────────────────────────────────────────────────
const mockBoss = {
  sendAfter: vi.fn().mockResolvedValue("job-id"),
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const PATIENT_ID = "patient-1"
const DOCTOR_USER_ID = "doctor-user-1"
const APPT_ID = "appt-abc123"
// Appointment starts in 23 hours (within the 24h + 1h look-ahead window)
const startsAt = new Date(Date.now() + 23 * 60 * 60 * 1000)

const mockAppointment = {
  id: APPT_ID,
  status: "CONFIRMED",
  startsAt,
  patient: { id: PATIENT_ID, preferredLang: "ar" },
  doctor: {
    user: { id: DOCTOR_USER_ID, preferredLang: "ar" },
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.appointment.findMany).mockResolvedValue([mockAppointment] as never)
  mockBoss.sendAfter.mockResolvedValue("job-id")
})

// ─── Idempotency tests ────────────────────────────────────────────────────────
describe("reminderSweep — idempotency", () => {
  it("creates a Notification on the first sweep when none exists", async () => {
    vi.mocked(prisma.notification.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.notification.create).mockResolvedValue({ id: "notif-1" } as never)

    await reminderSweep(mockBoss as never)

    expect(vi.mocked(prisma.notification.create)).toHaveBeenCalled()
  })

  it("does NOT create a duplicate Notification on a second sweep", async () => {
    // First sweep — nothing exists
    vi.mocked(prisma.notification.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.notification.create).mockResolvedValue({ id: "notif-1" } as never)

    await reminderSweep(mockBoss as never)
    vi.clearAllMocks()
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([mockAppointment] as never)

    // Second sweep — the patient 24h reminder now exists
    vi.mocked(prisma.notification.findUnique).mockImplementation(async ({ where }) => {
      if (where.idempotencyKey === `APPT_REMINDER:${APPT_ID}:24:${PATIENT_ID}`) {
        return { id: "notif-1", idempotencyKey: where.idempotencyKey } as never
      }
      return null
    })
    vi.mocked(prisma.notification.create).mockResolvedValue({ id: "notif-x" } as never)

    await reminderSweep(mockBoss as never)

    // The patient 24h key must NOT be created again
    const patientKey24h = `APPT_REMINDER:${APPT_ID}:24:${PATIENT_ID}`
    const duplicateCalls = vi.mocked(prisma.notification.create).mock.calls.filter(
      (call) => call[0]?.data?.idempotencyKey === patientKey24h
    )
    expect(duplicateCalls).toHaveLength(0)
  })

  it("uses the correct idempotency key format: APPT_REMINDER:{id}:{offset}:{userId}", async () => {
    // Appointment 24.5h from now (within the 25h look-ahead window) →
    // 24h reminder trigger is 30 min from now (future), 2h reminder also future
    const farAppointment = {
      ...mockAppointment,
      id: "appt-far",
      startsAt: new Date(Date.now() + 24.5 * 60 * 60 * 1000),
    }
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([farAppointment] as never)
    vi.mocked(prisma.notification.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.notification.create).mockResolvedValue({ id: "notif-1" } as never)

    await reminderSweep(mockBoss as never)

    const createdKeys = vi.mocked(prisma.notification.create).mock.calls.map(
      (call) => call[0]?.data?.idempotencyKey as string
    )

    // Every key must match the expected format
    for (const key of createdKeys) {
      expect(key).toMatch(/^APPT_REMINDER:[^:]+:\d+:[^:]+$/)
    }

    // Both patient and doctor 24h reminders must be created
    expect(createdKeys).toContain(`APPT_REMINDER:appt-far:24:${PATIENT_ID}`)
    expect(createdKeys).toContain(`APPT_REMINDER:appt-far:24:${DOCTOR_USER_ID}`)
  })

  it("skips reminders whose trigger time has already passed (too close to appointment)", async () => {
    // Appointment starts in only 1 hour — 24h reminder trigger = -23h ago (past)
    const nearAppointment = {
      ...mockAppointment,
      id: "appt-near",
      startsAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
    }
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([nearAppointment] as never)
    vi.mocked(prisma.notification.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.notification.create).mockResolvedValue({ id: "notif-near" } as never)

    await reminderSweep(mockBoss as never)

    const createdKeys = vi.mocked(prisma.notification.create).mock.calls.map(
      (call) => call[0]?.data?.idempotencyKey as string
    )

    // 24h reminder would have been due 23h ago — must NOT be created
    const has24hReminder = createdKeys.some((k) => k.includes(":24:"))
    expect(has24hReminder).toBe(false)
  })

  it("creates no notifications when there are no confirmed appointments in the window", async () => {
    vi.mocked(prisma.appointment.findMany).mockResolvedValue([])

    await reminderSweep(mockBoss as never)

    expect(vi.mocked(prisma.notification.create)).not.toHaveBeenCalled()
  })
})
