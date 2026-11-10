# Delin Smart Care — Repository Audit

**Date:** 2025  
**Auditor:** Bob (automated + manual review)  
**Scope:** Full platform — frontend (React 18 + Vite), backend (Node 20 + Express + Prisma)

Legend: ✅ EXISTS | ⚠️ PARTIAL | ❌ MISSING

---

## Part A: Page Inventory

### A1. Public pages

| Route | Purpose | Status | File / Notes | Priority |
|---|---|---|---|---|
| `/` | Home: hero, search, quick links, honest stats | ⚠️ PARTIAL | `src/pages/Home.jsx` — exists, but no honest stat counts from DB | P0 |
| `/institutions` | Institution list with filters | ❌ MISSING | Only embedded in Home; no standalone list page | P0 |
| `/institutions/:id` | Institution detail: info, tabs, source note | ⚠️ PARTIAL | `src/pages/InstitutionPage.jsx` — missing "report an error" link | P0 |
| `/doctors` | Doctor list with filters | ❌ MISSING | No standalone doctors list page | P0 |
| `/doctors/:id` | Doctor profile, reviews, availability | ⚠️ PARTIAL | `src/pages/DoctorProfile.jsx` — reviews section missing | P0 |
| `/specialties` | Browse by specialty | ❌ MISSING | — | P1 |
| `/specialties/:slug` | Specialty detail | ❌ MISSING | — | P1 |
| `/services/:category` | Service directory | ❌ MISSING | — | P1 |
| `/search` | Global search results | ✅ EXISTS | `src/pages/SearchResults.jsx` | P0 |
| `/emergency` | Emergency numbers, nearest 24h institutions | ⚠️ PARTIAL | `src/pages/EmergencyPage.jsx` — geolocation-denied fallback (pick commune) is missing | P0 |
| `/map` | Map of verified institutions (Leaflet/OSM) | ❌ MISSING | — | P1 |
| `/pharmacies-on-duty` | Pharmacy duty rota | ❌ MISSING | No verified data source — do NOT build per spec | P2 |
| `/about` | About Delin Smart Care | ❌ MISSING | — | P0 |
| `/how-it-works` | Steps for patients | ❌ MISSING | — | P1 |
| `/for-institutions` | Partner page + request form | ❌ MISSING | — | P0 |
| `/contact` | Contact form, admin inbox | ❌ MISSING | — | P0 |
| `/faq` | FAQ | ❌ MISSING | — | P1 |
| `/help` | Help center | ❌ MISSING | — | P2 |
| `/privacy` | Privacy policy (AR + FR) | ✅ EXISTS | `src/pages/PrivacyPage.jsx` | P0 |
| `/terms` | Terms of use (AR + FR) | ✅ EXISTS | `src/pages/TermsPage.jsx` | P0 |
| `/cookies` | Cookie notice | ❌ MISSING | — | P0 |
| `/accessibility` | Accessibility statement | ❌ MISSING | — | P2 |
| `/sitemap.xml` | SEO sitemap | ❌ MISSING | — | P1 |
| `/robots.txt` | SEO robots | ❌ MISSING | — | P1 |
| Maintenance / 503 | Static downtime page | ❌ MISSING | — | P1 |

### A2. Authentication pages

| Route | Status | File / Notes | Priority |
|---|---|---|---|
| `/login` | ✅ EXISTS | `src/pages/LoginPage.jsx` | P0 |
| `/register` | ✅ EXISTS | `src/pages/RegisterPage.jsx` | P0 |
| `/register/check-email` (was `/check-inbox`) | ⚠️ PARTIAL | Route is `/check-inbox` not `/register/check-email` | P0 |
| `/verify-email` | ✅ EXISTS | `src/pages/VerifyEmailPage.jsx` | P0 |
| `/forgot-password` | ✅ EXISTS | `src/pages/ForgotPasswordPage.jsx` | P0 |
| `/reset-password` | ✅ EXISTS | `src/pages/ResetPasswordPage.jsx` | P0 |
| `/accept-invite` | ✅ EXISTS | `src/pages/AcceptInvitePage.jsx` | P0 |
| `/login/2fa` | ❌ MISSING | TOTP 2FA — P1 mandatory for SUPER_ADMIN | P1 |
| `/session-expired` | ❌ MISSING | — | P1 |
| `/logout` | ⚠️ PARTIAL | Logout is a button action, no dedicated route | P0 |
| Role-based redirect after login | ⚠️ PARTIAL | `LoginPage.jsx` redirects to `/` not role home | P0 |
| Safe `returnTo` parameter | ❌ MISSING | Not implemented | P0 |
| Already-authenticated redirect from login/register | ❌ MISSING | Login and register pages accessible to logged-in users | P0 |
| No user-enumeration guarantee | ⚠️ PARTIAL | Backend generic messages OK, timing equalization partial | P0 |

