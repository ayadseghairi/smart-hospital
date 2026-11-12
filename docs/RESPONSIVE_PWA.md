# Responsive Design & PWA — Delin Smart Care

## Overview

This document describes the responsive layout system, PWA configuration, breakpoints, design tokens, device test matrix, and performance budgets for Delin Smart Care.

---

## Breakpoints

| Name | Min-width | Target devices |
|------|-----------|---------------|
| (default) | 0px | Small phones ≤ 374px |
| `xs` | 475px | Normal phones |
| `sm` | 640px | Large phones, small tablets |
| `md` | 768px | Tablets (portrait) |
| `lg` | 1024px | Tablets (landscape), small laptops → **nav breakpoint** |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large desktops |
| `3xl` | 1600px | Ultra-wide |

**Navigation breakpoint is `lg` (1024px):** below this, the hamburger drawer appears.

---

## Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `BRAND_PRIMARY` | `#2C5F8A` | Buttons, active states, header accents |
| `BRAND_HOVER` | `#245075` | Button hover |
| Header height | 64px | Sticky header (all breakpoints) |
| Bottom tab bar | 56px + safe-area | Patient role, mobile only (< lg) |
| Drawer width | `min(320px, 88vw)` | Mobile navigation drawer |
| Touch target min | 44×44px | All interactive elements |
| Font size inputs | 16px | Prevents iOS zoom on focus |
| Max content width | `container` (Tailwind) | 1280px with px-4 padding |

---

## Layout Architecture

### Header (sticky, z-50)
- Brand logo + name always visible
- **≥ lg:** horizontal nav links + desktop action buttons
- **< lg:** hamburger icon + language toggle button
- `padding-top: env(safe-area-inset-top)` for iPhone notch / Dynamic Island

### Mobile Drawer (< lg)
- Slides in from start-edge (RTL: right, LTR: left)
- Backdrop overlay with `backdrop-filter: blur(2px)`
- Closes on: outside tap, `Escape`, route change
- `role="dialog"`, `aria-modal="true"`, focus trappable
- `padding-bottom: env(safe-area-inset-bottom)` for iPhone home bar

### Bottom Tab Bar (patient role, < lg only)
- 4 tabs: Home, Institutions, Doctors, My Appointments
- Active indicator: brand color + heavier stroke weight
- `min-h-[56px]`, label text `10px`
- `padding-bottom: env(safe-area-inset-bottom)`
- Main content gets `padding-bottom: calc(64px + safe-area-inset-bottom)`

### `min-height`
All full-page containers use:
```css
min-height: 100dvh;  /* modern — collapses browser chrome on mobile */
min-height: 100vh;   /* fallback */
```

### `overflow-x`
`html` and `body` both have `overflow-x: hidden` to prevent horizontal scroll from any slightly overflowing child element.

---

## Forms

| Requirement | Implementation |
|-------------|---------------|
| No iOS zoom on focus | `font-size: 16px` on all inputs (inline style, not just class) |
| Correct keyboard type | `inputMode="email"` on email/phone fields, `inputMode="numeric"` on numeric |
| `autocomplete` | All form fields have appropriate `autoComplete` values |
| `enterKeyHint` | `"next"` on intermediate fields, `"done"` on last field |
| Password show/hide | Eye icon toggle on every password field |
| Touch target | `min-h-[44px]` on all inputs and buttons |

---

## PWA Configuration

### Service Worker Strategy (Workbox)
| Route | Strategy | Notes |
|-------|----------|-------|
| `/api/*` | NetworkOnly | Never cache API responses |
| `/emergency` (HTML) | StaleWhileRevalidate | Emergency numbers must be available offline |
| Static assets | CacheFirst | JS/CSS/PNG bundles |
| Navigations | NetworkFirst → offline.html | Falls back to `public/offline.html` |

### Manifest (`public/manifest.webmanifest`)
- `name`: منصة دلين الصحية الذكية
- `short_name`: Delin Smart Care
- `display`: standalone
- `theme_color`: #2C5F8A
- `background_color`: #ffffff
- `start_url`: /
- Shortcuts: Emergency Numbers, Book Appointment

### Icons
| File | Size | Purpose |
|------|------|---------|
| `icons/icon-192.png` | 192×192 | Android homescreen |
| `icons/icon-512.png` | 512×512 | Splash screen, app store |
| `icons/maskable-192.png` | 192×192 | Android adaptive icon |
| `icons/maskable-512.png` | 512×512 | Android adaptive icon (large) |
| `icons/apple-touch-icon-180.png` | 180×180 | iOS homescreen |
| `icons/favicon-32.png` | 32×32 | Browser favicon |
| `icons/favicon-16.png` | 16×16 | Browser favicon (small) |

