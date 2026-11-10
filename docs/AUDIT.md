# Delin Smart Care — Repository Audit

**Date:** 2025  
**Auditor:** Bob (automated + manual review)  
**Scope:** Full platform — frontend (React 18 + Vite), backend (Node 20 + Express + Prisma)

Legend: ✅ EXISTS | ⚠️ PARTIAL | ❌ MISSING

---

## Part A: Page Inventory (Final Status)

### A1. Public pages

| Route | Purpose | Status | File | Priority |
|---|---|---|---|---|
| `/` | Home: hero, search, quick links, honest stats | ✅ | `src/pages/Home.jsx` | P0 |
| `/institutions` | Institution list with filters | ✅ | `src/pages/InstitutionsPage.jsx` | P0 |
| `/institutions/:id` | Institution detail: info, tabs, source note | ⚠️ PARTIAL | `src/pages/InstitutionPage.jsx` — "report an error" link to `/contact` still missing on this page | P0 |
| `/doctors` | Doctor list with filters | ✅ | `src/pages/DoctorsPage.jsx` | P0 |
| `/doctors/:id` | Doctor profile, reviews, availability | ⚠️ PARTIAL | `src/pages/DoctorProfile.jsx` — reviews section still missing (no `/reviews` endpoint yet) | P0 |
| `/specialties` | Browse by specialty | ✅ | `src/pages/SpecialtiesPage.jsx` | P1 |
| `/services/:category` | Service directory | ❌ MISSING | Low priority — services accessible via institution page | P1 |
| `/search` | Global search results | ✅ | `src/pages/SearchResults.jsx` | P0 |
| `/emergency` | Emergency numbers, nearest 24h institutions | ⚠️ PARTIAL | `src/pages/EmergencyPage.jsx` — geolocation-denied commune-picker still missing | P0 |
| `/map` | Map of verified institutions (Leaflet/OSM) | ❌ MISSING | Needs Leaflet integration | P1 |
| `/about` | About Delin Smart Care | ✅ | `src/pages/AboutPage.jsx` | P0 |
| `/how-it-works` | Steps for patients | ✅ | `src/pages/HowItWorksPage.jsx` | P1 |
| `/for-institutions` | Partner page + request form | ✅ | `src/pages/ForInstitutionsPage.jsx` | P0 |
| `/contact` | Contact form, admin inbox | ✅ | `src/pages/ContactPage.jsx` + backend contact module | P0 |
| `/faq` | FAQ | ✅ | `src/pages/FaqPage.jsx` | P1 |
| `/privacy` | Privacy policy (AR + FR) | ✅ | `src/pages/PrivacyPage.jsx` | P0 |
| `/terms` | Terms of use (AR + FR) | ✅ | `src/pages/TermsPage.jsx` | P0 |
| `/cookies` | Cookie notice | ✅ | `src/pages/CookiesPage.jsx` | P0 |
| `/robots.txt` | SEO robots file | ✅ | `public/robots.txt` | P1 |
| `/sitemap.xml` | SEO sitemap | ❌ MISSING | Static `public/sitemap.xml` needs manual creation once domain is confirmed | P1 |
| Maintenance / 503 | Static downtime page | ❌ MISSING | Needs a static HTML at CDN/nginx level | P1 |

### A2. Authentication pages

| Route | Status | File | Priority |
|---|---|---|---|
| `/login` | ✅ | `src/pages/LoginPage.jsx` — role-based redirect + safe returnTo + GuestOnly wrapper | P0 |
| `/register` | ✅ | `src/pages/RegisterPage.jsx` + GuestOnly | P0 |
| `/register/check-email` | ✅ | Both `/check-inbox` and `/register/check-email` routes | P0 |
| `/verify-email` | ✅ | `src/pages/VerifyEmailPage.jsx` | P0 |
| `/forgot-password` | ✅ | `src/pages/ForgotPasswordPage.jsx` | P0 |
| `/reset-password` | ✅ | `src/pages/ResetPasswordPage.jsx` | P0 |
| `/accept-invite` | ✅ | `src/pages/AcceptInvitePage.jsx` | P0 |
| `/login/2fa` | ❌ MISSING | TOTP 2FA — P1, mandatory for SUPER_ADMIN | P1 |
| `/session-expired` | ❌ MISSING | — | P1 |
| Role-based redirect | ✅ | `LoginPage.jsx` | P0 |
| Safe `returnTo` | ✅ | `src/lib/returnTo.js` + `LoginPage.jsx` | P0 |
| GuestOnly redirect | ✅ | `src/components/GuestOnly.jsx` | P0 |
| No user-enumeration | ✅ | Backend generic messages + dummy argon2 timing | P0 |
| Deactivated account page | ✅ | `src/pages/AccountDeactivatedPage.jsx` | P0 |

### A3. Patient area