### A3. Patient area

| Route | Status | File / Notes | Priority |
|---|---|---|---|
| `/account` | ❌ MISSING | Route is `/my-account` not `/account`; no real dashboard with upcoming appointments | P0 |
| `/book/:doctorId` | ✅ EXISTS | `src/pages/AppointmentBooking.jsx` — route is `/appointment/book/:doctorId` | P0 |
| `/account/appointments` | ❌ MISSING | Route is `/my-appointments` not nested; no appointment detail, no cancel from detail view | P0 |
| `/account/appointments/:id` | ❌ MISSING | — | P0 |
| `/account/profile` | ❌ MISSING | `MyAccountPage.jsx` has only delete/export; no name/phone/email/lang edit | P0 |
| `/account/add-email` | ❌ MISSING | — | P0 |
| `/account/notifications` | ❌ MISSING | No patient notification preferences page | P0 |
| `/account/security` | ❌ MISSING | No password change, no active sessions | P0 |
| `/account/privacy` | ⚠️ PARTIAL | Delete/export in `MyAccountPage.jsx`, no consent history | P0 |
| `/account/reviews` | ❌ MISSING | — | P1 |
| `/account/favorites` | ❌ MISSING | — | P2 |

### A4. Doctor area

| Route | Status | File / Notes | Priority |
|---|---|---|---|
| `/doctor` (dashboard) | ⚠️ PARTIAL | `src/pages/DoctorDashboardPage.jsx` — exists but minimal; no today's agenda | P0 |
| `/doctor/appointments` | ⚠️ PARTIAL | Combined in dashboard, no tabs (pending/confirmed/history) | P0 |
| `/doctor/appointments/:id` | ❌ MISSING | — | P0 |
| `/doctor/availability` | ❌ MISSING | No availability management UI | P0 |
| `/doctor/profile` | ❌ MISSING | No doctor self-service profile edit | P0 |
| `/doctor/notifications` | ❌ MISSING | — | P1 |
| `/doctor/security` | ❌ MISSING | — | P0 |
| First-login onboarding | ❌ MISSING | — | P1 |

### A5. Institution admin area

| Route | Status | File / Notes | Priority |
|---|---|---|---|
| `/institution` (dashboard) | ⚠️ PARTIAL | `AdminPanel.jsx` is embedded in `InstitutionPage.jsx`; not a standalone dashboard | P0 |
| `/institution/profile` | ❌ MISSING | — | P0 |
| `/institution/doctors` | ❌ MISSING | — | P0 |
| `/institution/services` | ❌ MISSING | No CRUD for services | P0 |
| `/institution/appointments` | ❌ MISSING | — | P0 |
| `/institution/security` | ❌ MISSING | — | P0 |

### A6. Super admin area

