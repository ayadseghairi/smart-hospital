// server/src/modules/notifications/templates/index.ts
// Email templates — professional HTML + plain-text, branded Delin Smart Care.
// Arabic (RTL) and French (LTR). All dynamic values are escaped via escapeHtml.
// Privacy: never include medical reasons, symptoms or diagnoses.
// No external URLs except APP_BASE_URL. No raw user HTML inserted.

import { env } from "../../../config/env"
import {
  wrapLayout,
  heading,
  paragraph,
  divider,
  primaryButton,
  infoBox,
  noticeBox,
  securityNoticeBox,
} from "./layout"
import { buildPlainText } from "./text"

const APP_NAME = env.APP_NAME

// ── HTML escaping (XSS prevention) ───────────────────────────────────────────
function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// ── Date/time formatting ──────────────────────────────────────────────────────
function formatDate(d: Date, lang: "ar" | "fr"): string {
  return d.toLocaleDateString(lang === "ar" ? "fr-DZ" : "fr-FR", {
    timeZone: "Africa/Algiers",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatTime(d: Date, lang: "ar" | "fr"): string {
  return d.toLocaleTimeString(lang === "ar" ? "fr-DZ" : "fr-FR", {
    timeZone: "Africa/Algiers",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ── List-Unsubscribe headers (non-security emails only) ───────────────────────
function unsubscribeHeaders(userId: string): Record<string, string> {
  const base = env.APP_BASE_URL
  return {
    "List-Unsubscribe": `<mailto:unsubscribe@${new URL(base).hostname}?subject=unsubscribe>, <${base}/api/v1/notifications/preferences/${userId}/unsubscribe>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  }
}

// ── Exported interface ────────────────────────────────────────────────────────
export interface EmailTemplate {
  subject: string
  html: string
  text: string
  headers?: Record<string, string>
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL_VERIFY
// ═══════════════════════════════════════════════════════════════════════════════
export function buildVerifyEmailEmail(link: string, lang: "ar" | "fr"): EmailTemplate {
  const safeLink = escapeHtml(link)
  if (lang === "fr") {
    const subject = `Vérifiez votre adresse e-mail — ${APP_NAME}`
    const html = wrapLayout(
      heading("Vérifiez votre adresse e-mail", "fr") +
      paragraph(`Merci de vous être inscrit sur <strong>${escapeHtml(APP_NAME)}</strong>. Cliquez sur le bouton ci-dessous pour confirmer votre adresse e-mail.`, "fr") +
      primaryButton("Vérifier mon adresse e-mail", safeLink, "fr") +
      securityNoticeBox([
        "Ce lien expire dans <strong>24 heures</strong>.",
        "Si vous n'avez pas créé de compte, ignorez ce message.",
        "Nous ne vous demanderons jamais votre mot de passe par e-mail.",
      ], "fr"),
      { lang: "fr", preheaderText: `Confirmez votre adresse pour accéder à ${APP_NAME}`, isSecurityEmail: true }
    )
    return {
      subject,
      html,
      text: buildPlainText([
        { type: "heading", text: subject },
        { type: "paragraph", text: `Merci de vous être inscrit sur ${APP_NAME}.` },
        { type: "button", label: "Vérifier mon adresse e-mail", href: link },
        { type: "notice", lines: ["Ce lien expire dans 24 heures.", "Si vous n'avez pas créé de compte, ignorez ce message."] },
      ]),
    }
  }

  const subject = `تأكيد البريد الإلكتروني — ${APP_NAME}`
  const html = wrapLayout(
    heading("تأكيد البريد الإلكتروني", "ar") +
    paragraph(`شكراً لتسجيلك في منصة <strong>${escapeHtml(APP_NAME)}</strong>. انقر على الزر أدناه لتأكيد بريدك الإلكتروني.`, "ar") +
    primaryButton("تأكيد البريد الإلكتروني", safeLink, "ar") +
    securityNoticeBox([
      "ينتهي هذا الرابط خلال <strong>24 ساعة</strong>.",
      "إذا لم تنشئ حساباً، يمكنك تجاهل هذه الرسالة.",
      "لن نطلب منك كلمة المرور أبداً عبر البريد الإلكتروني.",
    ], "ar"),
    { lang: "ar", preheaderText: `أكّد بريدك الإلكتروني للدخول إلى ${APP_NAME}`, isSecurityEmail: true }
  )
  return {
    subject,
    html,
    text: buildPlainText([
      { type: "heading", text: subject },
      { type: "paragraph", text: `شكراً لتسجيلك في منصة ${APP_NAME}.` },
      { type: "button", label: "تأكيد البريد الإلكتروني", href: link },
      { type: "notice", lines: ["ينتهي هذا الرابط خلال 24 ساعة.", "إذا لم تنشئ حساباً، يمكنك تجاهل هذه الرسالة."] },
    ]),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// WELCOME
// ═══════════════════════════════════════════════════════════════════════════════
export function buildWelcomeEmail(fullName: string, lang: "ar" | "fr"): EmailTemplate {
  const safeName = escapeHtml(fullName)
  if (lang === "fr") {
    const subject = `Bienvenue sur ${APP_NAME}`
    const html = wrapLayout(
      heading(`Bienvenue, ${safeName} !`, "fr") +
      paragraph(`Votre adresse e-mail a été vérifiée. Vous pouvez maintenant réserver des rendez-vous médicaux sur <strong>${escapeHtml(APP_NAME)}</strong>.`, "fr") +
      primaryButton("Accéder à la plateforme", `${env.APP_BASE_URL}/`, "fr") +
      noticeBox([
        "Trouvez des médecins et des établissements de santé à Khenchela.",
        "Gérez vos rendez-vous depuis votre espace personnel.",
      ], "fr"),
      { lang: "fr", preheaderText: `Votre compte ${APP_NAME} est prêt`, isSecurityEmail: false, notificationPrefLink: `${env.APP_BASE_URL}/account/notifications` }
    )
    return {
      subject,
      html,
      text: buildPlainText([
        { type: "heading", text: subject },
        { type: "paragraph", text: `Bienvenue, ${fullName}! Votre compte est activé.` },
        { type: "button", label: "Accéder à la plateforme", href: `${env.APP_BASE_URL}/` },
      ]),
    }
  }

  const subject = `مرحباً بك في منصة ${APP_NAME}`
  const html = wrapLayout(
    heading(`مرحباً بك يا ${safeName}!`, "ar") +
    paragraph(`تم التحقق من بريدك الإلكتروني. يمكنك الآن حجز مواعيد طبية عبر منصة <strong>${escapeHtml(APP_NAME)}</strong>.`, "ar") +
    primaryButton("الدخول إلى المنصة", `${env.APP_BASE_URL}/`, "ar") +
    noticeBox([
      "ابحث عن الأطباء والمؤسسات الصحية في خنشلة.",
      "أدر مواعيدك من حسابك الشخصي.",
    ], "ar"),
    { lang: "ar", preheaderText: `حسابك في ${APP_NAME} جاهز`, isSecurityEmail: false, notificationPrefLink: `${env.APP_BASE_URL}/account/notifications` }
  )
  return {
    subject,
    html,
    text: buildPlainText([
      { type: "heading", text: subject },
      { type: "paragraph", text: `مرحباً بك يا ${fullName}! تم تفعيل حسابك.` },
      { type: "button", label: "الدخول إلى المنصة", href: `${env.APP_BASE_URL}/` },
    ]),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PASSWORD_RESET
// ═══════════════════════════════════════════════════════════════════════════════
export function buildPasswordResetEmail(link: string, lang: "ar" | "fr"): EmailTemplate {
  const safeLink = escapeHtml(link)
  if (lang === "fr") {
    const subject = `Réinitialisation du mot de passe — ${APP_NAME}`
    const html = wrapLayout(
      heading("Réinitialisation du mot de passe", "fr") +
      paragraph(`Vous avez demandé à réinitialiser le mot de passe de votre compte <strong>${escapeHtml(APP_NAME)}</strong>.`, "fr") +
      primaryButton("Réinitialiser mon mot de passe", safeLink, "fr") +
      securityNoticeBox([
        "Ce lien expire dans <strong>60 minutes</strong>.",
        "Si vous n'avez pas fait cette demande, ignorez ce message — votre compte est en sécurité.",
        "Nous ne vous demanderons jamais votre mot de passe par e-mail.",
      ], "fr"),
      { lang: "fr", preheaderText: "Réinitialisez votre mot de passe", isSecurityEmail: true }
    )
    return {
      subject,
      html,
      text: buildPlainText([
        { type: "heading", text: subject },
        { type: "button", label: "Réinitialiser mon mot de passe", href: link },
        { type: "notice", lines: ["Ce lien expire dans 60 minutes.", "Si vous n'avez pas fait cette demande, ignorez ce message."] },
      ]),
    }
  }

  const subject = `إعادة تعيين كلمة المرور — ${APP_NAME}`
  const html = wrapLayout(
    heading("إعادة تعيين كلمة المرور", "ar") +
    paragraph(`طلبت إعادة تعيين كلمة المرور لحسابك في منصة <strong>${escapeHtml(APP_NAME)}</strong>.`, "ar") +
    primaryButton("إعادة تعيين كلمة المرور", safeLink, "ar") +
    securityNoticeBox([
      "ينتهي هذا الرابط خلال <strong>60 دقيقة</strong>.",
      "إذا لم تطلب ذلك، تجاهل هذه الرسالة — حسابك بأمان.",
      "لن نطلب منك كلمة المرور أبداً عبر البريد الإلكتروني.",
    ], "ar"),
    { lang: "ar", preheaderText: "أعد تعيين كلمة المرور", isSecurityEmail: true }
  )
  return {
    subject,
    html,
    text: buildPlainText([
      { type: "heading", text: subject },
      { type: "button", label: "إعادة تعيين كلمة المرور", href: link },
      { type: "notice", lines: ["ينتهي هذا الرابط خلال 60 دقيقة.", "إذا لم تطلب ذلك، تجاهل هذه الرسالة."] },
    ]),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PASSWORD_CHANGED
// ═══════════════════════════════════════════════════════════════════════════════
export function buildPasswordChangedEmail(email: string, fullName: string, lang: "ar" | "fr"): EmailTemplate {
  const safeName = escapeHtml(fullName)
  const resetLink = `${env.APP_BASE_URL}/forgot-password`
  if (lang === "fr") {
    const subject = `Votre mot de passe a été modifié — ${APP_NAME}`
    const html = wrapLayout(
      heading("Votre mot de passe a été modifié", "fr") +
      paragraph(`Bonjour <strong>${safeName}</strong>, le mot de passe de votre compte <strong>${escapeHtml(APP_NAME)}</strong> a été modifié.`, "fr") +
      securityNoticeBox([
        "Si c'est vous qui avez effectué cette modification, aucune action n'est requise.",
        `Si vous n'êtes pas à l'origine de ce changement, <a href="${resetLink}" style="color:#854d0e">réinitialisez votre mot de passe immédiatement</a> et contactez-nous.`,
        "Nous ne vous demanderons jamais votre mot de passe par e-mail.",
      ], "fr"),
      { lang: "fr", preheaderText: "Votre mot de passe a été modifié", isSecurityEmail: true }
    )
    return {
      subject,
      html,
      text: buildPlainText([
        { type: "heading", text: subject },
        { type: "paragraph", text: `Bonjour ${fullName}, votre mot de passe a été modifié.` },
        { type: "notice", lines: ["Si ce n'est pas vous, réinitialisez votre mot de passe : " + resetLink] },
      ]),
    }
  }

  const subject = `تم تغيير كلمة المرور — ${APP_NAME}`
  const html = wrapLayout(
    heading("تم تغيير كلمة المرور", "ar") +
    paragraph(`مرحباً <strong>${safeName}</strong>، تم تغيير كلمة المرور لحسابك في منصة <strong>${escapeHtml(APP_NAME)}</strong>.`, "ar") +
    securityNoticeBox([
      "إذا كنت أنت من قام بهذا التغيير، لا حاجة لأي إجراء.",
      `إذا لم تكن أنت، <a href="${resetLink}" style="color:#854d0e">أعد تعيين كلمة مرورك فوراً</a> وتواصل معنا.`,
      "لن نطلب منك كلمة المرور أبداً عبر البريد الإلكتروني.",
    ], "ar"),
    { lang: "ar", preheaderText: "تم تغيير كلمة مرورك", isSecurityEmail: true }
  )
  return {
    subject,
    html,
    text: buildPlainText([
      { type: "heading", text: subject },
      { type: "paragraph", text: `مرحباً ${fullName}، تم تغيير كلمة مرورك.` },
      { type: "notice", lines: ["إذا لم تكن أنت، أعد تعيين كلمة مرورك: " + resetLink] },
    ]),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVITE
// ═══════════════════════════════════════════════════════════════════════════════
export function buildInviteEmail(link: string, fullName: string, lang: "ar" | "fr"): EmailTemplate {
  const safeName = escapeHtml(fullName)
  const safeLink = escapeHtml(link)
  const ttlHours = env.INVITE_TTL_HOURS ?? 48
  if (lang === "fr") {
    const subject = `Invitation à rejoindre ${APP_NAME}`
    const html = wrapLayout(
      heading(`Invitation à rejoindre ${APP_NAME}`, "fr") +
      paragraph(`Bonjour <strong>${safeName}</strong>,`, "fr") +
      paragraph(`Votre compte sur la plateforme <strong>${escapeHtml(APP_NAME)}</strong> a été créé par l'administrateur. Cliquez sur le bouton ci-dessous pour définir votre mot de passe et activer votre compte.`, "fr") +
      primaryButton("Activer mon compte", safeLink, "fr") +
      securityNoticeBox([
        `Ce lien expire dans <strong>${ttlHours} heures</strong>.`,
        "Si vous ne reconnaissez pas cette invitation, ignorez ce message.",
        "Nous ne vous demanderons jamais votre mot de passe par e-mail.",
      ], "fr"),
      { lang: "fr", preheaderText: `Activez votre compte ${APP_NAME}`, isSecurityEmail: true }
    )
    return {
      subject,
      html,
      text: buildPlainText([
        { type: "heading", text: subject },
        { type: "paragraph", text: `Bonjour ${fullName}, activez votre compte :` },
        { type: "button", label: "Activer mon compte", href: link },
        { type: "notice", lines: [`Ce lien expire dans ${ttlHours} heures.`] },
      ]),
    }
  }

  const subject = `دعوة للانضمام إلى منصة ${APP_NAME}`
  const html = wrapLayout(
    heading(`دعوة للانضمام إلى المنصة`, "ar") +
    paragraph(`مرحباً <strong>${safeName}</strong>،`, "ar") +
    paragraph(`تم إنشاء حسابك في منصة <strong>${escapeHtml(APP_NAME)}</strong> من قِبل المشرف. انقر على الزر أدناه لتعيين كلمة المرور وتفعيل حسابك.`, "ar") +
    primaryButton("تفعيل الحساب", safeLink, "ar") +
    securityNoticeBox([
      `ينتهي هذا الرابط خلال <strong>${ttlHours} ساعة</strong>.`,
      "إذا لم تتعرف على هذه الدعوة، تجاهل هذه الرسالة.",
      "لن نطلب منك كلمة المرور أبداً عبر البريد الإلكتروني.",
    ], "ar"),
    { lang: "ar", preheaderText: `فعّل حسابك في ${APP_NAME}`, isSecurityEmail: true }
  )
  return {
    subject,
    html,
    text: buildPlainText([
      { type: "heading", text: subject },
      { type: "paragraph", text: `مرحباً ${fullName}، فعّل حسابك:` },
      { type: "button", label: "تفعيل الحساب", href: link },
      { type: "notice", lines: [`ينتهي هذا الرابط خلال ${ttlHours} ساعة.`] },
    ]),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN_ACCOUNT_READY (bootstrap notice — no password inside)
// ═══════════════════════════════════════════════════════════════════════════════
export function buildAdminAccountReadyEmail(loginLink: string, fullName: string, lang: "ar" | "fr"): EmailTemplate {
  const safeName = escapeHtml(fullName)
  const safeLink = escapeHtml(loginLink)
  if (lang === "fr") {
    const subject = `Votre compte administrateur est prêt — ${APP_NAME}`
    const html = wrapLayout(
      heading("Votre compte administrateur est prêt", "fr") +
      paragraph(`Bonjour <strong>${safeName}</strong>,`, "fr") +
      paragraph(`Un compte Super Administrateur a été créé pour vous sur la plateforme <strong>${escapeHtml(APP_NAME)}</strong>. Vous pouvez vous connecter dès maintenant avec les identifiants configurés.`, "fr") +
      primaryButton("Se connecter", safeLink, "fr") +
      securityNoticeBox([
        "Vous devrez changer votre mot de passe dès la première connexion.",
        "Après le changement de mot de passe, configurez l'authentification à deux facteurs (2FA).",
        "Supprimez la variable SUPER_ADMIN_INITIAL_PASSWORD de votre fichier .env après la première connexion.",
        "Nous ne vous demanderons jamais votre mot de passe par e-mail.",
      ], "fr"),
      { lang: "fr", preheaderText: "Votre compte administrateur est configuré", isSecurityEmail: true }
    )
    return {
      subject,
      html,
      text: buildPlainText([
        { type: "heading", text: subject },
        { type: "paragraph", text: `Bonjour ${fullName}, votre compte administrateur est prêt.` },
        { type: "button", label: "Se connecter", href: loginLink },
        { type: "notice", lines: [
          "Changez votre mot de passe à la première connexion.",
          "Activez la 2FA après le changement de mot de passe.",
          "Supprimez SUPER_ADMIN_INITIAL_PASSWORD de .env après la première connexion.",
        ]},
      ]),
    }
  }

  const subject = `حسابك كمشرف جاهز — ${APP_NAME}`
  const html = wrapLayout(
    heading("حسابك كمشرف جاهز", "ar") +
    paragraph(`مرحباً <strong>${safeName}</strong>،`, "ar") +
    paragraph(`تم إنشاء حساب المشرف الأعلى لك في منصة <strong>${escapeHtml(APP_NAME)}</strong>. يمكنك تسجيل الدخول الآن بالبيانات المُعدَّة.`, "ar") +
    primaryButton("تسجيل الدخول", safeLink, "ar") +
    securityNoticeBox([
      "يجب عليك تغيير كلمة المرور عند أول تسجيل دخول.",
      "بعد تغيير كلمة المرور، فعّل المصادقة الثنائية (2FA).",
      "احذف متغير SUPER_ADMIN_INITIAL_PASSWORD من ملف .env بعد أول تسجيل دخول.",
      "لن نطلب منك كلمة المرور أبداً عبر البريد الإلكتروني.",
    ], "ar"),
    { lang: "ar", preheaderText: "حسابك كمشرف في المنصة جاهز", isSecurityEmail: true }
  )
  return {
    subject,
    html,
    text: buildPlainText([
      { type: "heading", text: subject },
      { type: "paragraph", text: `مرحباً ${fullName}، حسابك كمشرف جاهز.` },
      { type: "button", label: "تسجيل الدخول", href: loginLink },
      { type: "notice", lines: [
        "غيّر كلمة المرور عند أول تسجيل دخول.",
        "فعّل 2FA بعد تغيير كلمة المرور.",
        "احذف SUPER_ADMIN_INITIAL_PASSWORD من .env بعد أول تسجيل دخول.",
      ]},
    ]),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPT_REQUESTED
// ═══════════════════════════════════════════════════════════════════════════════
export function buildApptRequestedEmail(
  params: { doctorName: string; institutionName: string; startsAt: Date },
  lang: "ar" | "fr"
): EmailTemplate {
  const dateStr = formatDate(params.startsAt, lang)
  const timeStr = formatTime(params.startsAt, lang)
  const safeDr = escapeHtml(params.doctorName)
  const safeInst = escapeHtml(params.institutionName)
  const apptLink = `${env.APP_BASE_URL}/account/appointments`

  if (lang === "fr") {
    const subject = `Demande de rendez-vous reçue — ${APP_NAME}`
    const html = wrapLayout(
      heading("Demande de rendez-vous reçue", "fr") +
      paragraph("Votre demande a bien été reçue et est en attente de confirmation.", "fr") +
      infoBox([
        { label: "Médecin", value: `Dr. ${params.doctorName}` },
        { label: "Établissement", value: params.institutionName },
        { label: "Date", value: dateStr },
        { label: "Heure", value: `${timeStr} (heure d'Algérie)` },
      ], "fr") +
      primaryButton("Voir mes rendez-vous", apptLink, "fr") +
      noticeBox(["Vous serez notifié(e) dès que votre rendez-vous sera confirmé."], "fr"),
      { lang: "fr", preheaderText: "Votre demande de rendez-vous a été reçue", isSecurityEmail: false, notificationPrefLink: `${env.APP_BASE_URL}/account/notifications` }
    )
    return {
      subject,
      html,
      text: buildPlainText([
        { type: "heading", text: subject },
        { type: "paragraph", text: "Votre demande a bien été reçue." },
        { type: "info", rows: [
          { label: "Médecin", value: `Dr. ${params.doctorName}` },
          { label: "Établissement", value: params.institutionName },
          { label: "Date", value: dateStr },
          { label: "Heure", value: `${timeStr} (heure d'Algérie)` },
        ]},
        { type: "button", label: "Voir mes rendez-vous", href: apptLink },
      ]),
    }
  }

  const subject = `تم استلام طلب موعدك — ${APP_NAME}`
  const html = wrapLayout(
    heading("تم استلام طلب موعدك", "ar") +
    paragraph("تم استلام طلبك وهو بانتظار التأكيد.", "ar") +
    infoBox([
      { label: "الطبيب", value: `د. ${params.doctorName}` },
      { label: "المؤسسة", value: params.institutionName },
      { label: "التاريخ", value: dateStr },
      { label: "الوقت", value: `${timeStr} (توقيت الجزائر)` },
    ], "ar") +
    primaryButton("عرض مواعيدي", apptLink, "ar") +
    noticeBox(["ستتلقى إشعاراً فور تأكيد موعدك."], "ar"),
    { lang: "ar", preheaderText: "تم استلام طلب موعدك", isSecurityEmail: false, notificationPrefLink: `${env.APP_BASE_URL}/account/notifications` }
  )
  return {
    subject,
    html,
    text: buildPlainText([
      { type: "heading", text: subject },
      { type: "paragraph", text: "تم استلام طلبك وهو بانتظار التأكيد." },
      { type: "info", rows: [
        { label: "الطبيب", value: `د. ${params.doctorName}` },
        { label: "المؤسسة", value: params.institutionName },
        { label: "التاريخ", value: dateStr },
        { label: "الوقت", value: `${timeStr} (توقيت الجزائر)` },
      ]},
      { type: "button", label: "عرض مواعيدي", href: apptLink },
    ]),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPT_CONFIRMED (with .ics calendar attachment instruction — built by caller)
// ═══════════════════════════════════════════════════════════════════════════════
export function buildApptConfirmedEmail(
  params: {
    doctorName: string
    institutionName: string
    institutionAddress?: string
    institutionLat?: number
    institutionLng?: number
    startsAt: Date
    endsAt: Date
  },
  lang: "ar" | "fr"
): EmailTemplate {
  const dateStr = formatDate(params.startsAt, lang)
  const timeStr = formatTime(params.startsAt, lang)
  const apptLink = `${env.APP_BASE_URL}/account/appointments`
  const mapLink = params.institutionLat && params.institutionLng
    ? `https://www.openstreetmap.org/?mlat=${params.institutionLat}&mlon=${params.institutionLng}&zoom=17`
    : null

  const infoRows = [
    { label: lang === "fr" ? "Médecin" : "الطبيب", value: lang === "fr" ? `Dr. ${params.doctorName}` : `د. ${params.doctorName}` },
    { label: lang === "fr" ? "Établissement" : "المؤسسة", value: params.institutionName },
    { label: lang === "fr" ? "Date" : "التاريخ", value: dateStr },
    { label: lang === "fr" ? "Heure" : "الوقت", value: `${timeStr} (${lang === "fr" ? "heure d'Algérie" : "توقيت الجزائر"})` },
    ...(params.institutionAddress ? [{ label: lang === "fr" ? "Adresse" : "العنوان", value: params.institutionAddress }] : []),
  ]

  if (lang === "fr") {
    const subject = `Rendez-vous confirmé — ${APP_NAME}`
    const mapSection = mapLink
      ? paragraph(`<a href="${escapeHtml(mapLink)}" style="color:#3b82d4">Voir sur la carte</a>`, "fr")
      : ""
    const html = wrapLayout(
      heading("Rendez-vous confirmé ✓", "fr") +
      paragraph("Votre rendez-vous a été confirmé. Un fichier calendrier (.ics) est joint à cet e-mail.", "fr") +
      infoBox(infoRows, "fr") +
      mapSection +
      primaryButton("Voir mes rendez-vous", apptLink, "fr") +
      noticeBox(["Pour annuler, rendez-vous sur votre espace personnel."], "fr"),
      { lang: "fr", preheaderText: "Rendez-vous confirmé", isSecurityEmail: false, notificationPrefLink: `${env.APP_BASE_URL}/account/notifications` }
    )
    return {
      subject,
      html,
      text: buildPlainText([
        { type: "heading", text: subject },
        { type: "info", rows: infoRows },
        ...(mapLink ? [{ type: "paragraph" as const, text: "Carte: " + mapLink }] : []),
        { type: "button", label: "Voir mes rendez-vous", href: apptLink },
      ]),
    }
  }

  const subject = `تم تأكيد موعدك — ${APP_NAME}`
  const mapSection = mapLink
    ? paragraph(`<a href="${escapeHtml(mapLink)}" style="color:#3b82d4">عرض على الخريطة</a>`, "ar")
    : ""
  const html = wrapLayout(
    heading("تم تأكيد موعدك ✓", "ar") +
    paragraph("تم تأكيد موعدك. ملف التقويم (.ics) مرفق بهذا البريد.", "ar") +
    infoBox(infoRows, "ar") +
    mapSection +
    primaryButton("عرض مواعيدي", apptLink, "ar") +
    noticeBox(["للإلغاء، توجّه إلى حسابك الشخصي."], "ar"),
    { lang: "ar", preheaderText: "تم تأكيد موعدك", isSecurityEmail: false, notificationPrefLink: `${env.APP_BASE_URL}/account/notifications` }
  )
  return {
    subject,
    html,
    text: buildPlainText([
      { type: "heading", text: subject },
      { type: "info", rows: infoRows },
      ...(mapLink ? [{ type: "paragraph" as const, text: "خريطة: " + mapLink }] : []),
      { type: "button", label: "عرض مواعيدي", href: apptLink },
    ]),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPT_CANCELLED / APPT_DECLINED / APPT_RESCHEDULED
// ═══════════════════════════════════════════════════════════════════════════════
export function buildApptCancelledEmail(
  params: { doctorName: string; institutionName: string; startsAt: Date; cancelReason?: string; isRescheduled?: boolean },
  lang: "ar" | "fr",
  forDoctor = false
): EmailTemplate {
  const dateStr = formatDate(params.startsAt, lang)
  const timeStr = formatTime(params.startsAt, lang)
  const apptLink = `${env.APP_BASE_URL}/${forDoctor ? "doctor/appointments" : "account/appointments"}`
  const kind = params.isRescheduled ? "rescheduled" : "cancelled"

  if (lang === "fr") {
    const titleMap = { cancelled: "Rendez-vous annulé", rescheduled: "Rendez-vous reprogrammé" }
    const subject = `${titleMap[kind]} — ${APP_NAME}`
    const preRows = [
      { label: "Médecin", value: `Dr. ${params.doctorName}` },
      { label: "Établissement", value: params.institutionName },
      { label: "Date prévue", value: dateStr },
      { label: "Heure prévue", value: `${timeStr} (heure d'Algérie)` },
    ]
    const html = wrapLayout(
      heading(titleMap[kind], "fr") +
      infoBox(preRows, "fr") +
      (params.cancelReason ? paragraph(`Motif de catégorie : <strong>${escapeHtml(params.cancelReason)}</strong>`, "fr") : "") +
      primaryButton("Voir mes rendez-vous", apptLink, "fr") +
      noticeBox(params.isRescheduled
        ? ["Votre rendez-vous a été reprogrammé. Vérifiez vos rendez-vous pour la nouvelle date."]
        : ["Votre rendez-vous a été annulé. Vous pouvez en prendre un nouveau depuis votre espace personnel."],
      "fr"),
      { lang: "fr", preheaderText: titleMap[kind], isSecurityEmail: false, notificationPrefLink: `${env.APP_BASE_URL}/account/notifications` }
    )
    return {
      subject,
      html,
      text: buildPlainText([
        { type: "heading", text: subject },
        { type: "info", rows: preRows },
        { type: "button", label: "Voir mes rendez-vous", href: apptLink },
      ]),
    }
  }

  const titleMap = { cancelled: "تم إلغاء الموعد", rescheduled: "تمت إعادة جدولة الموعد" }
  const subject = `${titleMap[kind]} — ${APP_NAME}`
  const preRows = [
    { label: "الطبيب", value: `د. ${params.doctorName}` },
    { label: "المؤسسة", value: params.institutionName },
    { label: "التاريخ المقرر", value: dateStr },
    { label: "الوقت المقرر", value: `${timeStr} (توقيت الجزائر)` },
  ]
  const html = wrapLayout(
    heading(titleMap[kind], "ar") +
    infoBox(preRows, "ar") +
    (params.cancelReason ? paragraph(`فئة السبب: <strong>${escapeHtml(params.cancelReason)}</strong>`, "ar") : "") +
    primaryButton("عرض مواعيدي", apptLink, "ar") +
    noticeBox(params.isRescheduled
      ? ["تمت إعادة جدولة موعدك. تحقق من مواعيدك للاطلاع على التاريخ الجديد."]
      : ["تم إلغاء موعدك. يمكنك حجز موعد جديد من حسابك الشخصي."],
    "ar"),
    { lang: "ar", preheaderText: titleMap[kind], isSecurityEmail: false, notificationPrefLink: `${env.APP_BASE_URL}/account/notifications` }
  )
  return {
    subject,
    html,
    text: buildPlainText([
      { type: "heading", text: subject },
      { type: "info", rows: preRows },
      { type: "button", label: "عرض مواعيدي", href: apptLink },
    ]),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// APPT_REMINDER (patient + doctor)
// ═══════════════════════════════════════════════════════════════════════════════
export function buildAppointmentReminderEmail(
  params: { doctorName: string; institutionName: string; startsAt: Date; offsetHours?: number },
  lang: "ar" | "fr"
): EmailTemplate {
  // Privacy: no medical reason, no diagnosis
  const dateStr = formatDate(params.startsAt, lang)
  const timeStr = formatTime(params.startsAt, lang)
  const apptLink = `${env.APP_BASE_URL}/account/appointments`
  const offset = params.offsetHours ?? 24

  if (lang === "fr") {
    const subject = `Rappel de rendez-vous (dans ${offset}h) — ${APP_NAME}`
    const html = wrapLayout(
      heading("Rappel de rendez-vous", "fr") +
      paragraph(`Vous avez un rendez-vous dans <strong>${offset} heure${offset > 1 ? "s" : ""}</strong>.`, "fr") +
      infoBox([
        { label: "Médecin", value: `Dr. ${params.doctorName}` },
        { label: "Établissement", value: params.institutionName },
        { label: "Date", value: dateStr },
        { label: "Heure", value: `${timeStr} (heure d'Algérie)` },
      ], "fr") +
      primaryButton("Voir mes rendez-vous", apptLink, "fr"),
      {
        lang: "fr",
        preheaderText: `Votre rendez-vous est dans ${offset} heure${offset > 1 ? "s" : ""}`,
        isSecurityEmail: false,
        notificationPrefLink: `${env.APP_BASE_URL}/account/notifications`,
      }
    )
    return {
      subject,
      html,
      text: buildPlainText([
        { type: "heading", text: subject },
        { type: "info", rows: [
          { label: "Médecin", value: `Dr. ${params.doctorName}` },
          { label: "Établissement", value: params.institutionName },
          { label: "Date", value: dateStr },
          { label: "Heure", value: `${timeStr} (heure d'Algérie)` },
        ]},
        { type: "button", label: "Voir mes rendez-vous", href: apptLink },
      ]),
      headers: unsubscribeHeaders(""),
    }
  }

  const subject = `تذكير بموعدك (خلال ${offset} ساعة) — ${APP_NAME}`
  const html = wrapLayout(
    heading("تذكير بموعدك", "ar") +
    paragraph(`لديك موعد خلال <strong>${offset} ساعة</strong>.`, "ar") +
    infoBox([
      { label: "الطبيب", value: `د. ${params.doctorName}` },
      { label: "المؤسسة", value: params.institutionName },
      { label: "التاريخ", value: dateStr },
      { label: "الوقت", value: `${timeStr} (توقيت الجزائر)` },
    ], "ar") +
    primaryButton("عرض مواعيدي", apptLink, "ar"),
    {
      lang: "ar",
      preheaderText: `موعدك خلال ${offset} ساعة`,
      isSecurityEmail: false,
      notificationPrefLink: `${env.APP_BASE_URL}/account/notifications`,
    }
  )
  return {
    subject,
    html,
    text: buildPlainText([
      { type: "heading", text: subject },
      { type: "info", rows: [
        { label: "الطبيب", value: `د. ${params.doctorName}` },
        { label: "المؤسسة", value: params.institutionName },
        { label: "التاريخ", value: dateStr },
        { label: "الوقت", value: `${timeStr} (توقيت الجزائر)` },
      ]},
      { type: "button", label: "عرض مواعيدي", href: apptLink },
    ]),
    headers: unsubscribeHeaders(""),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCTOR_NEW_REQUEST
// ═══════════════════════════════════════════════════════════════════════════════
export function buildDoctorNewRequestEmail(
  params: { patientName: string; startsAt: Date; institutionName: string },
  lang: "ar" | "fr"
): EmailTemplate {
  const dateStr = formatDate(params.startsAt, lang)
  const timeStr = formatTime(params.startsAt, lang)
  const requestsLink = `${env.APP_BASE_URL}/doctor/appointments`

  if (lang === "fr") {
    const subject = `Nouvelle demande de rendez-vous — ${APP_NAME}`
    const html = wrapLayout(
      heading("Nouvelle demande de rendez-vous", "fr") +
      paragraph("Un patient a demandé un rendez-vous.", "fr") +
      infoBox([
        { label: "Patient", value: params.patientName },
        { label: "Établissement", value: params.institutionName },
        { label: "Date demandée", value: dateStr },
        { label: "Heure demandée", value: `${timeStr} (heure d'Algérie)` },
      ], "fr") +
      primaryButton("Voir les demandes", requestsLink, "fr"),
      { lang: "fr", preheaderText: "Nouvelle demande de rendez-vous", isSecurityEmail: false }
    )
    return {
      subject,
      html,
      text: buildPlainText([
        { type: "heading", text: subject },
        { type: "info", rows: [
          { label: "Patient", value: params.patientName },
          { label: "Date", value: dateStr },
          { label: "Heure", value: timeStr },
        ]},
        { type: "button", label: "Voir les demandes", href: requestsLink },
      ]),
    }
  }

  const subject = `طلب موعد جديد — ${APP_NAME}`
  const html = wrapLayout(
    heading("طلب موعد جديد", "ar") +
    paragraph("طلب مريض موعداً جديداً.", "ar") +
    infoBox([
      { label: "المريض", value: params.patientName },
      { label: "المؤسسة", value: params.institutionName },
      { label: "التاريخ المطلوب", value: dateStr },
      { label: "الوقت المطلوب", value: `${timeStr} (توقيت الجزائر)` },
    ], "ar") +
    primaryButton("عرض الطلبات", requestsLink, "ar"),
    { lang: "ar", preheaderText: "طلب موعد جديد", isSecurityEmail: false }
  )
  return {
    subject,
    html,
    text: buildPlainText([
      { type: "heading", text: subject },
      { type: "info", rows: [
        { label: "المريض", value: params.patientName },
        { label: "التاريخ", value: dateStr },
        { label: "الوقت", value: timeStr },
      ]},
      { type: "button", label: "عرض الطلبات", href: requestsLink },
    ]),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCTOR_DAILY_DIGEST
// ═══════════════════════════════════════════════════════════════════════════════
export function buildDoctorDailyDigestEmail(
  params: {
    doctorName: string
    date: Date
    appointments: Array<{ time: string; patientName: string; institutionName: string }>
  },
  lang: "ar" | "fr"
): EmailTemplate {
  const dateStr = formatDate(params.date, lang)
  const scheduleLink = `${env.APP_BASE_URL}/doctor/appointments`

  const apptRows = params.appointments.map((a) =>
    `<tr>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:14px">${escapeHtml(a.time)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:14px"><bdi>${escapeHtml(a.patientName)}</bdi></td>
      <td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;font-size:14px"><bdi>${escapeHtml(a.institutionName)}</bdi></td>
    </tr>`
  ).join("")

  const tableHtml = `<tr><td style="padding-bottom:16px">
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;border-collapse:collapse">
      <thead>
        <tr style="background-color:#f7f8fa">
          <th style="padding:8px;font-size:13px;font-weight:600;text-align:left">${lang === "fr" ? "Heure" : "الوقت"}</th>
          <th style="padding:8px;font-size:13px;font-weight:600;text-align:left">${lang === "fr" ? "Patient" : "المريض"}</th>
          <th style="padding:8px;font-size:13px;font-weight:600;text-align:left">${lang === "fr" ? "Établissement" : "المؤسسة"}</th>
        </tr>
      </thead>
      <tbody>${apptRows}</tbody>
    </table>
  </td></tr>`

  if (lang === "fr") {
    const subject = `Agenda du jour — ${dateStr} — ${APP_NAME}`
    const html = wrapLayout(
      heading(`Agenda du ${dateStr}`, "fr") +
      paragraph(`Bonjour Dr. <strong>${escapeHtml(params.doctorName)}</strong>, voici vos rendez-vous confirmés pour aujourd'hui.`, "fr") +
      (params.appointments.length > 0 ? tableHtml : paragraph("Aucun rendez-vous confirmé pour aujourd'hui.", "fr")) +
      primaryButton("Voir mon agenda complet", scheduleLink, "fr"),
      { lang: "fr", preheaderText: `${params.appointments.length} rendez-vous aujourd'hui`, isSecurityEmail: false, notificationPrefLink: `${env.APP_BASE_URL}/account/notifications` }
    )
    return {
      subject,
      html,
      text: buildPlainText([
        { type: "heading", text: subject },
        { type: "info", rows: params.appointments.map((a) => ({ label: a.time, value: a.patientName })) },
        { type: "button", label: "Voir mon agenda complet", href: scheduleLink },
      ]),
      headers: unsubscribeHeaders(""),
    }
  }

  const subject = `أجندة اليوم — ${dateStr} — ${APP_NAME}`
  const html = wrapLayout(
    heading(`أجندة يوم ${dateStr}`, "ar") +
    paragraph(`مرحباً د. <strong>${escapeHtml(params.doctorName)}</strong>، فيما يلي مواعيدك المؤكدة لليوم.`, "ar") +
    (params.appointments.length > 0 ? tableHtml : paragraph("لا توجد مواعيد مؤكدة لليوم.", "ar")) +
    primaryButton("عرض جدولي الكامل", scheduleLink, "ar"),
    { lang: "ar", preheaderText: `${params.appointments.length} مواعيد اليوم`, isSecurityEmail: false, notificationPrefLink: `${env.APP_BASE_URL}/account/notifications` }
  )
  return {
    subject,
    html,
    text: buildPlainText([
      { type: "heading", text: subject },
      { type: "info", rows: params.appointments.map((a) => ({ label: a.time, value: a.patientName })) },
      { type: "button", label: "عرض جدولي الكامل", href: scheduleLink },
    ]),
    headers: unsubscribeHeaders(""),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEW_DEVICE_LOGIN
// ═══════════════════════════════════════════════════════════════════════════════
export function buildNewDeviceLoginEmail(
  params: { fullName: string; time: Date; deviceInfo: string },
  lang: "ar" | "fr"
): EmailTemplate {
  const timeStr = formatDate(params.time, lang) + " " + formatTime(params.time, lang)
  const safeName = escapeHtml(params.fullName)
  const safeDevice = escapeHtml(params.deviceInfo)
  const resetLink = `${env.APP_BASE_URL}/forgot-password`

  if (lang === "fr") {
    const subject = `Nouvelle connexion détectée — ${APP_NAME}`
    const html = wrapLayout(
      heading("Nouvelle connexion détectée", "fr") +
      paragraph(`Bonjour <strong>${safeName}</strong>, une nouvelle connexion à votre compte a été détectée.`, "fr") +
      infoBox([
        { label: "Heure", value: `${timeStr} (heure d'Algérie)` },
        { label: "Appareil/navigateur", value: params.deviceInfo },
      ], "fr") +
      securityNoticeBox([
        `Si c'est vous, aucune action n'est requise.`,
        `Si ce n'est pas vous, <a href="${resetLink}" style="color:#854d0e">réinitialisez votre mot de passe immédiatement</a>.`,
        "Nous ne vous demanderons jamais votre mot de passe par e-mail.",
      ], "fr"),
      { lang: "fr", preheaderText: "Nouvelle connexion à votre compte", isSecurityEmail: true }
    )
    return {
      subject,
      html,
      text: buildPlainText([
        { type: "heading", text: subject },
        { type: "info", rows: [{ label: "Heure", value: timeStr }, { label: "Appareil", value: params.deviceInfo }] },
        { type: "notice", lines: ["Si ce n'est pas vous: " + resetLink] },
      ]),
    }
  }

  const subject = `تم اكتشاف تسجيل دخول جديد — ${APP_NAME}`
  const html = wrapLayout(
    heading("تم اكتشاف تسجيل دخول جديد", "ar") +
    paragraph(`مرحباً <strong>${safeName}</strong>، تم اكتشاف تسجيل دخول جديد لحسابك.`, "ar") +
    infoBox([
      { label: "الوقت", value: `${timeStr} (توقيت الجزائر)` },
      { label: "الجهاز/المتصفح", value: params.deviceInfo },
    ], "ar") +
    securityNoticeBox([
      "إذا كنت أنت، لا حاجة لأي إجراء.",
      `إذا لم تكن أنت، <a href="${resetLink}" style="color:#854d0e">أعد تعيين كلمة مرورك فوراً</a>.`,
      "لن نطلب منك كلمة المرور أبداً عبر البريد الإلكتروني.",
    ], "ar"),
    { lang: "ar", preheaderText: "تسجيل دخول جديد لحسابك", isSecurityEmail: true }
  )
  return {
    subject,
    html,
    text: buildPlainText([
      { type: "heading", text: subject },
      { type: "info", rows: [{ label: "الوقت", value: timeStr }, { label: "الجهاز", value: params.deviceInfo }] },
      { type: "notice", lines: ["إذا لم تكن أنت: " + resetLink] },
    ]),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MFA_ENABLED / MFA_DISABLED
// ═══════════════════════════════════════════════════════════════════════════════
export function buildMfaStatusEmail(
  params: { fullName: string; enabled: boolean },
  lang: "ar" | "fr"
): EmailTemplate {
  const safeName = escapeHtml(params.fullName)
  const resetLink = `${env.APP_BASE_URL}/forgot-password`
  if (lang === "fr") {
    const action = params.enabled ? "activée" : "désactivée"
    const subject = `Authentification à deux facteurs ${action} — ${APP_NAME}`
    const html = wrapLayout(
      heading(`2FA ${action}`, "fr") +
      paragraph(`Bonjour <strong>${safeName}</strong>, l'authentification à deux facteurs (2FA) a été <strong>${action}</strong> sur votre compte.`, "fr") +
      securityNoticeBox([
        "Si c'est vous, aucune action n'est requise.",
        `Si ce n'est pas vous, <a href="${resetLink}" style="color:#854d0e">réinitialisez votre mot de passe immédiatement</a>.`,
      ], "fr"),
      { lang: "fr", preheaderText: `2FA ${action}`, isSecurityEmail: true }
    )
    return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "notice", lines: ["Si ce n'est pas vous: " + resetLink] }]) }
  }

  const action = params.enabled ? "مُفعَّلة" : "مُعطَّلة"
  const subject = `المصادقة الثنائية ${action} — ${APP_NAME}`
  const html = wrapLayout(
    heading(`2FA ${action}`, "ar") +
    paragraph(`مرحباً <strong>${safeName}</strong>، تم <strong>${action}</strong> المصادقة الثنائية (2FA) على حسابك.`, "ar") +
    securityNoticeBox([
      "إذا كنت أنت، لا حاجة لأي إجراء.",
      `إذا لم تكن أنت، <a href="${resetLink}" style="color:#854d0e">أعد تعيين كلمة مرورك فوراً</a>.`,
    ], "ar"),
    { lang: "ar", preheaderText: `تغيير إعدادات 2FA`, isSecurityEmail: true }
  )
  return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "notice", lines: ["إذا لم تكن أنت: " + resetLink] }]) }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACCOUNT_DEACTIVATED / ACCOUNT_REACTIVATED
// ═══════════════════════════════════════════════════════════════════════════════
export function buildAccountStatusEmail(
  params: { fullName: string; activated: boolean },
  lang: "ar" | "fr"
): EmailTemplate {
  const safeName = escapeHtml(params.fullName)
  const contactLink = `${env.APP_BASE_URL}/contact`
  if (lang === "fr") {
    const action = params.activated ? "réactivé" : "désactivé"
    const subject = `Votre compte a été ${action} — ${APP_NAME}`
    const html = wrapLayout(
      heading(`Compte ${action}`, "fr") +
      paragraph(`Bonjour <strong>${safeName}</strong>, votre compte sur <strong>${escapeHtml(APP_NAME)}</strong> a été <strong>${action}</strong> par l'administrateur.`, "fr") +
      noticeBox([`Si vous avez des questions, <a href="${contactLink}" style="color:#15803d">contactez-nous</a>.`], "fr"),
      { lang: "fr", preheaderText: `Votre compte a été ${action}`, isSecurityEmail: true }
    )
    return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "notice", lines: ["Contact: " + contactLink] }]) }
  }

  const action = params.activated ? "مُعاد تفعيله" : "مُعطَّل"
  const subject = `تم ${params.activated ? "إعادة تفعيل" : "تعطيل"} حسابك — ${APP_NAME}`
  const html = wrapLayout(
    heading(`الحساب ${action}`, "ar") +
    paragraph(`مرحباً <strong>${safeName}</strong>، تم ${params.activated ? "إعادة تفعيل" : "تعطيل"} حسابك في منصة <strong>${escapeHtml(APP_NAME)}</strong> من قِبل المشرف.`, "ar") +
    noticeBox([`إذا لديك أسئلة، <a href="${contactLink}" style="color:#15803d">تواصل معنا</a>.`], "ar"),
    { lang: "ar", preheaderText: `تغيير حالة حسابك`, isSecurityEmail: true }
  )
  return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "notice", lines: ["تواصل معنا: " + contactLink] }]) }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INSTITUTION_STATUS_CHANGED
// ═══════════════════════════════════════════════════════════════════════════════
export function buildInstitutionStatusEmail(
  params: { institutionName: string; newStatus: "VERIFIED" | "SUSPENDED" },
  lang: "ar" | "fr"
): EmailTemplate {
  const safeInst = escapeHtml(params.institutionName)
  const contactLink = `${env.APP_BASE_URL}/contact`
  if (lang === "fr") {
    const statusMap = { VERIFIED: "vérifiée", SUSPENDED: "suspendue" }
    const subject = `Statut de l'établissement mis à jour — ${APP_NAME}`
    const html = wrapLayout(
      heading("Statut de l'établissement mis à jour", "fr") +
      paragraph(`L'établissement <strong>${safeInst}</strong> a été <strong>${statusMap[params.newStatus]}</strong> sur la plateforme <strong>${escapeHtml(APP_NAME)}</strong>.`, "fr") +
      noticeBox([`Pour toute question, <a href="${contactLink}" style="color:#15803d">contactez-nous</a>.`], "fr"),
      { lang: "fr", preheaderText: `Statut: ${statusMap[params.newStatus]}`, isSecurityEmail: false }
    )
    return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "paragraph", text: `Statut: ${statusMap[params.newStatus]}` }]) }
  }

  const statusMap = { VERIFIED: "تم التحقق منها", SUSPENDED: "تم تعليقها" }
  const subject = `تحديث حالة المؤسسة — ${APP_NAME}`
  const html = wrapLayout(
    heading("تحديث حالة المؤسسة", "ar") +
    paragraph(`مؤسسة <strong>${safeInst}</strong> ${statusMap[params.newStatus]} على منصة <strong>${escapeHtml(APP_NAME)}</strong>.`, "ar") +
    noticeBox([`لأي استفسار، <a href="${contactLink}" style="color:#15803d">تواصل معنا</a>.`], "ar"),
    { lang: "ar", preheaderText: `حالة المؤسسة: ${statusMap[params.newStatus]}`, isSecurityEmail: false }
  )
  return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "paragraph", text: `الحالة: ${statusMap[params.newStatus]}` }]) }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ALREADY_REGISTERED (anti-enumeration)
// ═══════════════════════════════════════════════════════════════════════════════
export function buildAlreadyRegisteredEmail(lang: "ar" | "fr"): EmailTemplate {
  const loginLink = `${env.APP_BASE_URL}/login`
  const resetLink = `${env.APP_BASE_URL}/forgot-password`
  if (lang === "fr") {
    const subject = `Tentative d'inscription avec une adresse déjà utilisée — ${APP_NAME}`
    const html = wrapLayout(
      heading("Adresse déjà enregistrée", "fr") +
      paragraph("Quelqu'un a tenté de créer un compte avec votre adresse e-mail sur notre plateforme. Si c'est vous, vous avez déjà un compte.", "fr") +
      primaryButton("Se connecter", loginLink, "fr") +
      securityNoticeBox([
        `Si vous avez oublié votre mot de passe : <a href="${resetLink}" style="color:#854d0e">réinitialisez-le ici</a>.`,
        "Si ce n'est pas vous, ignorez ce message.",
      ], "fr"),
      { lang: "fr", preheaderText: "Adresse e-mail déjà utilisée", isSecurityEmail: true }
    )
    return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "button", label: "Se connecter", href: loginLink }]) }
  }

  const subject = `محاولة تسجيل ببريد مستخدم مسبقاً — ${APP_NAME}`
  const html = wrapLayout(
    heading("البريد الإلكتروني مسجّل مسبقاً", "ar") +
    paragraph("حاول شخص ما إنشاء حساب باستخدام بريدك الإلكتروني. إذا كنت أنت، فلديك حساب بالفعل.", "ar") +
    primaryButton("تسجيل الدخول", loginLink, "ar") +
    securityNoticeBox([
      `إذا نسيت كلمة المرور: <a href="${resetLink}" style="color:#854d0e">أعد تعيينها هنا</a>.`,
      "إذا لم تكن أنت، تجاهل هذه الرسالة.",
    ], "ar"),
    { lang: "ar", preheaderText: "بريدك الإلكتروني مسجّل مسبقاً", isSecurityEmail: true }
  )
  return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "button", label: "تسجيل الدخول", href: loginLink }]) }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT_RECEIVED (acknowledgement to sender)
