// src/pages/ForgotPasswordPage.jsx
import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Mail } from "lucide-react"
import { apiPost } from "../api/client"

export default function ForgotPasswordPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiPost("/auth/forgot-password", { email }, lang)
      setSubmitted(true)
    } catch {
      // Always show success — never reveal if account exists
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
          <Mail size={64} className="text-blue-500 mb-4 mx-auto" aria-hidden />
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{t("auth.checkInboxTitle")}</h1>
          <p className="text-gray-600 mb-6">{t("auth.forgotPasswordSent")}</p>
          <Link to="/login" className="text-blue-600 hover:underline text-sm">{t("auth.backToLogin")}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">{t("auth.forgotPassword")}</h1>
        <p className="text-sm text-gray-500 text-center mb-6">{t("auth.forgotPasswordHint")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              {t("auth.email")}
            </label>
            <input id="email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)} dir="ltr"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50">
            {loading ? t("common.loading") : t("auth.sendResetLink")}
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link to="/login" className="text-gray-500 hover:underline text-sm">{t("auth.backToLogin")}</Link>
        </p>
      </div>
    </div>
  )
}
