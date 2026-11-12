// src/pages/PrivacyPage.jsx
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function PrivacyPage() {
  const { t, i18n } = useTranslation()
  const isAr = i18n.language !== "fr"
  const BackIcon = isAr ? ArrowRight : ArrowLeft

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-blue-600 hover:underline text-sm flex items-center gap-1 min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded">
            <BackIcon size={16} aria-hidden />
            {t("nav.backHome")}
          </Link>
          <h1 className="text-xl font-bold text-gray-800">
            {isAr ? "سياسة الخصوصية" : "Politique de confidentialité"}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow p-8 space-y-6 text-gray-700 leading-relaxed">
          {isAr ? (
            <>
              <p className="text-sm text-gray-500">آخر تحديث: يناير 2025</p>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">1. مقدمة</h2>
                <p>منصة دلين الصحية الذكية ملتزمة بحماية بياناتك الشخصية وفقاً للقانون الجزائري رقم 18-07 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">2. البيانات التي نجمعها</h2>
                <ul className="list-disc ps-5 space-y-1 text-sm">
                  <li>بيانات الهوية: الاسم الكامل، رقم الهاتف، البريد الإلكتروني.</li>
                  <li>بيانات المواعيد: التاريخ، الوقت، اسم الطبيب، المؤسسة الصحية.</li>
                  <li>لا نجمع أي سجلات طبية أو تشخيصات أو وصفات دوائية.</li>
                </ul>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">3. استخدام البيانات</h2>
                <p>تُستخدم بياناتك حصراً لتقديم خدمات المنصة (حجز المواعيد، الإشعارات، إدارة الحساب). لا تُباع بياناتك ولا تُشارك مع أطراف ثالثة لأغراض تجارية.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">4. حقوقك</h2>
                <p>يحق لك الوصول إلى بياناتك وتصحيحها وحذفها وتصديرها في أي وقت من خلال إعدادات حسابك أو عبر التواصل معنا.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">5. الاستضافة والأمان</h2>
                <p>تُخزَّن البيانات على خوادم آمنة. نوصي باستضافة البيانات داخل الجزائر تماشياً مع المتطلبات القانونية. يرجى التواصل مع مستشار قانوني متخصص قبل الإطلاق.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">6. التواصل</h2>
                <p>لأي استفسار أو طلب متعلق بياناتك، تواصل معنا عبر البريد الإلكتروني المذكور في صفحة التواصل.</p>
              </section>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">Dernière mise à jour : janvier 2025</p>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">1. Introduction</h2>
                <p>Delin Smart Care s'engage à protéger vos données personnelles conformément à la loi algérienne n° 18-07 relative à la protection des personnes physiques dans le traitement des données à caractère personnel.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">2. Données collectées</h2>
                <ul className="list-disc ps-5 space-y-1 text-sm">
                  <li>Données d'identité : nom complet, numéro de téléphone, adresse e-mail.</li>
                  <li>Données de rendez-vous : date, heure, nom du médecin, établissement de santé.</li>
                  <li>Nous ne collectons aucun dossier médical, diagnostic ou ordonnance.</li>
                </ul>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">3. Utilisation des données</h2>
                <p>Vos données sont utilisées uniquement pour fournir les services de la plateforme (prise de rendez-vous, notifications, gestion du compte). Elles ne sont ni vendues ni partagées à des fins commerciales.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">4. Vos droits</h2>
                <p>Vous pouvez accéder, corriger, supprimer et exporter vos données à tout moment depuis les paramètres de votre compte ou en nous contactant.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">5. Hébergement et sécurité</h2>
                <p>Les données sont stockées sur des serveurs sécurisés. Nous recommandons un hébergement en Algérie conformément aux exigences légales. Consultez un conseiller juridique spécialisé avant le lancement.</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">6. Contact</h2>
                <p>Pour toute question ou demande concernant vos données, contactez-nous via l'adresse e-mail indiquée sur la page de contact.</p>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