// ═══════════════════════════════════════════════════════════════════════════════
export function buildContactReceivedEmail(params: { fullName: string }, lang: "ar" | "fr"): EmailTemplate {
  const safeName = escapeHtml(params.fullName)
  if (lang === "fr") {
    const subject = `Votre message a été reçu — ${APP_NAME}`
    const html = wrapLayout(
      heading("Message reçu", "fr") +
      paragraph(`Bonjour <strong>${safeName}</strong>, nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.`, "fr") +
      noticeBox(["Notre équipe traite habituellement les demandes sous 2 jours ouvrables."], "fr"),
      { lang: "fr", preheaderText: "Nous avons bien reçu votre message", isSecurityEmail: false }
    )
    return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "paragraph", text: `Bonjour ${params.fullName}, votre message a été reçu.` }]) }
  }

  const subject = `تم استلام رسالتك — ${APP_NAME}`
  const html = wrapLayout(
    heading("تم استلام رسالتك", "ar") +
    paragraph(`مرحباً <strong>${safeName}</strong>، استلمنا رسالتك وسنرد عليك في أقرب وقت ممكن.`, "ar") +
    noticeBox(["يعالج فريقنا الطلبات عادةً خلال يومي عمل."], "ar"),
    { lang: "ar", preheaderText: "استلمنا رسالتك", isSecurityEmail: false }
  )
  return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "paragraph", text: `مرحباً ${params.fullName}، تم استلام رسالتك.` }]) }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT_ADMIN_NOTICE / PARTNER_REQUEST_NOTICE / DATA_REPORT_NOTICE
