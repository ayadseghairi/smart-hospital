# Delin Smart Care — Email QA Checklist

**Use Mailpit** (`http://localhost:8025`) as the first pass for every template. Mailpit's HTML compatibility report highlights CSS properties and HTML elements that may render differently across clients.

Run `npm run mail:preview` to generate all template previews in `server/.mail-preview/`.

---

## Testing matrix

### Email clients to test

| Client | Priority | Notes |
|---|---|---|
| Gmail web (Chrome) | P0 | Most common; strips `<style>` blocks except media queries |
| Gmail Android app | P0 | Same rendering engine as web |
| Gmail iOS app | P0 | Same rendering engine as web |
| Outlook 2019/2021 desktop | P0 | Uses Word HTML rendering engine; VML button fallback required |
| Outlook 2016 desktop | P1 | Older Word engine |
| New Outlook (Windows) | P0 | Uses web-based renderer |
| Apple Mail (macOS) | P1 | Good CSS support |
| Apple Mail (iOS) | P1 | Good CSS support |
| Yahoo Mail web | P1 | Strips some CSS |
| Thunderbird | P2 | — |

---

## Per-template checklist

For each template in both `ar` (RTL) and `fr` (LTR):

### Layout

- [ ] Header band displays brand color (`#2C5F8A`) with logo and platform name
- [ ] Logo fallback text appears when images are blocked
- [ ] 600px centered card on desktop
- [ ] Full-width on mobile (≤480px)
- [ ] Consistent padding (24–32px)
- [ ] Footer shows privacy/terms links and "why you received this" line

### Typography

- [ ] Body text is 16px / 1.6 line-height
- [ ] Headings are 22–24px bold
- [ ] Sufficient contrast (WCAG AA minimum 4.5:1)
- [ ] Arabic text uses correct font stack (Tahoma/Noto Naskh Arabic)

### RTL (Arabic) specific

- [ ] `<html dir="rtl" lang="ar">` on the root element
- [ ] Text is right-aligned
- [ ] Button is right-aligned
- [ ] Info box labels and values are right-aligned
- [ ] Mixed Arabic/Latin strings (names, times) are wrapped in `<bdi>` or `unicode-bidi: isolate`
- [ ] Dates and times use Latin digits (0–9), not Arabic-Indic (٠١٢٣٤)
- [ ] Footer link order is appropriate for RTL

### Button

- [ ] Primary button renders in **Outlook desktop** (VML fallback used)
- [ ] Button background color is `#2C5F8A`
- [ ] Minimum height ≥48px
- [ ] Plain-text URL appears below button (fallback link)
- [ ] Button becomes full-width on mobile

### Info box (appointment details)

- [ ] Key/value rows align correctly in both LTR and RTL
- [ ] Doctor name uses `<bdi>` for correct bidi rendering
- [ ] Date and time format matches locale (French: "lundi 16 juin 2025"; Arabic equivalent)
- [ ] Timezone shown as "heure d'Algérie" / "توقيت الجزائر"

### Security notice box

- [ ] Yellow/amber background with high-contrast text
- [ ] "Not you?" link points to `/forgot-password`
- [ ] "We will never ask for your password" line present in security emails

### Dark mode

- [ ] Email card background changes to dark (`#16213e`)
- [ ] Text remains readable on dark background
- [ ] Logo is legible on dark background
- [ ] Borders use `#2d3561` (not invisible)
- [ ] CID logo visible even when remote images are blocked

### Images blocked

- [ ] Logo shows `alt="Delin Smart Care"` text fallback
- [ ] No meaning conveyed by images alone
- [ ] All `<img>` tags have `width`, `height` and `alt`

### Size

- [ ] HTML size < 100KB (Gmail clips at ~102KB)
- [ ] No external stylesheets or web fonts
- [ ] No JavaScript

### Headers (check with `npm run mail:test`)

- [ ] `From:` shows `"Delin Smart Care" <no-reply@delin.dz>` (or configured address)
- [ ] `Reply-To:` set if `MAIL_REPLY_TO` is configured
- [ ] `Auto-Submitted: auto-generated` present
- [ ] `Message-ID` is unique per message
- [ ] Reminder and digest emails include `List-Unsubscribe` header
- [ ] Security emails do NOT have `List-Unsubscribe` header
- [ ] Subject is non-empty and does not contain emojis