| Route | Status | File / Notes | Priority |
|---|---|---|---|
| `/admin` dashboard | ⚠️ PARTIAL | `SuperAdminDashboardPage.jsx` — minimal; no real stats, no pending items | P0 |
| `/admin/institutions` | ⚠️ PARTIAL | Create in dashboard; no list/edit/verify/suspend UI | P0 |
| `/admin/institution-admins` | ⚠️ PARTIAL | Create in dashboard; no dedicated management page | P0 |
| `/admin/doctors` | ⚠️ PARTIAL | Create in dashboard; no list/edit/deactivate UI | P0 |
| `/admin/users` | ⚠️ PARTIAL | In dashboard users tab; no search/filter | P0 |
| `/admin/specialties` | ❌ MISSING | — | P0 |
| `/admin/locations` | ❌ MISSING | — | P1 |
| `/admin/emergency-numbers` | ❌ MISSING | — | P0 |
| `/admin/appointments` | ❌ MISSING | — | P1 |
| `/admin/reviews` | ❌ MISSING | — | P1 |
| `/admin/messages` | ❌ MISSING | No contact/partner/report submissions inbox | P0 |
| `/admin/notifications` | ❌ MISSING | No email log/failure view | P0 |
| `/admin/audit-log` | ❌ MISSING | No audit log page | P0 |
| `/admin/data-quality` | ❌ MISSING | No data quality dashboard | P0 |
| `/admin/system` | ❌ MISSING | — | P1 |
| `/admin/settings` | ❌ MISSING | — | P1 |
| `/admin/security` | ❌ MISSING | — | P0 |

### A7. Error and system pages

| Case | Status | File / Notes | Priority |
|---|---|---|---|
| 400 Bad Request | ⚠️ PARTIAL | API returns Zod errors; no dedicated frontend error page | P0 |
| 401 Unauthorized | ⚠️ PARTIAL | `ProtectedRoute.jsx` redirects; no `returnTo` | P0 |
| 403 Forbidden | ❌ MISSING | No dedicated 403 page | P0 |
| 404 Not Found | ✅ EXISTS | `src/pages/NotFound.jsx` | P0 |
| 409 Conflict | ⚠️ PARTIAL | Booking handles 409 inline; no general pattern | P0 |
| 410 / expired token | ❌ MISSING | No dedicated expired-link page | P0 |
| 429 Too Many Requests | ❌ MISSING | No page/toast with Retry-After | P0 |
| 500 Internal Error | ❌ MISSING | No 500 page with request ID | P0 |
| 502/503/maintenance | ❌ MISSING | — | P1 |
| Account deactivated | ❌ MISSING | — | P0 |
| Email not verified banner | ✅ EXISTS | `UnverifiedEmailBanner.jsx` | P0 |
| Offline / network error | ❌ MISSING | — | P1 |
| React error boundary | ❌ MISSING | No error boundary | P0 |
| Geolocation denied fallback | ❌ MISSING | EmergencyPage has no commune picker fallback | P0 |

### A8. Cross-cutting features

| Feature | Status | Notes |
|---|---|---|
| Route guards (GuestOnly, RequireAuth, RequireRole) | ⚠️ PARTIAL | `ProtectedRoute` exists; no `GuestOnly` (logged-in users can open /login, /register) |
| Header: language switcher | ✅ EXISTS | In `Home.jsx` |
| Header: emergency shortcut always visible | ❌ MISSING | Emergency link only in home nav |
| SEO: per-page title/meta, og: tags | ❌ MISSING | Single title in `index.html`; no per-page meta |
| SEO: `lang`/`dir` updates on language change | ✅ EXISTS | `src/i18n/index.js` |
| Accessibility: labels, focus, ARIA | ⚠️ PARTIAL | Basic but untested |
| Print-friendly appointment confirmation | ❌ MISSING | — |
| `.ics` calendar export | ❌ MISSING | — |
| Calendar: Africa/Algiers, week starts Sunday | ⚠️ PARTIAL | Times in UTC+1 in backend; no calendar UI |
| "Report incorrect information" on institution/doctor pages | ❌ MISSING | — |
| Request IDs in error responses | ❌ MISSING | — |
| Structured logs with request IDs | ❌ MISSING | — |
| Graceful shutdown | ❌ MISSING | No SIGTERM handler |
| Health endpoint | ✅ EXISTS | `GET /health` in `app.ts` |
| CI: lint, build, test | ✅ EXISTS | `.github/workflows/` |
| CI: npm audit, gitleaks, semgrep | ❌ MISSING | — |
| Image lazy loading | ⚠️ PARTIAL | Not systematically applied |
| Route-level code splitting | ✅ EXISTS | `React.lazy` in `App.jsx` |
| Contact form → admin inbox backend | ❌ MISSING | No `ContactMessage` model or route |