### Install Flow
1. **Android/Chrome:** `beforeinstallprompt` captured → `useInstallPrompt()` → `InstallBanner` + nav button + `/install` page button
2. **iOS Safari:** detected by UA → `IosSafariSheet` modal with step-by-step instructions (no external images)
3. **Desktop Chrome/Edge:** same as Android
4. **Dismissal cooldown:** 14 days via `localStorage`, key `pwa_install_dismissed_until`
5. **Already installed detection:** `window.matchMedia("(display-mode: standalone)")` + `window.navigator.standalone` (iOS)

### Offline Page (`public/offline.html`)
- Self-contained, no React, no external assets
- Arabic + French hardcoded text
- Emergency telephone numbers (`tel:` links)
- Displays when: network fails AND no cached page available

---

## PWA Update Prompt

`src/components/PwaUpdatePrompt.jsx` listens for service worker updates via `useRegisterSW` from `virtual:pwa-register/react`. Shows a toast with a "Refresh" button when a new SW is waiting.

---

## Accessibility

- Skip-to-content link in every Layout
- All interactive elements: `focus-visible:ring-2 focus-visible:ring-[#2C5F8A]`
- `aria-label` on all icon-only buttons
- `aria-current="page"` on active nav links
- `aria-expanded` on hamburger button
- `role="dialog"` + `aria-modal="true"` on drawer and modals
- Colour contrast ≥ 4.5:1 for all body text against backgrounds (WCAG AA)

---

## Animations & Motion

