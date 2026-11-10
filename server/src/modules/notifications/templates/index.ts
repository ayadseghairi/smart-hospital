// server/src/modules/notifications/templates/index.ts
// Email templates — inline styles, dir="rtl" for Arabic, plain-text fallback.
// Privacy: never include medical reasons, symptoms or diagnoses.
import { env } from "../../../config/env"

const APP_NAME = env.APP_NAME
const FOOTER_AR = `<p style="color:#666;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px;">
  هذا البريد أُرسل تلقائياً من منصة ${APP_NAME}. يرجى عدم الرد عليه.
  <br><a href="${env.APP_BASE_URL}/settings/notifications">إدارة إعدادات الإشعارات</a>
</p>`

const FOOTER_FR = `<p style="color:#666;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px;">
  Ce message a été envoyé automatiquement par ${APP_NAME}. Merci de ne pas y répondre.
  <br><a href="${env.APP_BASE_URL}/settings/notifications">Gérer vos préférences de notifications</a>
</p>`

function wrapHtml(content: string, dir: "rtl" | "ltr"): string {
  return `<!DOCTYPE html>
<html dir="${dir}" lang="${dir === "rtl" ? "ar" : "fr"}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:24px;background:#f7f8fa">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px;border:1px solid #e5e7eb">
${content}
${dir === "rtl" ? FOOTER_AR : FOOTER_FR}
</div>
</body>
</html>`
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export function buildVerifyEmailEmail(link: string, lang: "ar" | "fr"): EmailTemplate {
  if (lang === "fr") {
    return {
      subject: `Vérifiez votre adresse e-mail — ${APP_NAME}`,
      html: wrapHtml(
        `<h2 style="color:#1f2328">Vérifiez votre adresse e-mail</h2>
         <p>Merci de vous être inscrit sur <strong>${APP_NAME}</strong>.</p>
         <p>Cliquez sur le bouton ci-dessous pour vérifier votre adresse e-mail :</p>
         <p><a href="${link}" style="display:inline-block;background:#3b82d4;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Vérifier mon adresse e-mail</a></p>
         <p style="color:#666;font-size:13px">Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez ce message.</p>`,
        "ltr"
      ),
      text: `Vérifiez votre adresse e-mail — ${APP_NAME}\n\nCliquez sur ce lien : ${link}\n\nCe lien expire dans 24 heures.`,
    }
  }

  return {
    subject: `تأكيد البريد الإلكتروني — ${APP_NAME}`,
    html: wrapHtml(
      `<h2 style="color:#1f2328">تأكيد البريد الإلكتروني</h2>
       <p>شكراً لتسجيلك في منصة <strong>${APP_NAME}</strong>.</p>
       <p>انقر على الزر أدناه لتأكيد بريدك الإلكتروني:</p>
       <p><a href="${link}" style="display:inline-block;background:#3b82d4;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">تأكيد البريد الإلكتروني</a></p>
       <p style="color:#666;font-size:13px">ينتهي هذا الرابط خلال 24 ساعة. إذا لم تنشئ حساباً، يمكنك تجاهل هذه الرسالة.</p>`,
      "rtl"
    ),
    text: `تأكيد البريد الإلكتروني — ${APP_NAME}\n\nانقر على هذا الرابط: ${link}\n\nينتهي الرابط خلال 24 ساعة.`,
  }
}

export function buildPasswordResetEmail(link: string, lang: "ar" | "fr"): EmailTemplate {
  if (lang === "fr") {
    return {
      subject: `Réinitialisation du mot de passe — ${APP_NAME}`,
      html: wrapHtml(
        `<h2 style="color:#1f2328">Réinitialisation du mot de passe</h2>
         <p>Vous avez demandé à réinitialiser votre mot de passe sur <strong>${APP_NAME}</strong>.</p>
         <p><a href="${link}" style="display:inline-block;background:#3b82d4;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Réinitialiser mon mot de passe</a></p>
         <p style="color:#666;font-size:13px">Ce lien expire dans 60 minutes. Si vous n'avez pas fait cette demande, ignorez ce message.</p>`,
        "ltr"
      ),
      text: `Réinitialisation du mot de passe — ${APP_NAME}\n\nLien : ${link}\n\nExpire dans 60 minutes.`,
    }
  }

  return {
    subject: `إعادة تعيين كلمة المرور — ${APP_NAME}`,
    html: wrapHtml(
      `<h2 style="color:#1f2328">إعادة تعيين كلمة المرور</h2>
       <p>طلبت إعادة تعيين كلمة المرور لحسابك في منصة <strong>${APP_NAME}</strong>.</p>
       <p><a href="${link}" style="display:inline-block;background:#3b82d4;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">إعادة تعيين كلمة المرور</a></p>
       <p style="color:#666;font-size:13px">ينتهي هذا الرابط خلال 60 دقيقة. إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.</p>`,
      "rtl"
    ),
    text: `إعادة تعيين كلمة المرور — ${APP_NAME}\n\nالرابط: ${link}\n\nينتهي خلال 60 دقيقة.`,
  }
}

export function buildInviteEmail(link: string, fullName: string, lang: "ar" | "fr"): EmailTemplate {
  const ttl = "48"
  if (lang === "fr") {
    return {
      subject: `Invitation à rejoindre ${APP_NAME}`,
      html: wrapHtml(
        `<h2 style="color:#1f2328">Invitation à rejoindre ${APP_NAME}</h2>
         <p>Bonjour <strong>${fullName}</strong>,</p>
         <p>Vous avez été invité(e) à rejoindre la plateforme <strong>${APP_NAME}</strong>.</p>
         <p>Cliquez sur le bouton ci-dessous pour créer votre mot de passe et activer votre compte :</p>
         <p><a href="${link}" style="display:inline-block;background:#3b82d4;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Activer mon compte</a></p>
         <p style="color:#666;font-size:13px">Ce lien expire dans ${ttl} heures.</p>`,
        "ltr"
      ),
      text: `Invitation — ${APP_NAME}\n\nBonjour ${fullName},\n\nActivez votre compte : ${link}\n\nExpire dans ${ttl} heures.`,
    }
  }

  return {
    subject: `دعوة للانضمام إلى منصة ${APP_NAME}`,
    html: wrapHtml(
      `<h2 style="color:#1f2328">دعوة للانضمام إلى المنصة</h2>
       <p>مرحباً <strong>${fullName}</strong>،</p>
       <p>تمت دعوتك للانضمام إلى منصة <strong>${APP_NAME}</strong>.</p>
       <p>انقر على الزر أدناه لإنشاء كلمة المرور وتفعيل حسابك:</p>
       <p><a href="${link}" style="display:inline-block;background:#3b82d4;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">تفعيل الحساب</a></p>
       <p style="color:#666;font-size:13px">ينتهي هذا الرابط خلال ${ttl} ساعة.</p>`,
      "rtl"
    ),
    text: `دعوة للانضمام — ${APP_NAME}\n\nمرحباً ${fullName}،\n\nفعّل حسابك عبر: ${link}\n\nينتهي خلال ${ttl} ساعة.`,
  }
}

export function buildAppointmentReminderEmail(
  params: { doctorName: string; institutionName: string; startsAt: Date },
  lang: "ar" | "fr"
): EmailTemplate {
  // Privacy: no medical reason, no diagnosis
  const dateStr = params.startsAt.toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-FR", {
    timeZone: "Africa/Algiers",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  const timeStr = params.startsAt.toLocaleTimeString(lang === "ar" ? "ar-DZ" : "fr-FR", {
    timeZone: "Africa/Algiers",
    hour: "2-digit",
    minute: "2-digit",
  })

  if (lang === "fr") {
    return {
      subject: `Rappel de rendez-vous — ${APP_NAME}`,
      html: wrapHtml(
        `<h2 style="color:#1f2328">Rappel de rendez-vous</h2>
         <p>Vous avez un rendez-vous avec <strong>${params.doctorName}</strong> à <strong>${params.institutionName}</strong>.</p>
         <p>📅 <strong>${dateStr}</strong> à <strong>${timeStr}</strong> (heure d'Algérie)</p>
         <p><a href="${env.APP_BASE_URL}/appointments" style="color:#3b82d4">Voir mes rendez-vous</a></p>`,
        "ltr"
      ),
      text: `Rappel de rendez-vous\n\nDr. ${params.doctorName} — ${params.institutionName}\n${dateStr} à ${timeStr}\n\nVoir: ${env.APP_BASE_URL}/appointments`,
    }
  }

  return {
    subject: `تذكير بموعدك — ${APP_NAME}`,
    html: wrapHtml(
      `<h2 style="color:#1f2328">تذكير بموعدك</h2>
       <p>لديك موعد مع <strong>${params.doctorName}</strong> في <strong>${params.institutionName}</strong>.</p>
       <p>📅 <strong>${dateStr}</strong> الساعة <strong>${timeStr}</strong> (توقيت الجزائر)</p>
       <p><a href="${env.APP_BASE_URL}/appointments" style="color:#3b82d4">عرض مواعيدي</a></p>`,
      "rtl"
    ),
    text: `تذكير بموعدك\n\nد. ${params.doctorName} — ${params.institutionName}\n${dateStr} الساعة ${timeStr}\n\nرابط: ${env.APP_BASE_URL}/appointments`,
  }
}
