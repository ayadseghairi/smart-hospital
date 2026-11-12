# Delin Smart Care — Security Documentation

**Classification:** Internal  
**Date:** 2025  
**Status:** Living document — update after every significant change and every audit finding

---

## Threat model

### Assets to protect

| Asset | Sensitivity | Notes |
|---|---|---|
| Patient PII (name, phone, email) | HIGH | Subject to Algeria Law 18-07 |
| Appointment records | HIGH | Health-adjacent; no diagnoses stored |
| Authentication credentials (passwords, tokens) | CRITICAL | — |
| Doctor license numbers | HIGH | Visible to SUPER_ADMIN only |
| Platform admin credentials | CRITICAL | Full platform access |
| SMTP credentials | HIGH | Can be used to send phishing mail |
| JWT secrets | CRITICAL | Full token forgery if leaked |

### Threat actors

| Actor | Vector | Motivation |
|---|---|---|
| External attacker | Web API, forms | Data exfiltration, defacement, spam |
| Malicious patient | Authenticated API | Access other patients' records (IDOR) |
| Compromised doctor account | Authenticated API | View/manipulate appointments |
| Malicious partner/institution | Institution admin API | Access data of other institutions |
| Insider / script kiddie | Known-endpoint guessing | Escalate to admin |
| Automated bots | Login, register, contact forms | Credential stuffing, spam, abuse |

### Trust boundaries

- **Unauthenticated requests:** rate-limited, no sensitive data returned
- **Patient JWT:** only their own appointments, profile, reviews
- **Doctor JWT:** only their own schedule, appointments, profile
- **Institution Admin JWT:** only their institution's data
- **Super Admin JWT:** all data; subject to step-up auth for destructive actions

---

## Control-by-control status

### C1. Injection

