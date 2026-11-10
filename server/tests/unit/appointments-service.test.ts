// tests/unit/appointments-service.test.ts
// Tests for appointment business logic: double-booking, ownership, status transitions.
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
    EMAIL_VERIFY_TTL_HOURS: 24,
    INVITE_TTL_HOURS: 48,
    PASSWORD_RESET_TTL_MINUTES: 60,
    JWT_ACCESS_SECRET: "test-secret-at-least-32-chars-long-xxx",
    JWT_REFRESH_SECRET: "test-refresh-secret-at-least-32-long",
  },
  reminderOffsets: [24, 2],
}))

// ─── Mock Prisma — use inline vi.fn() to avoid hoisting issues ───────────────
vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    doctor: { findUnique: vi.fn() },
    appointment: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

// ─── Import after mocks ───────────────────────────────────────────────────────
import { prisma } from "../../src/lib/prisma"
import {
  createAppointment,
  cancelAppointment,
  updateDoctorAppointmentStatus,
} from "../../src/modules/appointments/service"

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const PATIENT_ID = "patient-1"
const DOCTOR_ID = "doctor-1"
const APPT_ID = "appt-1"
const STARTS_AT = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

const baseAppointment = {
  id: APPT_ID,
  patientId: PATIENT_ID,
  doctorId: DOCTOR_ID,
  serviceId: null,
  institutionId: "inst-1",
  startsAt: new Date(STARTS_AT),
  endsAt: new Date(new Date(STARTS_AT).getTime() + 30 * 60 * 1000),
  status: "PENDING" as const,
  reason: null,
  cancelledById: null,
  createdAt: new Date(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── Email verification gating ────────────────────────────────────────────────
describe("createAppointment — email verification gate", () => {
  it("throws 403 if the patient has no verified email", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: PATIENT_ID,
      email: "unverified@example.dz",
      emailVerifiedAt: null,
    } as never)

    await expect(
      createAppointment(PATIENT_ID, {
        doctorId: DOCTOR_ID,
        institutionId: "inst-1",
        startsAt: STARTS_AT,
      })
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it("throws 403 if the patient has no email at all", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: PATIENT_ID,
      email: null,
      emailVerifiedAt: null,
    } as never)

    await expect(
      createAppointment(PATIENT_ID, {
        doctorId: DOCTOR_ID,
        institutionId: "inst-1",
        startsAt: STARTS_AT,
      })
    ).rejects.toMatchObject({ statusCode: 403 })
  })
})

// ─── Double-booking prevention ────────────────────────────────────────────────
describe("createAppointment — double-booking prevention", () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: PATIENT_ID,
      email: "patient@example.dz",
      emailVerifiedAt: new Date(Date.now() - 3600_000),
    } as never)
  })

  it("throws 409 when the slot is already booked", async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => {
      if (typeof fn === "function") {
        return fn({
          appointment: {
            findFirst: vi.fn().mockResolvedValue({ ...baseAppointment, patientId: "other-patient" }),
            create: vi.fn(),
          },
        })
      }
    })

    await expect(
      createAppointment(PATIENT_ID, {
        doctorId: DOCTOR_ID,
        institutionId: "inst-1",
        startsAt: STARTS_AT,
      })
    ).rejects.toMatchObject({ statusCode: 409 })
  })

  it("succeeds when the slot is free", async () => {
    vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => {
      if (typeof fn === "function") {
        return fn({
          appointment: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue(baseAppointment),
          },
        })
      }
    })

    const result = await createAppointment(PATIENT_ID, {
      doctorId: DOCTOR_ID,
      institutionId: "inst-1",
      startsAt: STARTS_AT,
    })

    expect(result).toBeDefined()
  })

  it("performs the conflict check inside the same transaction as the create", async () => {
    const mockFindFirst = vi.fn().mockResolvedValue(null)
    const mockCreate = vi.fn().mockResolvedValue(baseAppointment)

    vi.mocked(prisma.$transaction).mockImplementation(async (fn: unknown) => {
      if (typeof fn === "function") {
        return fn({
          appointment: {
            findFirst: mockFindFirst,
            create: mockCreate,
          },
        })
      }
    })

    await createAppointment(PATIENT_ID, {
      doctorId: DOCTOR_ID,
      institutionId: "inst-1",
      startsAt: STARTS_AT,
    })

    expect(prisma.$transaction).toHaveBeenCalledOnce()
    expect(mockFindFirst).toHaveBeenCalledOnce()
    expect(mockCreate).toHaveBeenCalledOnce()
  })
})

// ─── Cancellation ownership ───────────────────────────────────────────────────
describe("cancelAppointment — ownership enforcement", () => {
  it("allows a patient to cancel their own appointment", async () => {
    vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
      ...baseAppointment,
      status: "PENDING",
    } as never)
    vi.mocked(prisma.appointment.update).mockResolvedValue({
      ...baseAppointment,
      status: "CANCELLED",
    } as never)

    await expect(cancelAppointment(APPT_ID, PATIENT_ID, "PATIENT")).resolves.not.toThrow()
  })

  it("throws 403 if a patient tries to cancel another patient's appointment", async () => {
    vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
      ...baseAppointment,
      patientId: "original-patient",
      status: "PENDING",
    } as never)

    await expect(cancelAppointment(APPT_ID, "other-patient-99", "PATIENT")).rejects.toMatchObject({
      statusCode: 403,
    })
  })

  it("throws 400 if the appointment is already cancelled", async () => {
    vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
      ...baseAppointment,
      status: "CANCELLED",
    } as never)

    await expect(cancelAppointment(APPT_ID, PATIENT_ID, "PATIENT")).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it("throws 400 if the appointment is already completed", async () => {
    vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
      ...baseAppointment,
      status: "COMPLETED",
    } as never)

    await expect(cancelAppointment(APPT_ID, PATIENT_ID, "PATIENT")).rejects.toMatchObject({
      statusCode: 400,
    })
  })
})

// ─── Doctor status update ─────────────────────────────────────────────────────
describe("updateDoctorAppointmentStatus — ownership enforcement", () => {
  const DOCTOR_USER_ID = "doctor-user-1"

  it("throws 403 if the appointment does not belong to the doctor", async () => {
    vi.mocked(prisma.doctor.findUnique).mockResolvedValue({
      id: "doctor-1",
      userId: DOCTOR_USER_ID,
    } as never)
    vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
      ...baseAppointment,
      doctorId: "other-doctor-99",
    } as never)

    await expect(
      updateDoctorAppointmentStatus(APPT_ID, DOCTOR_USER_ID, "CONFIRMED")
    ).rejects.toMatchObject({ statusCode: 403 })
  })

  it("allows the correct doctor to confirm their appointment", async () => {
    vi.mocked(prisma.doctor.findUnique).mockResolvedValue({
      id: DOCTOR_ID,
      userId: DOCTOR_USER_ID,
    } as never)
    vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
      ...baseAppointment,
      doctorId: DOCTOR_ID,
    } as never)
    vi.mocked(prisma.appointment.update).mockResolvedValue({
      ...baseAppointment,
      status: "CONFIRMED",
    } as never)

    await expect(
      updateDoctorAppointmentStatus(APPT_ID, DOCTOR_USER_ID, "CONFIRMED")
    ).resolves.not.toThrow()
  })
})