// ═══════════════════════════════════════════════════════════════════════════════
export function buildAdminNoticeEmail(
  params: { kind: "CONTACT" | "PARTNER" | "REPORT"; senderName: string },
  lang: "ar" | "fr"
): EmailTemplate {
  const safeName = escapeHtml(params.senderName)
  const inboxLink = `${env.APP_BASE_URL}/admin/messages`
  const kindLabelFr = { CONTACT: "message de contact", PARTNER: "demande de partenariat", REPORT: "signalement d'erreur" }
  const kindLabelAr = { CONTACT: "رسالة تواصل", PARTNER: "طلب شراكة", REPORT: "إبلاغ عن خطأ" }

  if (lang === "fr") {
    const subject = `Nouveau ${kindLabelFr[params.kind]} — ${APP_NAME}`
    const html = wrapLayout(
      heading(`Nouveau ${kindLabelFr[params.kind]}`, "fr") +
      paragraph(`<strong>${safeName}</strong> a envoyé un ${kindLabelFr[params.kind]}. Consultez la boîte de réception de l'administration.`, "fr") +
      primaryButton("Voir la boîte de réception", inboxLink, "fr"),
      { lang: "fr", preheaderText: subject, isSecurityEmail: false }
    )
    return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "button", label: "Voir la boîte de réception", href: inboxLink }]) }
  }

  const subject = `${kindLabelAr[params.kind]} جديد — ${APP_NAME}`
  const html = wrapLayout(
    heading(`${kindLabelAr[params.kind]} جديد`, "ar") +
    paragraph(`أرسل <strong>${safeName}</strong> ${kindLabelAr[params.kind]}. راجع صندوق الوارد.`, "ar") +
    primaryButton("عرض صندوق الوارد", inboxLink, "ar"),
    { lang: "ar", preheaderText: subject, isSecurityEmail: false }
  )
  return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "button", label: "عرض صندوق الوارد", href: inboxLink }]) }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACCOUNT_DELETION_CONFIRM
