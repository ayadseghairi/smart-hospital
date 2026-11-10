import { useState } from "react"
import { useTranslation } from "react-i18next"
import Layout from "../components/Layout"

const FAQ_AR = [
  {
    q: "هل يمكنني استخدام المنصة بدون تسجيل؟",
    a: "يمكنك تصفح قائمة المؤسسات الصحية والأطباء بدون تسجيل. أما لحجز موعد فيجب إنشاء حساب مريض وتأكيد بريدك الإلكتروني.",
  },
  {
    q: "كيف أحجز موعداً؟",
    a: "ابحث عن طبيب أو مؤسسة صحية، اختر موعداً متاحاً، ثم أرسل طلبك. سيقوم الطبيب أو موظف المؤسسة بتأكيد الموعد أو الرفض.",
  },
  {
    q: "هل الحجز مؤكد مباشرة؟",
    a: "لا. الموعد يكون في حالة «انتظار التأكيد» حتى يقبله الطبيب أو موظف المؤسسة. ستتلقى إشعاراً عبر البريد الإلكتروني عند التأكيد.",
  },
  {
    q: "كيف أُلغي موعداً؟",
    a: "انتقل إلى «مواعيدي» في حسابك وانقر على «إلغاء الموعد». يُرجى الإلغاء قبل وقت كافٍ من موعدك.",
  },
  {
    q: "هل البيانات الطبية الخاصة بي آمنة؟",
    a: "لا نخزّن أي سجلات طبية أو تشخيصات. البيانات المحفوظة تقتصر على معلومات الاتصال وتفاصيل المواعيد. اطّلع على سياسة الخصوصية لمزيد من التفاصيل.",
  },
  {
    q: "كيف يمكن للطبيب أو المؤسسة الانضمام للمنصة؟",
    a: "حسابات الأطباء والمؤسسات تُنشأ فقط من قِبل مسؤول المنصة. يمكنك التواصل معنا عبر صفحة «انضمام المؤسسات» لطلب الانضمام.",
  },
]

const FAQ_FR = [
  {
    q: "Puis-je utiliser la plateforme sans m'inscrire ?",
    a: "Vous pouvez consulter la liste des établissements et des médecins sans inscription. Pour prendre rendez-vous, vous devez créer un compte patient et vérifier votre adresse e-mail.",
  },
  {
    q: "Comment prendre rendez-vous ?",
    a: "Recherchez un médecin ou un établissement, choisissez un créneau disponible, puis soumettez votre demande. Le médecin ou le personnel de l'établissement confirmera ou refusera le rendez-vous.",
  },
  {
    q: "La réservation est-elle confirmée immédiatement ?",
    a: "Non. Le rendez-vous reste en attente de confirmation jusqu'à ce qu'il soit accepté. Vous recevrez une notification par e-mail à la confirmation.",
  },
  {
    q: "Comment annuler un rendez-vous ?",
    a: "Accédez à «Mes rendez-vous» dans votre compte et cliquez sur «Annuler le rendez-vous». Veuillez annuler suffisamment à l'avance.",
  },
  {
    q: "Mes données médicales sont-elles en sécurité ?",
    a: "Nous ne stockons aucun dossier médical ni diagnostic. Les données conservées se limitent aux informations de contact et aux détails des rendez-vous. Consultez notre politique de confidentialité pour plus de détails.",
  },
  {
    q: "Comment un médecin ou un établissement peut-il rejoindre la plateforme ?",
    a: "Les comptes médecins et établissements sont créés uniquement par l'administrateur. Contactez-nous via la page «Rejoindre la plateforme» pour soumettre votre demande.",
  },
]

export default function FaqPage() {
  const { i18n } = useTranslation()
  const faq = i18n.language === "ar" ? FAQ_AR : FAQ_FR
  const title = i18n.language === "ar" ? "الأسئلة الشائعة" : "Foire aux questions"
  const [open, setOpen] = useState(null)

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-10">{title}</h1>
        <div className="space-y-3">
          {faq.map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                className="w-full text-start px-6 py-4 font-medium text-gray-800 flex items-center justify-between hover:bg-gray-50"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{item.q}</span>
                <span className="text-gray-400 text-lg">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