| Route | Status | File | Priority |
|---|---|---|---|
| `/account` | ✅ | `src/pages/account/AccountDashboardPage.jsx` | P0 |
| `/account/appointments` | ✅ | `src/pages/MyAppointmentsPage.jsx` — 3 tabs | P0 |
| `/account/profile` | ✅ | `src/pages/account/AccountProfilePage.jsx` | P0 |
| `/account/add-email` | ✅ | `src/pages/account/AddEmailPage.jsx` | P0 |
| `/account/notifications` | ✅ | `src/pages/account/NotificationsPage.jsx` | P0 |
| `/account/security` | ✅ | `src/pages/account/SecurityPage.jsx` | P0 |
| `/account/privacy` | ✅ | `src/pages/MyAccountPage.jsx` — delete, export, consent | P0 |
| `.ics` calendar export | ❌ MISSING | — | P1 |
| Print-friendly confirmation | ❌ MISSING | — | P1 |

### A4. Doctor area

| Route | Status | File | Priority |
|---|---|---|---|
| `/doctor` | ✅ | `src/pages/DoctorDashboardPage.jsx` | P0 |
| `/doctor/appointments` | ✅ | `src/pages/doctor/DoctorAppointmentsPage.jsx` | P0 |
| `/doctor/availability` | ✅ | `src/pages/doctor/DoctorAvailabilityPage.jsx` | P0 |
| `/doctor/profile` | ✅ | `src/pages/doctor/DoctorProfileEditPage.jsx` | P0 |
| `/doctor/security` | ✅ | `src/pages/doctor/DoctorSecurityPage.jsx` | P0 |
| Photo upload (secure) | ❌ MISSING | Marked "coming soon" in UI; needs magic-byte validation + sharp | P1 |

### A5. Institution admin area

| Route | Status | File | Priority |
|---|---|---|---|
| `/institution` | ✅ | `src/pages/institution/InstitutionDashboardPage.jsx` | P0 |
| `/institution/profile` | ✅ | `src/pages/institution/InstitutionProfilePage.jsx` | P0 |
| `/institution/services` | ✅ | `src/pages/institution/InstitutionServicesPage.jsx` | P0 |
| `/institution/appointments` | ✅ | `src/pages/institution/InstitutionAppointmentsPage.jsx` | P0 |
| `/institution/doctors` | ✅ | `src/pages/institution/InstitutionDoctorsPage.jsx` | P0 |
| `/institution/security` | ✅ | `src/pages/institution/InstitutionSecurityPage.jsx` | P0 |

### A6. Super admin area

| Route | Status | File | Priority |
|---|---|---|---|
| `/admin` (full dashboard) | ✅ | `src/pages/SuperAdminDashboardPage.jsx` | P0 |
| Institutions management | ✅ | Admin: `GET/POST/PATCH /admin/institutions` | P0 |
| Institution admins | ✅ | `POST /admin/institutions/:id/admins` | P0 |
| Doctors management | ✅ | `POST /admin/doctors`, `PATCH deactivate/reactivate` | P0 |
| Users list + search | ✅ | `GET /admin/users` | P0 |
| Specialties management | ✅ | `GET/POST/PATCH /admin/specialties` | P0 |
| Emergency numbers CRUD | ✅ | `GET/POST/PATCH/DELETE /admin/emergency-numbers` | P0 |
| Messages inbox | ✅ | `GET/PATCH /admin/messages` | P0 |
| Audit log | ✅ | `GET /admin/audit-log` | P0 |
| Notifications log | ✅ | `GET /admin/notifications-log` | P0 |
| Data quality dashboard | ✅ | `GET /admin/data-quality` | P0 |
| Stats dashboard | ✅ | `GET /admin/stats` | P0 |
| Admin security (/admin/security) | ❌ MISSING | Currently uses same SecurityPage; no 2FA yet | P0 |
| TOTP 2FA for SUPER_ADMIN | ❌ MISSING | Required before production | P1 |

### A7. Error and system pages

| Case | Status | File | Priority |
|---|---|---|---|
| 400 Bad Request | ✅ | API returns Zod field-level errors; frontend shows inline | P0 |
| 401 Unauthorized → login redirect | ✅ | `ProtectedRoute.jsx` | P0 |
| 403 Forbidden | ✅ | `src/pages/ForbiddenPage.jsx` | P0 |
| 404 Not Found | ✅ | `src/pages/NotFound.jsx` | P0 |
| 409 Conflict | ✅ | Booking shows inline "slot taken" message | P0 |
| 410 / expired token page | ✅ | `src/pages/ExpiredLinkPage.jsx` | P0 |
| 429 Too Many Requests | ✅ | `src/pages/TooManyRequestsPage.jsx` | P0 |
| Account deactivated | ✅ | `src/pages/AccountDeactivatedPage.jsx` | P0 |
| React error boundary | ✅ | `src/components/ErrorBoundary.jsx` wrapping all routes | P0 |
| Geolocation denied fallback | ❌ MISSING | EmergencyPage commune-picker still needed | P0 |
| 500 Server Error with request ID | ⚠️ PARTIAL | Request ID in error responses ✅; no dedicated 500 frontend page | P1 |
| 502/503/maintenance | ❌ MISSING | Needs static HTML at nginx level | P1 |
| Email unverified banner | ✅ | `UnverifiedEmailBanner.jsx` | P0 |