// ═══════════════════════════════════════════════════════════════════════════════
export function buildAccountDeletionEmail(params: { fullName: string }, lang: "ar" | "fr"): EmailTemplate {
  const safeName = escapeHtml(params.fullName)
  if (lang === "fr") {
    const subject = `Votre compte a été supprimé — ${APP_NAME}`
    const html = wrapLayout(
      heading("Compte supprimé", "fr") +
      paragraph(`Bonjour <strong>${safeName}</strong>, votre compte et vos données personnelles ont été supprimés de la plateforme <strong>${escapeHtml(APP_NAME)}</strong> conformément à votre demande.`, "fr") +
      noticeBox(["Les données sont conservées dans nos archives conformément aux obligations légales.", "Pour toute question, contactez-nous."
      ], "fr"),
      { lang: "fr", preheaderText: "Votre compte a été supprimé", isSecurityEmail: true }
    )
    return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "paragraph", text: `Bonjour ${params.fullName}, votre compte a été supprimé.` }]) }
  }

  const subject = `تم حذف حسابك — ${APP_NAME}`
  const html = wrapLayout(
    heading("تم حذف الحساب", "ar") +
    paragraph(`مرحباً <strong>${safeName}</strong>، تم حذف حسابك وبياناتك الشخصية من منصة <strong>${escapeHtml(APP_NAME)}</strong> وفق طلبك.`, "ar") +
    noticeBox(["تُحتفظ ببعض البيانات في أرشيفنا وفق الالتزامات القانونية.", "لأي استفسار، تواصل معنا."], "ar"),
    { lang: "ar", preheaderText: "تم حذف حسابك", isSecurityEmail: true }
  )
  return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "paragraph", text: `مرحباً ${params.fullName}، تم حذف حسابك.` }]) }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATA_EXPORT_READY
