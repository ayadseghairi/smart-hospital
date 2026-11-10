// server/src/modules/assistant/engine.ts
// Rule-based assistant engine — designed to be swappable with an LLM later.
// NEVER diagnose or recommend medications.

export interface AssistantReply {
  text: string
  showEmergency: boolean
  suggestions?: string[]
  lang: "ar" | "fr"
}

// Danger keywords that trigger immediate emergency display
const DANGER_KEYWORDS_AR = [
  "ألم في الصدر", "نزيف شديد", "فقدان الوعي", "صعوبة تنفس", "خنق", "تسمم",
  "احتشاء", "جلطة", "سكتة", "غرق", "انتحار", "توقف القلب",
]
const DANGER_KEYWORDS_FR = [
  "douleur thoracique", "hémorragie", "perte de conscience", "difficulté respiratoire",
  "étouffement", "intoxication", "infarctus", "avc", "crise cardiaque", "noyade",
]

// Symptom → specialty mapping
const SYMPTOM_SPECIALTY: Array<{ keywords: string[]; specialtySlug: string }> = [
  { keywords: ["قلب", "صدر", "cœur", "cardiaque"], specialtySlug: "cardiology" },
  { keywords: ["جلد", "بشرة", "peau", "dermatologie"], specialtySlug: "dermatology" },
  { keywords: ["عين", "نظر", "vue", "yeux", "ophtalmologie"], specialtySlug: "ophthalmology" },
  { keywords: ["أسنان", "فم", "dents", "dentaire"], specialtySlug: "dentistry" },
  { keywords: ["أطفال", "رضيع", "enfant", "pédiatrie"], specialtySlug: "pediatrics" },
  { keywords: ["عظام", "كسر", "os", "fracture", "orthopédie"], specialtySlug: "orthopedics" },
  { keywords: ["أعصاب", "صداع", "neurologie", "migraine"], specialtySlug: "neurology" },
  { keywords: ["نساء", "حمل", "grossesse", "gynécologie"], specialtySlug: "gynecology" },
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u064B-\u065F]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
}

export function reply(message: string, lang: "ar" | "fr"): AssistantReply {
  const norm = normalize(message)
  const isAr = lang === "ar"

  // Check for danger keywords first
  const dangerKeywords = isAr ? DANGER_KEYWORDS_AR : DANGER_KEYWORDS_FR
  const isDanger = dangerKeywords.some((kw) => norm.includes(normalize(kw)))
  if (isDanger) {
    return {
      text: isAr
        ? "⚠️ هذه حالة طارئة. يرجى الاتصال فوراً بالإسعاف أو التوجه لأقرب مستشفى.\n\nالمساعد لا يُعوّض الطبيب."
        : "⚠️ Ceci est une urgence médicale. Appelez le SAMU ou rendez-vous aux urgences immédiatement.\n\nCet assistant ne remplace pas un médecin.",
      showEmergency: true,
      lang,
    }
  }

  // Check for specialty hints
  for (const { keywords, specialtySlug } of SYMPTOM_SPECIALTY) {
    if (keywords.some((kw) => norm.includes(normalize(kw)))) {
      return {
        text: isAr
          ? `بناءً على ما ذكرت، قد تحتاج إلى استشارة طبيب متخصص في هذا المجال. يرجى حجز موعد مع طبيب متخصص.\n\nالمساعد لا يُشخّص ولا يوصي بأدوية.`
          : `D'après votre description, vous pourriez avoir besoin d'un médecin spécialisé. Prenez rendez-vous avec un spécialiste.\n\nCet assistant ne diagnostique pas et ne recommande pas de médicaments.`,
        showEmergency: false,
        suggestions: isAr
          ? ["عرض الأطباء المتاحين", "حجز موعد"]
          : ["Voir les médecins disponibles", "Prendre rendez-vous"],
        lang,
      }
    }
  }

  // Booking intent
  if (
    norm.includes("حجز") || norm.includes("موعد") ||
    norm.includes("réserver") || norm.includes("rendez-vous")
  ) {
    return {
      text: isAr
        ? "لحجز موعد، توجّه إلى صفحة الطبيب أو المؤسسة الصحية واختر وقتاً مناسباً.\n\nالمساعد لا يُعوّض الطبيب."
        : "Pour prendre rendez-vous, accédez à la page du médecin ou de l'établissement et choisissez un créneau.\n\nCet assistant ne remplace pas un médecin.",
      showEmergency: false,
      suggestions: isAr ? ["بحث عن طبيب", "قائمة المؤسسات"] : ["Chercher un médecin", "Établissements"],
      lang,
    }
  }

  // Fallback — honest "I don't understand"
  return {
    text: isAr
      ? "عذراً، لم أفهم سؤالك بشكل كافٍ. يمكنك السؤال عن: حجز موعد، أقرب مستشفى، الخدمات المتاحة، أو التواصل مع طبيب.\n\nالمساعد لا يُعوّض الطبيب."
      : "Désolé, je n'ai pas bien compris. Vous pouvez me demander : prendre un rendez-vous, hôpital le plus proche, services disponibles, contacter un médecin.\n\nCet assistant ne remplace pas un médecin.",
    showEmergency: false,
    suggestions: isAr
      ? ["كيف أحجز موعد؟", "أقرب مستشفى", "الخدمات المتاحة"]
      : ["Comment prendre RDV ?", "Hôpital le plus proche", "Services disponibles"],
    lang,
  }
}