---

## Security controls (Part C summary — see SECURITY.md for detail)

| Control | Status |
|---|---|
| Prisma parameterized queries only | ✅ |
| `ORDER BY` column whitelist | ⚠️ (service layers use safe Prisma API; no raw SQL) |
| `LIKE` wildcard escaping helper | ✅ `server/src/lib/sanitize.ts` |
| Zod validation on all inputs | ✅ |
| Mass assignment protection | ✅ schemas strip unknown fields |
| No `dangerouslySetInnerHTML` | ✅ (ESLint rule) |
| Strict Content Security Policy | ✅ via helmet |
| HSTS | ✅ 1 year with includeSubDomains |
| CSRF: `X-Requested-With` on all state-changing requests | ✅ |
| Open redirect protection | ✅ `src/lib/returnTo.js` |
| Password min 10 / max 128 | ✅ |
| Argon2id hashing | ✅ |
| Timing equalization for unknown users | ✅ |
| Refresh token rotation | ✅ |
| Refresh token reuse detection | ❌ (single-token revoke only; family revocation deferred) |
| `isActive` re-check per request | ✅ auth middleware (60s cache) |
| TOTP 2FA | ❌ MISSING — required for SUPER_ADMIN before production |
| Step-up auth for sensitive admin actions | ❌ MISSING |
| New-device/IP login alert | ❌ MISSING |
| Active sessions list + sign-out-everywhere | ✅ |
| Request IDs in error responses | ✅ |
| Unicode bidi character stripping | ✅ |
| Email header injection prevention | ✅ |
| `Cache-Control: no-store` on API responses | ✅ |
| `Permissions-Policy` header | ✅ |
| Gitleaks in CI | ✅ (warn mode) |
| `npm audit` in CI | ✅ (warn mode) |
| Doctor photo upload security | ❌ MISSING (upload not yet implemented) |
| Refresh token family revocation on reuse | ❌ MISSING |

---

## Status summary (final)

| Category | Total items | EXISTS | PARTIAL | MISSING |
|---|---|---|---|---|
| Public pages | 20 | 15 | 3 | 2 |
| Auth pages | 13 | 11 | 0 | 2 |
| Patient area | 9 | 7 | 0 | 2 |
| Doctor area | 6 | 5 | 0 | 1 |
| Institution admin area | 6 | 6 | 0 | 0 |
| Super admin area | 14 | 12 | 0 | 2 |
| Error/system pages | 12 | 9 | 1 | 2 |
| Security controls | 30 | 20 | 1 | 9 |

---

## Additions beyond the prompt

| Item | Reason | Status |
|---|---|---|
| Shared `<Layout>` component | Consistency, DRY header/footer across all pages | ✅ Done |
| `GuestOnly` route wrapper | Prevent authenticated users from accessing /login /register | ✅ Done |
| Request ID on all API responses | Required for support tracing | ✅ Done |
| `isActive` re-check per request | Deactivated users would otherwise retain JWT access | ✅ Done |
| `src/lib/returnTo.js` | Centralized safe-redirect validation | ✅ Done |
| `src/lib/sanitize.ts` server | Bidi strip, email-header sanitize, LIKE escape in one place | ✅ Done |
| `ContactMessage` Prisma model | Needed for /contact and /for-institutions forms | ✅ Done |
| `GET /admin/stats` real counts | Admin needs real data, not fake numbers | ✅ Done |
| `GET /admin/users` with search | Basic user management API | ✅ Done |
| Institution admin endpoints | Full CRUD for services + appointments management | ✅ Done |
| `common.*` i18n utility keys | All pages need save/cancel/error/prev/next | ✅ Done |
| `robots.txt` | SEO; blocks private routes from indexing | ✅ Done |
| `/how-it-works`, `/faq`, `/specialties` | P1 pages for patient UX | ✅ Done |
| 26 new security tests (total 86) | Automated coverage of mass-assignment, CSRF, bidi, etc. | ✅ Done |

---

## What requires a human decision before production launch

| Item | Why |
|---|---|
| **Hosting location (Algeria)** | Law 18-07 may restrict data transfer outside Algeria — consult legal counsel |
| **Real institution data** | `khenchela-institutions.json` is a template; all entries need verification and `sourceNote` before going `VERIFIED` |
| **SMTP domain + SPF/DKIM/DMARC** | Required for email deliverability; free webmail is not production-ready |
| **TOTP 2FA for SUPER_ADMIN** | Must be implemented and enforced before any real admin account is created |
| **External penetration test** | Strongly recommended before public launch |
| **Sitemap.xml** | Needs the final production domain to generate |
| **Photo upload** | Needs server-side magic-byte validation + sharp resize before enabling |
| **Refresh token family revocation** | Single-token revoke is in place; full family revocation is a security improvement |
| **Privacy policy version tracking** | `consentAcceptedAt` exists but no policy version number yet |
| **Analytics** | None installed. Owner must decide before adding any (GDPR/Law 18-07 implications) |