// ═══════════════════════════════════════════════════════════════════════════════
export function buildDataExportEmail(params: { fullName: string; exportLink: string }, lang: "ar" | "fr"): EmailTemplate {
  const safeName = escapeHtml(params.fullName)
  if (lang === "fr") {
    const subject = `Votre export de données est prêt — ${APP_NAME}`
    const html = wrapLayout(
      heading("Export de données prêt", "fr") +
      paragraph(`Bonjour <strong>${safeName}</strong>, votre export de données personnelles est disponible.`, "fr") +
      primaryButton("Télécharger mes données", escapeHtml(params.exportLink), "fr") +
      securityNoticeBox(["Ce lien expire dans 24 heures.", "Ne partagez pas ce lien."], "fr"),
      { lang: "fr", preheaderText: "Votre export de données est prêt", isSecurityEmail: true }
    )
    return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "button", label: "Télécharger mes données", href: params.exportLink }]) }
  }

  const subject = `تصدير بياناتك جاهز — ${APP_NAME}`
  const html = wrapLayout(
    heading("تصدير البيانات جاهز", "ar") +
    paragraph(`مرحباً <strong>${safeName}</strong>، تصدير بياناتك الشخصية متاح الآن.`, "ar") +
    primaryButton("تحميل بياناتي", escapeHtml(params.exportLink), "ar") +
    securityNoticeBox(["ينتهي هذا الرابط خلال 24 ساعة.", "لا تشارك هذا الرابط مع أحد."], "ar"),
    { lang: "ar", preheaderText: "تصدير بياناتك جاهز", isSecurityEmail: true }
  )
  return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "button", label: "تحميل بياناتي", href: params.exportLink }]) }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST_EMAIL
