import { useTranslation } from "react-i18next"
import Layout from "../components/Layout"

const STEPS_AR = [
  { num: 1, title: "إنشاء حساب مريض", desc: "سجّل بهاتفك أو بريدك الإلكتروني في دقيقة واحدة." },
  { num: 2, title: "ابحث عن طبيب أو مؤسسة", desc: "استخدم البحث للعثور على طبيب متخصص أو مستشفى قريب منك في ولاية خنشلة." },
  { num: 3, title: "اختر موعداً متاحاً", desc: "اطّلع على المواعيد المتاحة واختر الوقت المناسب لك." },
  { num: 4, title: "أرسل طلب الموعد", desc: "أرسل طلبك وانتظر تأكيد الطبيب أو موظف الاستقبال." },
  { num: 5, title: "تلقّ تذكيراً", desc: "ستصلك رسالة تأكيد وتذكيرات قبل موعدك بـ 24 ساعة وساعتين." },
  { num: 6, title: "قيّم تجربتك", desc: "بعد اكتمال الزيارة يمكنك تقديم تقييم حقيقي للطبيب." },
]

const STEPS_FR = [
  { num: 1, title: "Créer un compte patient", desc: "Inscrivez-vous en une minute avec votre téléphone ou votre e-mail." },
  { num: 2, title: "Trouver un médecin ou un établissement", desc: "Utilisez la recherche pour trouver un spécialiste ou un hôpital proche de vous dans la wilaya de Khenchela." },
  { num: 3, title: "Choisir un créneau disponible", desc: "Consultez les créneaux disponibles et choisissez le moment qui vous convient." },
  { num: 4, title: "Envoyer une demande de rendez-vous", desc: "Soumettez votre demande et attendez la confirmation du médecin ou du personnel d'accueil." },
  { num: 5, title: "Recevoir un rappel", desc: "Vous recevrez une confirmation et des rappels 24 h et 2 h avant votre rendez-vous." },
  { num: 6, title: "Évaluer votre expérience", desc: "Après votre visite, vous pouvez laisser un avis authentique sur le médecin." },
]

export default function HowItWorksPage() {
  const { i18n } = useTranslation()
  const steps = i18n.language === "ar" ? STEPS_AR : STEPS_FR
  const title = i18n.language === "ar" ? "كيف تعمل المنصة؟" : "Comment ça marche ?"
  const subtitle = i18n.language === "ar"
    ? "خطوات بسيطة للحصول على رعاية صحية رقمية في ولاية خنشلة"
    : "Des étapes simples pour accéder aux soins de santé numériques dans la wilaya de Khenchela"

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">{title}</h1>
          <p className="text-gray-500">{subtitle}</p>
        </div>
        <div className="space-y-6">
          {steps.map((s) => (
            <div key={s.num} className="flex items-start gap-5 bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg">
                {s.num}
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">{s.title}</h3>
                <p className="text-gray-500 text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