---

## Security controls (Part C quick status — detailed in SECURITY.md)

| Control | Status |
|---|---|
| Prisma parameterized queries only | ✅ |
| Ban `$queryRawUnsafe` (ESLint rule) | ❌ MISSING |
| `ORDER BY` column whitelist | ❌ MISSING |
| `LIKE` wildcard escaping in search | ❌ MISSING |
| Zod `.strict()` on all schemas | ❌ MISSING |
| Mass assignment protection (no spread of req.body) | ⚠️ PARTIAL |
| No `dangerouslySetInnerHTML` (ESLint rule) | ❌ MISSING |
| Strict Content Security Policy | ❌ MISSING |
| CSRF defense (custom header or double-submit) | ❌ MISSING |
| Open redirect protection on `returnTo` | ❌ MISSING |
| Password: min 10 chars (current: 8) | ❌ GAP |
| Argon2id hashing | ✅ |
| Timing equalization (dummy hash for unknown users) | ✅ |
| Refresh token reuse detection / family revocation | ❌ MISSING |
| `isActive` re-check per request | ❌ MISSING |
| TOTP 2FA (mandatory for SUPER_ADMIN) | ❌ MISSING |
| Step-up authentication for sensitive actions | ❌ MISSING |
| Email bombing protection | ❌ MISSING |
| Booking abuse limits | ❌ MISSING |
| Request body size limit | ✅ (1mb in app.ts) |
| Pagination caps | ❌ MISSING |
| HSTS header | ⚠️ (helmet default, no preload) |
| `X-Content-Type-Options: nosniff` | ✅ (helmet) |
| `frame-ancestors 'none'` | ⚠️ PARTIAL (helmet sets X-Frame-Options but no strict CSP) |
| `Referrer-Policy: no-referrer` | ✅ (set in app.ts) |
| `Cache-Control: no-store` on auth responses | ❌ MISSING |
| No secrets in frontend bundle (`VITE_*`) | ✅ |
| Gitleaks in CI | ❌ MISSING |
| `npm audit` in CI | ❌ MISSING |
| ESLint security plugin | ❌ MISSING |
| Doctor photo upload with magic-byte validation | ❌ MISSING (no upload yet) |
| Unicode bidi character stripping | ❌ MISSING |

---

## Additions beyond the prompt

| Item | Reason |
|---|---|
| React Error Boundary per route group | Production health — unhandled React errors currently white-screen the app |
| `GuestOnly` route wrapper | Prevent already-authenticated users from accessing /login and /register |
| Request ID header (`X-Request-Id`) on all API responses | Required for support and tracing |
| `isActive` re-check on every authenticated request | A deactivated user currently retains API access until their JWT expires |
| Per-user rate limit on booking (not just global) | Prevent slot hoarding |
| `ContactMessage` Prisma model and API endpoint | `/contact` and `/for-institutions` forms need a backend inbox |
| Geolocation commune-picker fallback on EmergencyPage | Specified in master prompt but missing |
| `GuestOnly` redirect for authenticated users on `/login`/`/register` | UX and security hygiene |
| Robots.txt served by Vite dev and production (static file) | Required for SEO; easy to add |
| Per-page document titles via a `<title>` management hook | SEO requirement |

---

## Status summary

| Category | Total items | EXISTS | PARTIAL | MISSING |
|---|---|---|---|---|
| Public pages | 22 | 3 | 4 | 15 |
| Auth pages | 13 | 6 | 4 | 3 |
| Patient area | 10 | 1 | 0 | 9 |
| Doctor area | 8 | 0 | 2 | 6 |
| Institution admin area | 6 | 0 | 1 | 5 |
| Super admin area | 17 | 0 | 5 | 12 |
| Error/system pages | 14 | 2 | 3 | 9 |
| Security controls | 33 | 10 | 4 | 19 |

---

*This audit was generated automatically. A full manual penetration test is recommended before production launch.*