// ═══════════════════════════════════════════════════════════════════════════════
export function buildTestEmail(lang: "ar" | "fr" = "fr"): EmailTemplate {
  if (lang === "fr") {
    const subject = `E-mail de test — ${APP_NAME}`
    const html = wrapLayout(
      heading("E-mail de test", "fr") +
      paragraph(`Cet e-mail confirme que votre configuration SMTP fonctionne correctement avec <strong>${escapeHtml(APP_NAME)}</strong>.`, "fr") +
      infoBox([
        { label: "Serveur SMTP", value: "[configuré via .env]" },
        { label: "Expéditeur", value: "[MAIL_FROM_ADDRESS]" },
      ], "fr") +
      noticeBox(["Si vous recevez cet e-mail, votre configuration SMTP est correcte."], "fr"),
      { lang: "fr", preheaderText: "Test de configuration SMTP", isSecurityEmail: true }
    )
    return { subject, html, text: `E-mail de test — ${APP_NAME}\n\nSi vous recevez cet e-mail, votre configuration SMTP est correcte.` }
  }

  const subject = `بريد اختباري — ${APP_NAME}`
  const html = wrapLayout(
    heading("بريد اختباري", "ar") +
    paragraph(`يؤكد هذا البريد أن إعدادات SMTP الخاصة بك تعمل بشكل صحيح مع منصة <strong>${escapeHtml(APP_NAME)}</strong>.`, "ar") +
    noticeBox(["إذا تلقيت هذا البريد، فإن إعدادات SMTP صحيحة."], "ar"),
    { lang: "ar", preheaderText: "اختبار إعدادات SMTP", isSecurityEmail: true }
  )
  return { subject, html, text: `بريد اختباري — ${APP_NAME}\n\nإذا تلقيت هذا البريد، فإن إعدادات SMTP صحيحة.` }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL_CHANGE_CONFIRM / EMAIL_CHANGED_NOTICE
// ═══════════════════════════════════════════════════════════════════════════════
export function buildEmailChangeConfirmEmail(link: string, lang: "ar" | "fr"): EmailTemplate {
  const safeLink = escapeHtml(link)
  if (lang === "fr") {
    const subject = `Confirmez votre nouvelle adresse e-mail — ${APP_NAME}`
    const html = wrapLayout(
      heading("Confirmez votre nouvelle adresse e-mail", "fr") +
      paragraph("Cliquez sur le bouton ci-dessous pour confirmer ce changement d'adresse e-mail.", "fr") +
      primaryButton("Confirmer le changement", safeLink, "fr") +
      securityNoticeBox(["Ce lien expire dans 24 heures.", "Si vous n'avez pas demandé ce changement, ignorez ce message."], "fr"),
      { lang: "fr", preheaderText: "Confirmez votre nouvelle adresse e-mail", isSecurityEmail: true }
    )
    return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "button", label: "Confirmer le changement", href: link }]) }
  }

  const subject = `أكّد بريدك الإلكتروني الجديد — ${APP_NAME}`
  const html = wrapLayout(
    heading("أكّد بريدك الإلكتروني الجديد", "ar") +
    paragraph("انقر على الزر أدناه لتأكيد تغيير بريدك الإلكتروني.", "ar") +
    primaryButton("تأكيد التغيير", safeLink, "ar") +
    securityNoticeBox(["ينتهي هذا الرابط خلال 24 ساعة.", "إذا لم تطلب هذا التغيير، تجاهل هذه الرسالة."], "ar"),
    { lang: "ar", preheaderText: "أكّد بريدك الإلكتروني الجديد", isSecurityEmail: true }
  )
  return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "button", label: "تأكيد التغيير", href: link }]) }
}

