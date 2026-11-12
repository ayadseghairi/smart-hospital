# منصة دلين الصحية الذكية — Delin Smart Care

A bilingual (Arabic RTL + French) digital health platform for **Khenchela Province (wilaya 40), Algeria**.

**Stack:** React 18 + Vite + Tailwind (frontend) · Node 20 + Express + Prisma + PostgreSQL (backend)

---

## Quick Start — local development

### Prerequisites

| Tool | Minimum version | Download |
|---|---|---|
| Node.js | 20 LTS | https://nodejs.org |
| npm | 9 (bundled with Node 20) | — |
| Docker Desktop | any recent | https://www.docker.com/products/docker-desktop/ |
| Git | any recent | https://git-scm.com |

> **Windows note:** use **Git Bash** or **PowerShell** for all commands below.
> Do **not** use the legacy `cmd.exe` — some npm lifecycle scripts use Unix shell syntax.

---

## 🐧 Linux / macOS

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

Services started:

| Service | URL / address |
|---|---|
| PostgreSQL 16 | `localhost:5432` — db `delin_dev`, user `delin`, password `delin_dev_pass` |
| Mailpit (email catcher) | `http://localhost:8025` — no real SMTP needed in dev |

### 3. Configure the backend

```bash
cp server/.env.example server/.env
```

Open `server/.env` in your editor and set the two required secrets (everything else has working defaults):

```bash
# Generate two independent secrets — run each line separately:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Paste the output into `.env`:

```
JWT_ACCESS_SECRET=<first output>
JWT_REFRESH_SECRET=<second output>
```

Generate the TOTP encryption key (required for 2FA):

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```
MFA_ENCRYPTION_KEY=<output — must be exactly 64 hex chars>
```

### 4. Migrate and seed the database

```bash
cd server

npx prisma migrate dev        # applies all migrations
npm run seed                  # seeds wilaya, communes, specialties, emergency numbers
npm run seed:validate         # lists institutions missing phone or coordinates
```

### 5. Create the first super admin

Edit `server/.env`:

```
SUPER_ADMIN_EMAIL=you@yourcompany.dz
SUPER_ADMIN_FULL_NAME=Your Full Name
SUPER_ADMIN_INITIAL_PASSWORD=<strong-password-min-16-chars>
```

Then:

```bash
cd server && npm run create-super-admin
```

**After first login:**
1. Change your password when prompted (min 14 chars for SUPER_ADMIN).
2. Enroll TOTP 2FA at `/account/security/2fa-setup` — required to reach `/admin`.
3. **Remove `SUPER_ADMIN_INITIAL_PASSWORD` from `.env` immediately.**

Emergency password reset (local shell only):

```bash
cd server && npm run reset-super-admin-password
```

### 6. Start all services (three terminals)

```bash
# Terminal 1 — Backend API
cd server && npm run dev

# Terminal 2 — Background worker (reminders, notifications, digests)
cd server && npm run worker

# Terminal 3 — Frontend (Vite)
npm run dev
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| API | `http://localhost:4000/api/v1` |
| Mailpit inbox | `http://localhost:8025` |

---

## 🪟 Windows

> All commands below assume **Git Bash** (installed with Git for Windows).
> In PowerShell, replace `cp` with `Copy-Item` and `/` path separators work as-is.

### 1. Install prerequisites

1. Download and install **Node.js 20 LTS** from https://nodejs.org — accept the default options including "Add to PATH".
2. Install **Docker Desktop** from https://www.docker.com/products/docker-desktop/ — enable WSL 2 backend when prompted.
3. Install **Git for Windows** from https://git-scm.com — choose "Git Bash Here" in context menu.

Verify in Git Bash:

```bash
node --version    # should print v20.x.x
npm --version     # should print 9.x.x or 10.x.x
docker --version  # should print Docker version 24.x or higher
```

### 2. Clone and install (Git Bash)

```bash
git clone https://github.com/ayadseghairi/smart-hospital.git
cd smart-hospital

npm install
cd server && npm install && cd ..
```

### 3. Start infrastructure

```bash
docker compose up -d
```

Wait ~15 seconds for PostgreSQL to be ready. Check it with:

```bash
docker compose ps
```

Both `db` and `mailpit` should show `healthy` or `running`.

### 4. Configure the backend (Git Bash)

```bash
cp server/.env.example server/.env
```

Open `server/.env` in Notepad (or VS Code) and generate secrets:

```bash
# Run in Git Bash — copy each output into .env:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set in `server/.env`:

```
JWT_ACCESS_SECRET=<first output>
JWT_REFRESH_SECRET=<second output>
MFA_ENCRYPTION_KEY=<third output — must be exactly 64 hex chars>
```

The SMTP defaults (`SMTP_HOST=localhost`, `SMTP_PORT=1025`) already point to Mailpit — no changes needed for local email testing.

### 5. Migrate and seed (Git Bash)

```bash
cd server
npx prisma migrate dev
npm run seed
```

### 6. Create the first super admin

Edit `server/.env`:

```
SUPER_ADMIN_EMAIL=you@yourcompany.dz
SUPER_ADMIN_FULL_NAME=Your Name
SUPER_ADMIN_INITIAL_PASSWORD=<strong-password-min-16-chars>
```

```bash
cd server && npm run create-super-admin
```

**After first login:** change password → enroll 2FA → delete `SUPER_ADMIN_INITIAL_PASSWORD` from `.env`.

### 7. Start all services (three Git Bash windows)

```bash
# Window 1 — Backend API
cd server && npm run dev

# Window 2 — Background worker
cd server && npm run worker

# Window 3 — Frontend
cd .. && npm run dev        # or open a new Git Bash at the project root
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| API | `http://localhost:4000/api/v1` |
| Mailpit inbox | `http://localhost:8025` |

### Windows-specific troubleshooting

| Symptom | Fix |
|---|---|
| `prisma migrate dev` fails with "could not connect to server" | Docker Desktop is not running — start it from the taskbar tray icon |
| `npm run dev` fails with `EACCES` or `EPERM` | Run Git Bash as Administrator, or move the project outside `C:\Program Files\` |
| Port 5432 already in use | Another PostgreSQL is installed. Stop it: `net stop postgresql` in PowerShell |
| Long paths error during `npm install` | Enable long paths: `git config --system core.longpaths true` (run as Administrator) |
| Vite HMR not updating | Windows Defender may block file watching — add the project folder to exclusions |

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
