// src/pages/ForInstitutionsPage.jsx
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { apiPost } from "../api/client"
import Layout from "../components/Layout"

const WILAYAS = [
  "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi", "05 - Batna",
  "06 - Béjaïa", "07 - Biskra", "08 - Béchar", "09 - Blida", "10 - Bouira",
  "11 - Tamanrasset", "12 - Tébessa", "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou",
  "16 - Alger", "17 - Djelfa", "18 - Jijel", "19 - Sétif", "20 - Saïda",
  "21 - Skikda", "22 - Sidi Bel Abbès", "23 - Annaba", "24 - Guelma", "25 - Constantine",
  "26 - Médéa", "27 - Mostaganem", "28 - M'Sila", "29 - Mascara", "30 - Ouargla",
  "31 - Oran", "32 - El Bayadh", "33 - Illizi", "34 - Bordj Bou Arréridj", "35 - Boumerdès",
  "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued", "40 - Khenchela",
  "41 - Souk Ahras", "42 - Tipaza", "43 - Mila", "44 - Aïn Defla", "45 - Naâma",
  "46 - Aïn Témouchent", "47 - Ghardaïa", "48 - Relizane",
]

export default function ForInstitutionsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"

  const [form, setForm] = useState({
    institutionName: "",
    contactPerson: "",
    phone: "",
    email: "",
    wilaya: "",
    message: "",
    website: "", // honeypot
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.website) {
      setSuccess(true)
      return
    }

    setLoading(true)
    try {
      const body = `${t("forInstitutions.form.institutionName")}: ${form.institutionName}\n` +
        `${t("forInstitutions.form.contactPerson")}: ${form.contactPerson}\n` +
        `${t("forInstitutions.form.wilaya")}: ${form.wilaya}\n\n` +
        form.message

      await apiPost("/contact", {
        fullName: form.contactPerson,
        email: form.email,
        phone: form.phone || undefined,
        message: body.trim(),
        type: "INSTITUTION_REQUEST",
        website: form.website,
      }, lang)
      setSuccess(true)
    } catch (err) {
      setError(err.message ?? t("common.loadError"))
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    { key: "appointments" },
    { key: "notifications" },
    { key: "directory" },
  ]

  if (success) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-xl text-center">
          <div className="bg-green-50 border border-green-200 rounded-xl p-8">
            <i className="bx bx-check-circle text-5xl text-green-500 mb-4"></i>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{t("contact.successTitle")}</h2>
            <p className="text-gray-600">{t("contact.successDesc")}</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Hero */}
        <section className="mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">{t("forInstitutions.title")}</h1>
          <p className="text-gray-600 leading-relaxed">{t("forInstitutions.intro")}</p>
        </section>

        {/* Admin-only notice */}
        <section className="mb-10 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex gap-3">
            <i className="bx bx-info-circle text-2xl text-blue-500 flex-shrink-0 mt-0.5"></i>
            <p className="text-gray-700">{t("forInstitutions.adminOnlyNotice")}</p>
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t("forInstitutions.whyTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-2">{t(`forInstitutions.benefits.${b.key}.title`)}</h3>
                <p className="text-sm text-gray-600">{t(`forInstitutions.benefits.${b.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Request form */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">{t("forInstitutions.form.title")}</h2>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("forInstitutions.form.institutionName")} *
                </label>
                <input
                  id="institutionName"
                  name="institutionName"
                  type="text"
                  required
                  value={form.institutionName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("forInstitutions.form.contactPerson")} *
                </label>
                <input
                  id="contactPerson"
                  name="contactPerson"
                  type="text"
                  required
                  value={form.contactPerson}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contact.phone")} *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  dir="ltr"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contact.email")} *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  dir="ltr"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="wilaya" className="block text-sm font-medium text-gray-700 mb-1">
                {t("forInstitutions.form.wilaya")} *
              </label>
              <select
                id="wilaya"
                name="wilaya"
                required
                value={form.wilaya}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">{t("forInstitutions.form.selectWilaya")}</option>
                {WILAYAS.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                {t("contact.message")} <span className="text-gray-400">({t("common.optional")})</span>
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                maxLength={1000}
                value={form.message}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
            </div>

            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <input
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={handleChange}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? t("common.loading") : t("forInstitutions.form.submit")}
            </button>
          </form>
        </section>
      </div>
    </Layout>
  )
}