export function buildEmailChangedNoticeEmail(params: { fullName: string; newEmail: string }, lang: "ar" | "fr"): EmailTemplate {
  const safeName = escapeHtml(params.fullName)
  const resetLink = `${env.APP_BASE_URL}/forgot-password`
  if (lang === "fr") {
    const subject = `Votre adresse e-mail a été modifiée — ${APP_NAME}`
    const html = wrapLayout(
      heading("Adresse e-mail modifiée", "fr") +
      paragraph(`Bonjour <strong>${safeName}</strong>, l'adresse e-mail associée à votre compte a été modifiée.`, "fr") +
      securityNoticeBox([
        "Si c'est vous, aucune action n'est requise.",
        `Si ce n'est pas vous, <a href="${resetLink}" style="color:#854d0e">réinitialisez votre mot de passe immédiatement</a>.`,
      ], "fr"),
      { lang: "fr", preheaderText: "Votre adresse e-mail a été modifiée", isSecurityEmail: true }
    )
    return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "notice", lines: ["Si ce n'est pas vous: " + resetLink] }]) }
  }

  const subject = `تم تغيير بريدك الإلكتروني — ${APP_NAME}`
  const html = wrapLayout(
    heading("تم تغيير البريد الإلكتروني", "ar") +
    paragraph(`مرحباً <strong>${safeName}</strong>، تم تغيير البريد الإلكتروني المرتبط بحسابك.`, "ar") +
    securityNoticeBox([
      "إذا كنت أنت، لا حاجة لأي إجراء.",
      `إذا لم تكن أنت، <a href="${resetLink}" style="color:#854d0e">أعد تعيين كلمة مرورك فوراً</a>.`,
    ], "ar"),
    { lang: "ar", preheaderText: "تم تغيير بريدك الإلكتروني", isSecurityEmail: true }
  )
  return { subject, html, text: buildPlainText([{ type: "heading", text: subject }, { type: "notice", lines: ["إذا لم تكن أنت: " + resetLink] }]) }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MFA_ENABLED
