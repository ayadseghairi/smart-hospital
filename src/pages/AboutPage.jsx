// src/pages/AboutPage.jsx
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Layout from "../components/Layout"

export default function AboutPage() {
  const { t } = useTranslation()

  const values = [
    { key: "realData", icon: "bx-data" },
    { key: "patientFirst", icon: "bx-heart" },
    { key: "privacy", icon: "bx-shield-check" },
  ]

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Hero */}
        <section className="mb-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img src="/logo.jpg" alt={t("brand.logoAlt")} className="w-16 h-16 rounded-full object-cover shadow-md" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{t("brand.nameAr")}</h1>
              <p className="text-gray-500">{t("brand.tagline")}</p>
            </div>
          </div>
          <p className="text-base text-gray-700 leading-relaxed">{t("about.mission")}</p>
        </section>

        {/* Values */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t("about.valuesTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v) => (
              <div key={v.key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                <i className={`bx ${v.icon} text-4xl text-blue-500 mb-3`}></i>
                <h3 className="font-semibold text-gray-800 mb-2">{t(`about.values.${v.key}.title`)}</h3>
                <p className="text-sm text-gray-600">{t(`about.values.${v.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-50 rounded-xl p-8 text-center border border-blue-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t("about.ctaTitle")}</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t("about.contactUs")}
            </Link>
            <Link
              to="/for-institutions"
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              {t("about.partnerWithUs")}
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  )
}
