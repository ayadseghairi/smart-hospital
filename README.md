# منصة دلين الصحية الذكية — Delin Smart Care

A bilingual (Arabic RTL + French) digital health platform for **Khenchela Province (wilaya 40), Algeria**.

**Stack:** React 18 + Vite + Tailwind (frontend) · Node 20 + Express + Prisma + PostgreSQL (backend)

---

## Quick Start — local development

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20+ |
| npm | 9+ |
| Docker & Docker Compose | any recent version |

### 1. Clone and install

```bash
git clone https://github.com/ayadseghairi/smart-hospital.git
cd smart-hospital

# Frontend dependencies
npm install

# Backend dependencies
cd server && npm install && cd ..
```

### 2. Start infrastructure (PostgreSQL + Mailpit)

```bash
docker compose up -d
```

Services:
- **PostgreSQL 16** on `localhost:5432` — database `delin_dev`, user `delin`, password `delin_dev_pass`
- **Mailpit** on `http://localhost:8025` — catches all outgoing emails in development (no real SMTP needed)

### 3. Configure the backend

```bash
cp server/.env.example server/.env
# Edit server/.env — see variable reference below.
# The defaults in .env.example already point to the Docker Compose services.
```

Required variables that have no default and must be set:

```
JWT_ACCESS_SECRET=<at-least-32-random-chars>
JWT_REFRESH_SECRET=<at-least-32-random-chars>
```

For SMTP, the default `server/.env.example` uses Mailpit (`SMTP_HOST=localhost`, `SMTP_PORT=1025`, `SMTP_SECURE=false`), so you do not need a real SMTP server in development.

### 4. Migrate and seed the database

```bash
cd server

# Apply migrations
npx prisma migrate dev

# Seed reference data (wilaya, communes, specialties, emergency numbers)
npm run seed

# Validate the seed (lists institutions missing phone or coordinates)
npm run seed:validate
```

### 5. Create the first super admin

Edit `server/.env` and fill in the bootstrap variables:

```bash
SUPER_ADMIN_EMAIL=you@yourcompany.dz
SUPER_ADMIN_FULL_NAME=Your Full Name
# Choose a strong temporary password (≥16 chars).
# You MUST remove this variable from .env after your first login.
SUPER_ADMIN_INITIAL_PASSWORD=<at-least-16-random-chars>
```

Then run:

```bash
cd server && npm run create-super-admin
```

**If `SUPER_ADMIN_INITIAL_PASSWORD` is set:** The account is created with that password (hashed with argon2id). You will receive a "Your administrator account is ready" email (no password inside — login link only). At first login you will be forced to change the password before accessing anything else.

**If `SUPER_ADMIN_INITIAL_PASSWORD` is empty:** An invitation email with a set-password link is sent instead.

**After the first login:**
1. Change your password when prompted (minimum 14 characters for super admin).
2. Complete TOTP 2FA enrollment at `/account/security/2fa-setup` — you cannot reach `/admin` until enrolled.
3. **Delete `SUPER_ADMIN_INITIAL_PASSWORD` from `server/.env`.**

To reset the super admin password in an emergency (server shell only):

```bash
cd server && npm run reset-super-admin-password
```

### 6. Start the services

```bash
# In separate terminals:

# Backend API
cd server && npm run dev

# Background job worker (reminders, notifications, digests)
cd server && npm run worker

# Frontend (Vite dev server)
npm run dev
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| API | `http://localhost:4000/api/v1` |
| Mailpit (email inbox) | `http://localhost:8025` |

---

## Project structure

```
smart-hospital/
├── src/                        # React frontend
│   ├── api/                    # fetch wrapper (client.js)
│   ├── components/             # shared components
│   │   ├── common/Avatar.jsx   # CSS initials avatar (no placeholder images)
│   │   ├── ProtectedRoute.jsx  # role-gated route guard
│   │   └── Sections/           # page section components
│   ├── contexts/               # AuthContext
│   ├── i18n/locales/           # ar.json + fr.json translation files
│   ├── lib/brand.js            # BRAND constant (single source of product name)
│   └── pages/                  # route-level pages (React.lazy)
├── server/
│   ├── prisma/
│   │   ├── schema.prisma       # 16 Prisma models
│   │   ├── seed.ts             # reference data only (wilaya, specialties, emergency)
│   │   └── data/
│   │       └── khenchela-institutions.json  # institution templates (fill & verify)
│   ├── src/
│   │   ├── app.ts              # Express app
│   │   ├── server.ts           # HTTP server entry
│   │   ├── worker.ts           # pg-boss job worker
│   │   ├── config/env.ts       # Zod-validated env; fails fast on missing vars
│   │   ├── lib/                # prisma, jwt, tokens, phone, geo, audit, mail
│   │   ├── middleware/         # auth, requireRole, validate, errorHandler, rateLimit
│   │   └── modules/            # auth, institutions, doctors, appointments, search,
│   │                           # emergency, assistant, admin, notifications
│   ├── scripts/
│   │   ├── create-super-admin.ts
│   │   └── mail-test.ts
│   └── tests/                  # vitest unit tests (fixtures stay in tests/ only)
├── scripts/
│   └── check-no-fake-data.js   # CI: fails if Saudi/mock data found in src/
├── docker-compose.yml
└── .github/workflows/          # frontend.yml, server.yml
```

---

