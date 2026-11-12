// server/src/modules/notifications/templates/layout.ts
// Shared HTML email layout for Delin Smart Care.
// - Single-column, 600px card, responsive, dark-mode-aware
// - RTL support for Arabic (dir="rtl" on html + containers)
// - Bulletproof button with VML Outlook fallback
// - Inline CSS only (media queries in <style> block for clients that support it)
// - Privacy: never include medical reasons, symptoms or diagnoses
// - No external URLs except APP_BASE_URL

import { env } from "../../../config/env"

// ── Brand token ──────────────────────────────────────────────────────────────
// Extracted from the logo (#2C5F8A — a deep medical blue)
export const BRAND_PRIMARY = "#2C5F8A"
export const BRAND_LIGHT = "#EBF3FA"
const APP_NAME = env.APP_NAME

// ── Font stacks ───────────────────────────────────────────────────────────────
const FONT_LATIN = `-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif`
const FONT_ARABIC = `"Segoe UI",Tahoma,"Noto Naskh Arabic",Arial,sans-serif`

function fontStack(lang: "ar" | "fr"): string {
  return lang === "ar" ? FONT_ARABIC : FONT_LATIN
}

// ── Preheader ─────────────────────────────────────────────────────────────────
function preheader(text: string): string {
  // Hidden preview text — padded with nbsp so clients don't pull extra content
  return `<div style="display:none;font-size:1px;color:#f4f4f4;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">${text}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`
}