All animations in `tailwind.config.js` are CSS keyframe animations. A global CSS rule respects `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Performance Budgets

| Asset | Budget |
|-------|--------|
| Initial JS (main chunk) | < 300 KB gzip |
| Initial CSS | < 30 KB gzip |
| SW precache total | < 2 MB |
| TTI (mobile 4G) | < 3s |
| CLS | < 0.1 |
| LCP | < 2.5s |

**Main bundle weight note:** `boxicons` CSS is currently imported globally (~130 KB) and is the largest single contributor. A follow-up task is to replace all `<i class="bx bx-*">` usages with `lucide-react` icons and drop the boxicons import entirely.

---

## Device Test Matrix

| Device / Client | Resolution | OS | Browser | Tested |
|---|---|---|---|---|
| iPhone 14 Pro | 393×852 | iOS 17 | Safari | [ ] |
| iPhone SE (3rd gen) | 375×667 | iOS 17 | Safari | [ ] |
| Samsung Galaxy S23 | 393×873 | Android 14 | Chrome | [ ] |
| Xiaomi Redmi Note | 393×830 | Android 12 | Chrome | [ ] |
| iPad Air 10.9" | 820×1180 | iOS 17 | Safari | [ ] |
| MacBook Air 13" | 1280×800 | macOS | Chrome | [ ] |
| Windows Desktop | 1920×1080 | Windows 11 | Edge | [ ] |
| RTL check (Arabic) | 393×852 | iOS 17 | Safari | [ ] |
| Reduced motion | Any | Any | Any | [ ] |
| Images blocked | Any | Any | Any | [ ] |
| Offline | Any | Any | Chrome | [ ] |

---

## Checklist for Manual QA

- [ ] Hamburger opens/closes drawer smoothly (no jank)
- [ ] Drawer closes when tapping outside
- [ ] Bottom tab bar shows only for PATIENT role on mobile
- [ ] No horizontal scroll at any viewport width
- [ ] Header stays fixed while scrolling
- [ ] Install banner appears for installable browsers
- [ ] iOS install sheet appears on iPhone Safari (non-standalone)
- [ ] QR code renders on `/install` page
- [ ] ForceChangePassword page is unreachable after password is changed
- [ ] All inputs have `font-size: 16px` (no zoom on iOS focus)
- [ ] Passwords show/hide toggle works
- [ ] Touch targets ≥ 44px (use browser DevTools accessibility panel)
- [ ] `prefers-reduced-motion` collapses all animations
- [ ] Offline page shown when network is down and no cache
- [ ] PWA update toast appears after a new deploy

---

## Files Changed / Created

| File | Change |
|------|--------|
| `src/components/Layout.jsx` | Full responsive overhaul: hamburger drawer, bottom tab bar, safe-area, lucide icons, install button |
| `src/hooks/useInstallPrompt.js` | beforeinstallprompt capture, iOS detection, 14-day dismissal |
| `src/components/InstallApp/InstallBanner.jsx` | Home page dismissible install card |
| `src/components/InstallApp/IosSafariSheet.jsx` | iOS step-by-step install sheet (inline SVG only) |
| `src/pages/InstallPage.jsx` | `/install` page with QR code + per-platform steps |
| `src/pages/ForceChangePasswordPage.jsx` | `/force-change-password` — forced password change after first login |
| `src/App.jsx` | Added `/install` and `/force-change-password` routes |
| `src/pages/LoginPage.jsx` | `mustChangePassword` redirect, password show/hide, 16px inputs, brand color |
| `src/index.css` | `overflow-x: hidden`, `prefers-reduced-motion` global rule, `.overflow-wrap-anywhere`, `.min-h-dvh`, `.h-dvh` utilities |
| `src/i18n/locales/ar.json` | `install.*`, `forceChangePassword.*`, `nav.home/openMenu/closeMenu/…`, `auth.showPassword/hidePassword` |
| `src/i18n/locales/fr.json` | Same as above in French |
| `src/main.jsx` | Removed `boxicons` CSS import; all icons now tree-shaken `lucide-react` |
| `src/contexts/AuthContext.jsx` | SW runtime-cache clear on logout (preserves emergency-numbers cache) |
| `src/pages/Home.jsx` | InstallBanner, lucide icons, responsive hero grid |
| `src/pages/EmergencyPage.jsx` | Full lucide migration, safe-area header, min-h-dvh, RTL-aware back arrow |
| `src/pages/InstitutionPage.jsx` | Full lucide migration, responsive tab nav |
| `src/pages/DoctorProfile.jsx` | Full lucide migration, responsive tabs |
| `src/pages/AppointmentBooking.jsx` | Full lucide migration |
| `src/pages/SearchResults.jsx` | Full lucide migration, responsive filter bar |
| `src/pages/AboutPage.jsx` | Lucide value icons |
| `src/pages/ForInstitutionsPage.jsx` | Lucide icons |
| `src/pages/ContactPage.jsx` | Lucide CheckCircle2 |
| `src/pages/InstitutionsPage.jsx` | Lucide empty-state icons |
| `src/pages/DoctorsPage.jsx` | Lucide empty-state icon |
| `src/pages/NotFound.jsx` | Lucide AlertCircle, mobile padding |
| `src/pages/ForgotPasswordPage.jsx` | Lucide Mail |
| `src/pages/VerifyEmailPage.jsx` | Lucide Loader2, CheckCircle2, XCircle |
| `src/pages/CheckInboxPage.jsx` | Lucide Mail |
| `src/pages/AcceptInvitePage.jsx` | Lucide LockKeyholeOpen |
| `src/pages/TermsPage.jsx` | Lucide back arrow, 44px touch targets |
| `src/pages/PrivacyPage.jsx` | Lucide back arrow, 44px touch targets |
| `src/pages/account/AccountDashboardPage.jsx` | Lucide icons, 44px action cards |
| `src/pages/MyAppointmentsPage.jsx` | Lucide Calendar |
| `src/pages/DoctorDashboardPage.jsx` | Lucide icons, 44px touch targets |
| `src/pages/doctor/DoctorAppointmentsPage.jsx` | Lucide Calendar |
| `src/pages/doctor/DoctorAvailabilityPage.jsx` | Lucide Trash2 |
| `src/pages/doctor/DoctorProfileEditPage.jsx` | Lucide Camera |
| `src/components/UnverifiedEmailBanner.jsx` | Lucide AlertTriangle |
| `src/components/Sections/SearchBox.jsx` | Lucide Search, Loader2; `type="search"`; 16px font; 48px button |
| `src/components/Sections/EmergencyAccess.jsx` | Lucide HeartPulse, PhoneCall; 48px touch targets |
| `src/components/Sections/HealthInstitutions.jsx` | Lucide Building2/Building/Store; `<button>` semantics for a11y |
| `src/components/Sections/SmartAssistant.jsx` | Lucide Bot, MessageCircle, PhoneCall, MapPin, Send |
| `src/components/Sections/InstitutionDetails/AdminPanel.jsx` | Full lucide migration, role="tablist", 48px targets |
| `src/components/Sections/InstitutionDetails/DoctorsSection.jsx` | Lucide UserPlus |
| `src/components/Sections/InstitutionDetails/LabSection.jsx` | Full lucide migration, 44px targets, `text-base` inputs, `autoComplete` attrs |
| `src/components/Sections/InstitutionDetails/PharmacySection.jsx` | Full lucide migration |
| `src/components/Sections/InstitutionDetails/NursesSection.jsx` | Full lucide migration, 44px targets, `text-base` inputs, `autoComplete` attrs |
| `src/components/Sections/InstitutionDetails/ImagingSection.jsx` | Full lucide migration, 44px targets, `text-base` inputs, `autoComplete` attrs |
| `.browserslistrc` | Browser targets for autoprefixer/babel (last 2 Chrome/Edge/Firefox/Safari/Samsung) |
| `public/manifest.webmanifest` | Complete manifest (previous session) |
| `public/offline.html` | Bilingual offline page (previous session) |
| `public/icons/*` | 7 PWA icons generated (previous session) |
| `vite.config.js` | VitePWA plugin (previous session) |
| `src/components/PwaUpdatePrompt.jsx` | SW update toast (previous session) |