## npm scripts

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run check:no-fake-data` | Fail if mock/Saudi data found in `src/` |

### Backend (`cd server`)

| Command | Description |
|---|---|
| `npm run dev` | ts-node-dev API server |
| `npm run worker` | pg-boss job worker |
| `npm run build` | TypeScript compile |
| `npm run seed` | Seed reference data |
| `npm run seed:validate` | List incomplete institution records |
| `npm run create-super-admin` | Bootstrap the first super admin from `.env` |
| `npm run reset-super-admin-password` | Emergency password reset for SUPER_ADMIN (interactive) |
| `npm run mail:test -- you@email.dz` | Send a test email to validate SMTP settings |
| `npm run mail:preview` | Render all templates to `.mail-preview/` (browser preview) |
| `npx vitest run` | Run all unit tests |
| `npx prisma studio` | Browse the database in the browser |

---

## SMTP configuration

All SMTP settings are in `server/.env`. The server refuses to start if `MAIL_ENABLED=true` and any SMTP variable is missing.

**Development (Mailpit):**
```
MAIL_ENABLED=true
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```
Emails appear at `http://localhost:8025` — no real SMTP credentials needed.

**Production:**
Use a dedicated sending domain with SPF, DKIM and DMARC configured.
Free webmail SMTP (e.g. Gmail) has low daily limits and is not suitable for production.

Validate your settings at any time:
```bash
cd server && npm run mail:test -- ops@yourdomain.dz
```

---

## Adding an institution

1. Open `server/prisma/data/khenchela-institutions.json`.
2. Fill in the typed template for the institution: name (Arabic + French), address, commune, phone, coordinates (lat/lng from maps), `hasEmergency24h`, opening hours.
3. Set `"status": "VERIFIED"` and fill `"sourceNote"` with the verification source and date.
4. Run `npm run seed:validate` — the institution should no longer appear in the missing-data list.
5. Re-run `npm run seed` or insert the record via the super-admin dashboard.

Institutions with `status: "DRAFT"` are **never shown publicly**. Only `VERIFIED` institutions (with a `sourceNote`) are visible to users.

---

## Account and role management

Accounts follow strict rules:

| Who creates it | Role |
|---|---|
| Public sign-up (`POST /auth/register`) | `PATIENT` only |
| `SUPER_ADMIN` via dashboard or API | `DOCTOR`, `INSTITUTION_ADMIN` |

Doctors and institution admins never choose their password at creation. They receive an **invitation email** with a link to set their password. The link expires after `INVITE_TTL_HOURS` (default 48 h) and can be re-sent from the super-admin dashboard.

The first super admin is created **only** via `npm run create-super-admin`.

---

## Worker and notifications

The background worker (`server/src/worker.ts`) uses **pg-boss** (jobs stored in PostgreSQL, no Redis needed). Start it with `npm run worker`.

The worker handles:
- Appointment confirmation / cancellation emails to patients and doctors
- Reminder emails at configurable offsets before each confirmed appointment (`REMINDER_OFFSETS_HOURS`, default `24,2`)
- Doctor daily agenda digest at `DOCTOR_DIGEST_HOUR` (Africa/Algiers local time)
- A safety sweep every 5 minutes to recover from worker downtime

All emails are idempotency-keyed — restarting the worker never sends duplicates.

---

## Algerian emergency numbers

Seeded from `server/prisma/seed.ts`:

| Service | Number |
|---|---|
| Protection civile | **14** |
| Police | **17** |
| Gendarmerie nationale | **1055** |
| SAMU | **115** |

---

## Legal notice

This platform processes personal health data. In Algeria, **Law 18-07** on personal data protection applies. Restrictions on hosting or transferring data outside Algeria may apply. **Consult a legal professional before production launch.**

---

## Zero fake data policy

The CI step `npm run check:no-fake-data` fails the build if the `src/` directory contains:
`placeholder`, `via.placeholder`, `dummyData`, `mock` identifiers, "ريال", `+966`, `997`, "الملك فهد", "John Doe", "Lorem ipsum".

**No demo seed exists.** Real doctors are created by the super admin via invite; real patients register themselves. For local development, use the same flows (Mailpit catches the emails).

---

## Configuration reference

See `server/.env.example` for the full list. Key variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | ≥32 chars, access token signing |
| `JWT_REFRESH_SECRET` | ≥32 chars, refresh token signing |
| `MAIL_ENABLED` | `true` = real SMTP; `false` = log to console |
| `SMTP_HOST/PORT/SECURE/USER/PASS` | SMTP credentials |
| `MAIL_FROM_NAME` | Sender display name (default: Delin Smart Care) |
| `APP_BASE_URL` | Frontend URL — used in email links |
| `REMINDER_OFFSETS_HOURS` | Comma-separated hours before appointment (default: `24,2`) |
| `DOCTOR_DIGEST_HOUR` | Local hour for doctor daily digest (default: `7`) |
| `SUPER_ADMIN_EMAIL` | Used by `create-super-admin` script |
| `TZ` | Must be `Africa/Algiers` |

---

## Linting and code quality

```bash
npm run lint              # ESLint (frontend)
cd server && npx tsc --noEmit   # TypeScript check (backend)
cd server && npx vitest run     # 60+ unit tests
```

The ESLint config is in [`eslint.config.js`](./eslint.config.js).

---

© Delin Smart Care — Khenchela, Algeria
