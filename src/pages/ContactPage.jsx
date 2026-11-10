// src/pages/ContactPage.jsx
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { apiPost } from "../api/client"
import Layout from "../components/Layout"

export default function ContactPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
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

    // Honeypot: if filled, silently pretend success
    if (form.website) {
      setSuccess(true)
      return
    }

    setLoading(true)
    try {
      await apiPost("/contact", {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || undefined,
        message: form.message,
        type: "GENERAL",
        website: form.website,
      }, lang)
      setSuccess(true)
    } catch (err) {
      setError(err.message ?? t("common.loadError"))
    } finally {
      setLoading(false)
    }
  }

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
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("contact.title")}</h1>
        <p className="text-gray-500 mb-8">{t("contact.subtitle")}</p>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5" noValidate>
          {/* Full name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              {t("contact.fullName")} *
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={form.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Email */}
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

          {/* Phone (optional) */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              {t("contact.phone")} <span className="text-gray-400">({t("common.optional")})</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              dir="ltr"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              {t("contact.message")} *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              maxLength={1000}
              value={form.message}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            />
            <p className="text-xs text-gray-400 text-end mt-1">{form.message.length}/1000</p>
          </div>

          {/* Honeypot — hidden from real users */}
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
            {loading ? t("common.loading") : t("contact.submit")}
          </button>
        </form>
      </div>
    </Layout>
  )
}