// ── Layout wrapper ────────────────────────────────────────────────────────────
export function wrapLayout(
  content: string,
  options: {
    lang: "ar" | "fr"
    preheaderText?: string
    isSecurityEmail?: boolean
    notificationPrefLink?: string
    privacyUrl?: string
    termsUrl?: string
    sentReason?: string
  }
): string {
  const { lang, preheaderText, isSecurityEmail, notificationPrefLink, sentReason } = options
  const dir = lang === "ar" ? "rtl" : "ltr"
  const align = lang === "ar" ? "right" : "left"
  const font = fontStack(lang)

  const privacyUrl = options.privacyUrl ?? `${env.APP_BASE_URL}/privacy`
  const termsUrl = options.termsUrl ?? `${env.APP_BASE_URL}/terms`

  const footerLinks = isSecurityEmail ? "" : (notificationPrefLink
    ? `<a href="${notificationPrefLink}" style="color:#57606a;text-decoration:underline">${lang === "ar" ? "إدارة إعدادات الإشعارات" : "Gérer les préférences de notification"}</a> &bull; `
    : "")

  const reasonLine = sentReason
    ? `<tr><td style="padding-top:8px;color:#57606a;font-size:12px;text-align:${align}">${sentReason}</td></tr>`
    : ""

  const footerContent = lang === "ar"
    ? `<table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding-bottom:4px;text-align:right;color:#57606a;font-size:12px">
          ${footerLinks}
          <a href="${privacyUrl}" style="color:#57606a;text-decoration:underline">سياسة الخصوصية</a> &bull;
          <a href="${termsUrl}" style="color:#57606a;text-decoration:underline">الشروط والأحكام</a>
        </td></tr>
        ${reasonLine}
        <tr><td style="padding-top:8px;color:#57606a;font-size:12px;text-align:right">
          تم إرسال هذه الرسالة تلقائياً من منصة <strong>${APP_NAME}</strong>. يرجى عدم الرد عليها مباشرةً.
        </td></tr>
      </table>`
    : `<table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding-bottom:4px;text-align:left;color:#57606a;font-size:12px">
          ${footerLinks}
          <a href="${privacyUrl}" style="color:#57606a;text-decoration:underline">Politique de confidentialité</a> &bull;
          <a href="${termsUrl}" style="color:#57606a;text-decoration:underline">Conditions d'utilisation</a>
        </td></tr>
        ${reasonLine}
        <tr><td style="padding-top:8px;color:#57606a;font-size:12px;text-align:left">
          Ce message a été envoyé automatiquement par <strong>${APP_NAME}</strong>. Merci de ne pas y répondre directement.
        </td></tr>
      </table>`

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${APP_NAME}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    /* Reset */
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
    img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
    /* Responsive */
    @media only screen and (max-width:480px){
      .email-card{border-radius:0!important;padding:20px!important}
      .btn-full{width:100%!important;display:block!important}
      .info-table td{display:block!important;width:100%!important}
    }
    /* Dark mode */
    @media (prefers-color-scheme:dark){
      .email-bg{background-color:#1a1a2e!important}
      .email-card{background-color:#16213e!important;border-color:#2d3561!important}
      .email-body-text{color:#e0e0e0!important}
      .email-muted{color:#a0a0b0!important}
      .email-divider{border-color:#2d3561!important}
      .info-box{background-color:#1e2a4a!important;border-color:#2d3561!important}
      .notice-box{background-color:#1a2a1a!important;border-color:#2d5a2d!important}
    }
  </style>
</head>
<body class="email-bg" style="margin:0;padding:0;background-color:#f4f6f8;font-family:${font}">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" class="email-bg" style="background-color:#f4f6f8">
    <tr>
      <td align="center" style="padding:32px 16px">
        <!--[if mso]><table width="600" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
        <table class="email-card" width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;border:1px solid #e5e7eb">
          <!-- Header band -->
          <tr>
            <td style="background-color:${BRAND_PRIMARY};border-radius:8px 8px 0 0;padding:20px 32px" dir="${dir}">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="color:#ffffff;font-family:${font};font-size:20px;font-weight:700;${lang === "ar" ? "text-align:right" : "text-align:left"}">
                    <!--[if !vml]-->
                    <img src="cid:logo@delinsmartcare" width="32" height="32" alt="${APP_NAME}" style="vertical-align:middle;border-radius:4px;${lang === "ar" ? "margin-left:10px" : "margin-right:10px"}">
                    <!--<![endif]-->
                    ${APP_NAME}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td class="email-card" style="padding:32px;background-color:#ffffff;border-radius:0" dir="${dir}">
              ${preheaderText ? preheader(preheaderText) : ""}
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                ${content}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #e5e7eb;background-color:#f9fafb;border-radius:0 0 8px 8px" dir="${dir}">
              ${footerContent}
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Partials ──────────────────────────────────────────────────────────────────

export function heading(text: string, lang: "ar" | "fr"): string {
  const align = lang === "ar" ? "right" : "left"
  return `<tr><td style="padding-bottom:16px;font-size:22px;font-weight:700;color:#1f2328;text-align:${align}" class="email-body-text">${text}</td></tr>`
}

export function paragraph(text: string, lang: "ar" | "fr"): string {
  const align = lang === "ar" ? "right" : "left"
  return `<tr><td style="padding-bottom:12px;font-size:16px;line-height:1.6;color:#1f2328;text-align:${align}" class="email-body-text">${text}</td></tr>`
}

export function divider(): string {
  return `<tr><td class="email-divider" style="padding:12px 0"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0"></td></tr>`
}

/**
 * Bulletproof primary button with VML Outlook fallback.
 * Also shows a plain-text URL below for clients that can't render buttons.
 */
export function primaryButton(
  label: string,
  href: string,
  lang: "ar" | "fr"
): string {
  const align = lang === "ar" ? "right" : "left"
  const fallbackLabel = lang === "ar"
    ? "إذا لم يعمل الزر، انسخ الرابط التالي:"
    : "Si le bouton ne fonctionne pas, copiez ce lien :"

  return `<tr><td style="padding:20px 0;text-align:${align}">
  <!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:52px;v-text-anchor:middle;width:240px;" arcsize="10%" stroke="f" fillcolor="${BRAND_PRIMARY}">
    <w:anchorlock/>
    <center style="color:#ffffff;font-family:sans-serif;font-size:16px;font-weight:bold;">${label}</center>
  </v:roundrect>
  <![endif]-->
  <!--[if !mso]><!-->
  <a href="${href}" class="btn-full" style="background-color:${BRAND_PRIMARY};border-radius:6px;color:#ffffff;display:inline-block;font-family:sans-serif;font-size:16px;font-weight:700;line-height:1;padding:16px 32px;text-align:center;text-decoration:none;min-height:48px;box-sizing:border-box">${label}</a>
  <!--<![endif]-->
  <br>
  <span style="font-size:12px;color:#57606a;display:block;margin-top:8px">${fallbackLabel}</span>
  <span style="font-size:12px;color:#3b82d4;display:block;word-break:break-all">${href}</span>
</td></tr>`
}

/**
 * Info box — two-column key/value table (appointments, details).
 */
export function infoBox(
  rows: Array<{ label: string; value: string }>,
  lang: "ar" | "fr"
): string {
  const dir = lang === "ar" ? "rtl" : "ltr"
  const labelAlign = lang === "ar" ? "right" : "left"
  // Always HTML-escape cell values to prevent XSS
  const esc = (s: string) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
  const rowsHtml = rows.map((r) => `
    <tr>
      <td class="info-table" style="padding:8px 12px;font-size:14px;font-weight:600;color:#57606a;white-space:nowrap;text-align:${labelAlign};vertical-align:top" width="35%">${esc(r.label)}</td>
      <td class="info-table" style="padding:8px 12px;font-size:14px;color:#1f2328;text-align:${labelAlign};vertical-align:top"><bdi>${esc(r.value)}</bdi></td>
    </tr>`).join("")

  return `<tr><td style="padding-bottom:16px">
  <table class="info-box" width="100%" cellpadding="0" cellspacing="0" role="presentation" dir="${dir}"
    style="background-color:#f7f8fa;border:1px solid #e5e7eb;border-radius:6px;border-collapse:collapse">
    ${rowsHtml}
  </table>
</td></tr>`
}

/**
 * Notice/security box — grey background with important text.
 */
export function noticeBox(lines: string[], lang: "ar" | "fr"): string {
  const align = lang === "ar" ? "right" : "left"
  const linesHtml = lines.map((l) => `<div style="margin-bottom:6px">${l}</div>`).join("")
  return `<tr><td style="padding-bottom:16px">
  <div class="notice-box" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:16px;font-size:14px;line-height:1.6;color:#15803d;text-align:${align}">
    ${linesHtml}
  </div>
</td></tr>`
}

export function securityNoticeBox(lines: string[], lang: "ar" | "fr"): string {
  const align = lang === "ar" ? "right" : "left"
  const linesHtml = lines.map((l) => `<div style="margin-bottom:6px">${l}</div>`).join("")
  return `<tr><td style="padding-bottom:16px">
  <div style="background-color:#fef9c3;border:1px solid #fde047;border-radius:6px;padding:16px;font-size:14px;line-height:1.6;color:#854d0e;text-align:${align}">
    ${linesHtml}
  </div>
</td></tr>`
}
