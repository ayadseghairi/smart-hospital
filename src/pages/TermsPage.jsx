// src/pages/TermsPage.jsx
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function TermsPage() {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language !== "fr"

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
            <i className="bx bx-arrow-back"></i>
            {t("nav.backHome")}
          </Link>
          <h1 className="text-xl font-bold text-gray-800">
            {isAr ? "شروط الاستخدام" : "Conditions d'utilisation"}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow p-8 space-y-6 text-gray-700 leading-relaxed">
          {isAr ? (
            <>
              <p className="text-sm text-gray-500">آخر تحديث: يناير 2025</p>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">1. القبول</h2>
                <p>باستخدامك لمنصة دلين الصحية الذكية، فإنك توافق على هذه الشروط. إن لم توافق، يُرجى التوقف عن استخدام المنصة.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">2. الخدمة</h2>
                <p>توفر المنصة خدمات حجز المواعيد الطبية والبحث عن المؤسسات الصحية في ولاية خنشلة، الجزائر. لا تُعدّ المنصة مزوداً للرعاية الصحية ولا تحل محل الطبيب.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">3. المواعيد</h2>
                <p>طلبات الحجز تستلزم تأكيداً من الطبيب أو المؤسسة الصحية. المنصة غير مسؤولة عن أي إلغاء أو تأخير من طرف مزود الخدمة.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">4. المسؤولية</h2>
                <p>المعلومات المقدمة للأغراض الإرشادية فقط. لا تُشكّل نصيحة طبية. المنصة غير مسؤولة عن القرارات الطبية المتخذة بناءً على محتواها.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">5. حذف الحساب</h2>
                <p>يمكنك طلب حذف حسابك وبياناتك في أي وقت من خلال إعدادات الحساب. قد تُحتفظ ببعض البيانات للامتثال للمتطلبات القانونية.</p>
              </section>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">Dernière mise à jour : janvier 2025</p>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">1. Acceptation</h2>
                <p>En utilisant Delin Smart Care, vous acceptez ces conditions. Si vous n'êtes pas d'accord, veuillez cesser d'utiliser la plateforme.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">2. Service</h2>
                <p>La plateforme propose des services de prise de rendez-vous médicaux et de recherche d'établissements de santé dans la wilaya de Khenchela, Algérie. Elle ne fournit pas de soins de santé et ne remplace pas un médecin.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">3. Rendez-vous</h2>
                <p>Les demandes de rendez-vous nécessitent une confirmation du médecin ou de l'établissement. La plateforme n'est pas responsable des annulations ou retards de la part des prestataires.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">4. Responsabilité</h2>
                <p>Les informations fournies sont à titre indicatif uniquement et ne constituent pas un avis médical. La plateforme n'est pas responsable des décisions médicales prises sur la base de son contenu.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">5. Suppression du compte</h2>
                <p>Vous pouvez demander la suppression de votre compte et de vos données à tout moment depuis les paramètres de votre compte. Certaines données peuvent être conservées pour des raisons légales.</p>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