| Sub-control | Status | Where | Test |
|---|---|---|---|
| Prisma parameterized queries only | ✅ IMPLEMENTED | All service files | — |
| Ban `$queryRawUnsafe` ESLint rule | ❌ MISSING | — | Add to `eslint.config.js` |
| `ORDER BY` column whitelist | ❌ MISSING | `institutions/service.ts`, `doctors/service.ts` | Security test needed |
| Escape `%`/`_`/`\` in LIKE/contains | ❌ MISSING | `search/routes.ts` | Security test needed |
| Pagination cap (limit ≤ 50) | ❌ MISSING | All list endpoints | — |
| Zod `.strict()` on body schemas | ❌ MISSING | All schemas use `.object()` | — |
| Reject `__proto__`/`constructor` keys | ⚠️ PARTIAL | Zod strips unknown in `.object()` but not strict | — |
| Mass assignment protection | ⚠️ PARTIAL | Admin service: no spread; auth service: OK | — |
| Email header injection strip | ❌ MISSING | Template values not sanitized of CR/LF | — |
| SSRF prevention | ✅ IMPLEMENTED | No server-side URL fetching | — |
| ReDoS review | ⚠️ PARTIAL | Phone regex reviewed; search regexes need review | — |
| Log injection sanitization | ❌ MISSING | User strings logged without escaping | — |

**Fixes applied in this audit:** LIKE escaping, pagination caps, `.strict()` schemas, email header strip, ESLint `no-queryRawUnsafe` rule.

### C2. XSS and content safety

| Sub-control | Status | Where | Test |
|---|---|---|---|
| React auto-escaping relied on | ✅ | All components | — |
| Ban `dangerouslySetInnerHTML` ESLint rule | ❌ MISSING | `eslint.config.js` | Add rule |
| URL validation to `https:`/`tel:`/`mailto:` | ❌ MISSING | Institution website field | — |
| Strict CSP header | ❌ MISSING | `app.ts` / web server | — |
| `X-Content-Type-Options: nosniff` | ✅ | helmet | — |
| No user-uploaded SVG served | ✅ (no upload yet) | — | — |
| Unicode bidi character stripping | ❌ MISSING | Names, bios, search queries | — |

**Fixes applied:** `no-dangerouslySetInnerHTML` ESLint rule added. CSP headers added via helmet. URL validation added to institution/doctor schemas. Bidi strip helper added.

### C3. CSRF, CORS, clickjacking, open redirect

| Sub-control | Status | Where | Test |
|---|---|---|---|
| `SameSite=Lax` cookies | ✅ | `controller.ts` | — |
| CSRF: custom header required on state-changing requests | ❌ MISSING | No `X-Requested-With` or CSRF token check | Security test needed |
| CORS: exact origin, no `*` with credentials | ✅ | `app.ts` | — |
| `frame-ancestors 'none'` | ❌ MISSING | Only `X-Frame-Options: DENY` via helmet; no CSP frame-ancestors | — |
| Open redirect: `returnTo` validation | ❌ MISSING | Not implemented at all | Security test needed |

**Fixes applied:** `returnTo` validation helper added; CSP `frame-ancestors 'none'` added; custom header required on mutations.

### C4. Authentication and sessions

| Sub-control | Status | Where | Test |
|---|---|---|---|
| Argon2id password hashing | ✅ | `auth/service.ts` | — |
| Password minimum 10 chars (current: 8) | ❌ GAP | `auth/schema.ts` | Fix min length |
| Password max 128 chars | ❌ MISSING | `auth/schema.ts` | — |
| No user enumeration — generic responses | ✅ | `auth/service.ts` | `auth-service.test.ts` |
| Timing equalization (dummy hash) | ✅ | `auth/service.ts` login | `auth-service.test.ts` |
| Login throttling per IP and per account | ⚠️ PARTIAL | Global IP rate limit only; no per-account | — |
| Refresh token rotation | ✅ | `auth/service.ts` | — |
| Refresh token reuse detection / family revocation | ❌ MISSING | Only revokes one token; not the whole family | Security test needed |
| `isActive` re-check per request | ❌ MISSING | JWT is trusted until expiry; deactivated users keep access | Add middleware |
| TOTP 2FA | ❌ MISSING | — | P1 |
| Recovery codes | ❌ MISSING | — | P1 |
| Step-up auth for sensitive admin actions | ❌ MISSING | — | P1 |
| New-device/IP login alert | ❌ MISSING | — | P1 |
| Shorter session for SUPER_ADMIN / INSTITUTION_ADMIN | ❌ MISSING | All roles get the same 15m/30d tokens | — |
| Tokens: 32+ bytes from CSPRNG, stored hashed | ✅ | `lib/tokens.ts` | `tokens.test.ts` |
| Single-use tokens | ✅ | `auth/service.ts` | `auth-service.test.ts` |
| Tokens consumed via POST | ✅ | All token endpoints use POST | — |
| No tokens in localStorage | ✅ | Access token in memory only | `api/client.js` |
| Active sessions list | ❌ MISSING | No UI; no `GET /auth/sessions` endpoint | P0 |
| Sign-out everywhere | ❌ MISSING | No `POST /auth/sessions/revoke-all` | P0 |

### C5. Authorization (BOLA/IDOR)

| Sub-control | Status | Where | Test |
|---|---|---|---|
| Deny by default (all routes declare roles) | ✅ | All module routes | — |
| BOLA: scope every query by caller | ✅ | `appointments/service.ts` | `appointments-service.test.ts` |
| Non-sequential IDs (cuid/uuid) | ✅ | Prisma schema uses `cuid()` | — |
| Return 404 (not 403) for other users' resources | ✅ | `appointments/service.ts` | — |
| Horizontal escalation tests (patient A vs B) | ✅ | `appointments-service.test.ts` | — |
| Vertical escalation tests (each role calling higher) | ❌ MISSING | No test matrix | Security test needed |
| Institution admin scoped to own institution | ⚠️ PARTIAL | No institution admin area yet | — |
| All admin actions written to AuditLog | ⚠️ PARTIAL | `lib/audit.ts` exists; not called on all actions | — |

### C6. Abuse, availability and business logic

| Sub-control | Status | Where | Test |
|---|---|---|---|
| Rate limits on all public endpoints | ⚠️ PARTIAL | Auth and email endpoints only | — |
| Rate limit on search and assistant | ❌ MISSING | — | — |
| Rate limit on booking | ❌ MISSING | — | — |
| Email bombing protection (cap per address/IP per hour) | ❌ MISSING | `emailRateLimit` is 5/hour per IP only | — |
| Limit active pending bookings per patient | ❌ MISSING | — | — |
| Prevent booking in the past | ❌ MISSING | No server-side past-slot check | — |
| Double booking prevention | ✅ | `appointments/service.ts` + DB unique constraint | `appointments-service.test.ts` |
| Reviews only after COMPLETED appointment | ⚠️ PARTIAL | Schema has review model; no endpoint yet | — |
| One review per appointment | ⚠️ PARTIAL | Schema has unique constraint; no endpoint yet | — |
| Pagination caps | ❌ MISSING | No `limit ≤ 50` enforcement | — |
| Request body JSON depth limit | ❌ MISSING | `express.json()` limit is size only | — |
| DB query timeouts | ❌ MISSING | No Prisma query timeout | — |
| Graceful shutdown | ❌ MISSING | No SIGTERM handler | — |
| Honeypot field on public forms | ❌ MISSING | — | — |

### C7. Transport, headers, configuration

| Sub-control | Status | Where | Test |
|---|---|---|---|
| HTTPS only in production | ✅ (documented) | README | — |
| HSTS | ⚠️ PARTIAL | helmet default (no preload, no long max-age) | — |
| `trust proxy` correct | ❌ MISSING | Not set in `app.ts` — IP-based limits may read wrong IP | Fix needed |
| helmet defaults | ✅ | `app.ts` | — |
| `Referrer-Policy: no-referrer` | ✅ | `app.ts` | — |
| `Permissions-Policy` | ❌ MISSING | Not set | — |
| COOP/CORP | ❌ MISSING | Not set | — |
| Remove `X-Powered-By` | ✅ | helmet removes it | — |
| `Cache-Control: no-store` on auth/sensitive responses | ❌ MISSING | — | — |
| Source maps not served publicly | ⚠️ PARTIAL | Vite generates `.map` files; production server must block them | — |
| No secrets in frontend bundle | ✅ | Only `VITE_API_BASE_URL` exposed | — |
| Generic 5xx error messages with request ID | ❌ MISSING | No request ID; stack trace not leaked but also no ID | — |

### C8. Data protection and privacy

| Sub-control | Status | Where | Test |
|---|---|---|---|
| No medical records / diagnoses | ✅ | Appointment `reason` is optional/short | — |
| No PII in logs | ⚠️ PARTIAL | pino used; no explicit redaction | — |
| Least-privilege DB user | ❌ (undocumented) | docker-compose uses superuser; docs need separate migration user | — |
| Encrypted backups | ❌ (undocumented) | README mentions backups but no runbook | — |
| Field-level encryption for `licenseNumber` | ❌ MISSING | — | P2 |
| Gitleaks scan | ❌ MISSING | No CI check | — |
| Data export endpoint | ✅ | `GET /auth/export` | — |
| Account deletion (soft, anonymize) | ✅ | `DELETE /auth/account` | — |
| Consent records tied to policy version | ❌ MISSING | `consentAcceptedAt` exists but no policy version tracked | — |

### C9. Uploads

| Sub-control | Status | Notes |
|---|---|---|
| Doctor photo upload | ❌ NOT IMPLEMENTED | No upload endpoint yet; when added must validate magic bytes, re-encode with sharp, random filenames, no SVG |

### C10. Email and SMTP security

| Sub-control | Status | Notes |
|---|---|---|
| TLS to SMTP server | ✅ | Configured in `lib/mail.ts` |
| No credentials in logs | ✅ | `mail.ts` never logs `SMTP_PASS` |
| SPF, DKIM, DMARC documentation | ⚠️ PARTIAL | Documented in README but not enforced |
| Plain-text alternative in emails | ✅ | `buildVerifyEmailEmail` returns both HTML and text |
| No medical details in emails | ✅ | Templates only include names, times, links |
| Unsubscribe/manage link | ⚠️ PARTIAL | "Manage notifications" link mentioned in spec but not in templates |

### C11. Supply chain

| Sub-control | Status | Notes |
|---|---|---|
| Lockfiles committed | ✅ | `package-lock.json` present |
| `npm audit` in CI (BLOCKING) | ✅ | Server: `--omit=dev --audit-level=high --ignore-advisories 1243066`; Frontend: `--omit=dev --audit-level=high`; both exit 0. `.github/workflows/server.yml` + `frontend.yml` — `continue-on-error` removed. |
| Advisory 1243066 / GHSA-mrhx-c7xc-m3w5 (zod) | Accepted | Zod v3 memory exhaustion on oversized constrained collections. Fix = upgrade to zod v4 (breaking). **Mitigated by:** explicit `.max()` on all schemas, express body size limit (100 kb), rate limiting. Accepted risk; schedule zod v4 migration post-launch. |
| Dependabot / Renovate | ❌ MISSING | — |
| No CDN scripts | ✅ | `boxicons` uninstalled; all icons via tree-shaken `lucide-react` |
| `eslint-plugin-security` | ❌ MISSING | — |
| gitleaks in CI (BLOCKING) | ✅ | `.github/workflows/frontend.yml` — `continue-on-error` removed; `.gitleaks.toml` allowlist for CI placeholder values |
| nodemailer upgraded | ✅ | Upgraded to 10.5.0 to clear critical/high CVEs |
| argon2 upgraded | ✅ | Upgraded to 0.45.2 to clear critical CVEs |
| react-router-dom upgraded | ✅ | Upgraded to 6.30.6; remaining 2 advisories are moderate (below threshold) |

### C12. Security tests

| Test | Status | File |
|---|---|---|
| Phone normalization | ✅ | `tests/unit/phone.test.ts` |
| Token flows (expiry, single-use, hashed) | ✅ | `tests/unit/tokens.test.ts`, `auth-service.test.ts` |
| Double booking prevention | ✅ | `tests/unit/appointments-service.test.ts` |
| IDOR: patient A vs patient B | ✅ | `tests/unit/appointments-service.test.ts` |
| Reminder idempotency | ✅ | `tests/unit/reminder-idempotency.test.ts` |
| Mass assignment (role field in register) | ❌ MISSING | Planned |
| Vertical role escalation matrix | ❌ MISSING | Planned |
| SQLi payloads in search/filter | ❌ MISSING | Prisma parameterized queries make this low risk |
| XSS payloads in text fields | ❌ MISSING | React escapes by default; no `dangerouslySetInnerHTML` (ESLint enforced) |
| Open redirect on `returnTo` | ❌ MISSING | Covered by `src/lib/returnTo.js` allowlist logic |
| Rate limit and lockout | ❌ MISSING | Planned |
| Refresh token family reuse detection | ✅ | `tests/unit/totp.test.ts` — "Refresh token family reuse detection" suite |
| TOTP 2FA (AES crypto, MFA tokens, replay, recovery codes) | ✅ | `tests/unit/totp.test.ts` (9 tests) |
| SUPER_ADMIN gate flow (login→pw-change→2FA→/admin) | ✅ | `tests/unit/super-admin-flow.test.ts` (4 tests) |
| Bootstrap idempotency + no-log of initial password | ✅ | `tests/unit/bootstrap.test.ts` (4 tests) |
| Email template rendering (30 templates) | ✅ | `tests/unit/email-templates.test.ts` |
| Security headers present | ❌ MISSING | Planned |
| CSRF rejection | ❌ MISSING | Planned |

---

## Residual risks and items requiring human decisions

| Item | Risk | Recommendation |
|---|---|---|
| Hosting location | Algeria Law 18-07 may require data to remain in Algeria | **Consult a lawyer before launch** |
| SMTP domain (SPF/DKIM/DMARC) | Emails may be marked spam or spoofed | Set up proper sending domain before launch |
| External penetration test | Code review cannot find all vulnerabilities | Commission a pentest before public launch |
| Pharmacy duty rota | No verified data source | Do not build until a real source is confirmed |
| TOTP 2FA mandatory for SUPER_ADMIN | Platform admin account is highest-risk | Schema and middleware implemented; enrollment UI needed before production |
| SMS/OTP for phone-only registration | Phone numbers unverifiable without SMS | Keep OTP deferred; enforce email verification for booking |
| Analytics | Owner has not opted in to any analytics | Do not add any tracking without explicit owner decision |
| Algerian public holidays | Hard-coding is a maintenance burden | Keep as configurable data in DB |
| Backup / restore runbook | Undocumented | Write and test before launch |
| DB migration credentials | docker-compose uses same user for runtime and migration | Separate credentials for production |
| **Temporary password in `.env`** | `SUPER_ADMIN_INITIAL_PASSWORD` sits in `.env` until removed; mitigations: (1) minimum 16 chars, (2) forced change at first login, (3) argon2id hash at rest, (4) never logged or emailed, (5) idempotent bootstrap skips if admin exists. Owner must `chmod 600 .env` and delete the variable immediately after first login. | Accepted risk — mitigations applied |

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| 1.0 | 2025 | Initial audit and security hardening |
| 2.0 | 2025-11-12 | TOTP 2FA end-to-end (AES-256-GCM, otpauth, ±1 step, replay protection, 10 hashed recovery codes, two-step login); refresh token family reuse detection; step-up re-auth (`POST /auth/step-up`); NEW_DEVICE_LOGIN email for staff; CI hardened (npm audit + gitleaks BLOCKING); zod advisory documented as accepted risk; nodemailer/argon2/react-router-dom upgraded; boxicons removed; EmergencyPage commune picker; ForceChangePasswordPage auth guard; InstitutionPage report-error link; OWNER_ACTIONS.md created |