// ═══════════════════════════════════════════════════════════════════════════════
export function buildMfaEnabledEmail(fullName: string, lang: "ar" | "fr"): EmailTemplate {
  const safeName = escapeHtml(fullName)
  const securityLink = `${env.APP_BASE_URL}/account/security`
  if (lang === "fr") {
    const subject = `Authentification à deux facteurs activée — ${APP_NAME}`
    const html = wrapLayout(
      heading("Authentification à deux facteurs activée", "fr") +
      paragraph(`Bonjour <strong>${safeName}</strong>, l'authentification à deux facteurs (TOTP) a été activée sur votre compte <strong>${escapeHtml(APP_NAME)}</strong>.`, "fr") +
      securityNoticeBox([
        "Toutes les autres sessions ont été déconnectées pour des raisons de sécurité.",
        "Conservez vos codes de récupération dans un endroit sûr.",
        `Si ce n'est pas vous, <a href="${securityLink}" style="color:#854d0e">accédez aux paramètres de sécurité</a> immédiatement.`,
      ], "fr"),
      { lang: "fr", preheaderText: "La double authentification est activée sur votre compte", isSecurityEmail: true }
    )
    return {
      subject,
      html,
      text: buildPlainText([
        { type: "heading", text: subject },
        { type: "paragraph", text: `Bonjour ${fullName}, la double authentification a été activée.` },
        { type: "notice", lines: ["Conservez vos codes de récupération en lieu sûr.", "Si ce n'est pas vous : " + securityLink] },
      ]),
    }
  }

  const subject = `تم تفعيل التحقق بخطوتين — ${APP_NAME}`
  const html = wrapLayout(
    heading("تم تفعيل التحقق بخطوتين", "ar") +
    paragraph(`مرحباً <strong>${safeName}</strong>، تم تفعيل التحقق بخطوتين (TOTP) على حسابك في منصة <strong>${escapeHtml(APP_NAME)}</strong>.`, "ar") +
    securityNoticeBox([
      "تم تسجيل خروج جميع الجلسات الأخرى لأسباب أمنية.",
      "احتفظ برموز الاسترداد في مكان آمن.",
      `إذا لم تكن أنت، <a href="${securityLink}" style="color:#854d0e">ادخل على إعدادات الأمان</a> فوراً.`,
    ], "ar"),
    { lang: "ar", preheaderText: "تم تفعيل التحقق بخطوتين على حسابك", isSecurityEmail: true }
  )
  return {
    subject,
    html,
    text: buildPlainText([
      { type: "heading", text: subject },
      { type: "paragraph", text: `مرحباً ${fullName}، تم تفعيل التحقق بخطوتين.` },
      { type: "notice", lines: ["احتفظ برموز الاسترداد في مكان آمن.", "إذا لم تكن أنت: " + securityLink] },
    ]),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MFA_DISABLED
// ═══════════════════════════════════════════════════════════════════════════════
export function buildMfaDisabledEmail(fullName: string, lang: "ar" | "fr"): EmailTemplate {
  const safeName = escapeHtml(fullName)
  const securityLink = `${env.APP_BASE_URL}/account/security`
  if (lang === "fr") {
    const subject = `Authentification à deux facteurs désactivée — ${APP_NAME}`
    const html = wrapLayout(
      heading("Authentification à deux facteurs désactivée", "fr") +
      paragraph(`Bonjour <strong>${safeName}</strong>, l'authentification à deux facteurs a été désactivée sur votre compte <strong>${escapeHtml(APP_NAME)}</strong>.`, "fr") +
      securityNoticeBox([
        "Toutes les sessions ont été déconnectées.",
        `Si ce n'est pas vous, <a href="${securityLink}" style="color:#854d0e">accédez aux paramètres de sécurité</a> immédiatement et changez votre mot de passe.`,
      ], "fr"),
      { lang: "fr", preheaderText: "La double authentification a été désactivée", isSecurityEmail: true }
    )
    return {
      subject,
      html,
      text: buildPlainText([
        { type: "heading", text: subject },
        { type: "paragraph", text: `Bonjour ${fullName}, la double authentification a été désactivée.` },
        { type: "notice", lines: ["Si ce n'est pas vous : " + securityLink] },
      ]),
    }
  }

  const subject = `تم تعطيل التحقق بخطوتين — ${APP_NAME}`
  const html = wrapLayout(
    heading("تم تعطيل التحقق بخطوتين", "ar") +
    paragraph(`مرحباً <strong>${safeName}</strong>، تم تعطيل التحقق بخطوتين على حسابك في منصة <strong>${escapeHtml(APP_NAME)}</strong>.`, "ar") +
    securityNoticeBox([
      "تم تسجيل خروج جميع الجلسات.",
      `إذا لم تكن أنت، <a href="${securityLink}" style="color:#854d0e">ادخل على إعدادات الأمان</a> فوراً وغيّر كلمة مرورك.`,
    ], "ar"),
    { lang: "ar", preheaderText: "تم تعطيل التحقق بخطوتين على حسابك", isSecurityEmail: true }
  )
  return {
    subject,
    html,
    text: buildPlainText([
      { type: "heading", text: subject },
      { type: "paragraph", text: `مرحباً ${fullName}، تم تعطيل التحقق بخطوتين.` },
      { type: "notice", lines: ["إذا لم تكن أنت: " + securityLink] },
    ]),
  }
}