---

## Per-kind specific checks

### EMAIL_VERIFY / INVITE / PASSWORD_RESET
- [ ] Token link points to `APP_BASE_URL` (not hardcoded)
- [ ] Expiry notice correct (24h / 48h / 60min)
- [ ] Security notice: "Ignore if you did not request this"
- [ ] No `List-Unsubscribe` header (security email)

### ADMIN_ACCOUNT_READY
- [ ] Does NOT contain any password, hash, or credentials
- [ ] Instructs admin to delete `SUPER_ADMIN_INITIAL_PASSWORD` from `.env`
- [ ] Login link points to `/login`

### APPT_CONFIRMED
- [ ] `.ics` calendar file is attached (check in email client)
- [ ] OpenStreetMap link present when coordinates are available
- [ ] No medical reason in the email body

### APPT_REMINDER
- [ ] Offset (24h or 2h) shown correctly in subject and body
- [ ] `List-Unsubscribe` header present
- [ ] Doctor name and institution name are correct
- [ ] No medical reason in the email body

### DOCTOR_DAILY_DIGEST
- [ ] Table of appointments renders correctly in Outlook
- [ ] `List-Unsubscribe` header present
- [ ] Empty state shown when no appointments

### PASSWORD_CHANGED / NEW_DEVICE_LOGIN
- [ ] "This wasn't me" link with instructions
- [ ] No `List-Unsubscribe` header

### ALREADY_REGISTERED
- [ ] No confirmation that account exists (anti-enumeration)
- [ ] Both "sign in" and "forgot password" links present

---

## Long Arabic name test

Test with the longest expected full name (e.g. 80 Arabic characters):

- [ ] Name wraps correctly without breaking layout
- [ ] Button does not overflow on mobile
- [ ] Info box row wraps cleanly

---

## Automated QA (Mailpit)

1. Start Mailpit: `docker compose up -d`
2. Set `MAIL_ENABLED=true`, `SMTP_HOST=localhost`, `SMTP_PORT=1025`
3. Run: `npm run mail:test -- test@example.dz fr`
4. Open `http://localhost:8025`
5. Click **"HTML Check"** tab for CSS compatibility report
6. Repeat for `ar`

---

## Sign-off

| Template | AR | FR | Checked by | Date |
|---|---|---|---|---|
| EMAIL_VERIFY | ☐ | ☐ | | |
| WELCOME | ☐ | ☐ | | |
| PASSWORD_RESET | ☐ | ☐ | | |
| PASSWORD_CHANGED | ☐ | ☐ | | |
| EMAIL_CHANGE_CONFIRM | ☐ | ☐ | | |
| EMAIL_CHANGED_NOTICE | ☐ | ☐ | | |
| INVITE | ☐ | ☐ | | |
| ADMIN_ACCOUNT_READY | ☐ | ☐ | | |
| NEW_DEVICE_LOGIN | ☐ | ☐ | | |
| MFA_ENABLED | ☐ | ☐ | | |
| MFA_DISABLED | ☐ | ☐ | | |
| APPT_REQUESTED | ☐ | ☐ | | |
| DOCTOR_NEW_REQUEST | ☐ | ☐ | | |
| APPT_CONFIRMED | ☐ | ☐ | | |
| APPT_CANCELLED | ☐ | ☐ | | |
| APPT_REMINDER | ☐ | ☐ | | |
| DOCTOR_DAILY_DIGEST | ☐ | ☐ | | |
| ACCOUNT_DEACTIVATED | ☐ | ☐ | | |
| ACCOUNT_REACTIVATED | ☐ | ☐ | | |
| ACCOUNT_DELETION_CONFIRM | ☐ | ☐ | | |
| DATA_EXPORT_READY | ☐ | ☐ | | |
| ALREADY_REGISTERED | ☐ | ☐ | | |
| CONTACT_RECEIVED | ☐ | ☐ | | |
| CONTACT_ADMIN_NOTICE | ☐ | ☐ | | |
| INSTITUTION_STATUS_CHANGED | ☐ | ☐ | | |
| TEST_EMAIL | ☐ | ☐ | | |
