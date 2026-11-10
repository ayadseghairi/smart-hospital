// src/pages/RegisterPage.jsx — patient self-registration only
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { apiPost } from "../api/client"

export default function RegisterPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = i18n.language === "fr" ? "fr" : "ar"

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    consentAccepted: false,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error(t("auth.passwordMismatch"))
      return
    }
    if (!form.consentAccepted) {
      toast.error(t("auth.consentRequired"))
      return
    }
    if (!form.phone && !form.email) {
      toast.error(t("auth.phoneOrEmailRequired"))
      return
    }

    setLoading(true)
    try {
      await apiPost("/auth/register", {
        fullName: form.fullName,
        ...(form.phone ? { phone: form.phone } : {}),
        ...(form.email ? { email: form.email } : {}),
        password: form.password,
        preferredLang: lang,
        consentAccepted: true,
      }, lang)
      navigate("/check-inbox", { state: { email: form.email } })
    } catch (err) {
      if (err.status === 409) {
        toast.error(t("auth.accountExists"))
      } else {
        toast.error(t("auth.registerError"))
      }
    } finally {
      setLoading(false)
    }
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm({ ...form, [key]: e.target.value }),
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">{t("auth.createPatientAccount")}</h1>
        <p className="text-sm text-gray-500 text-center mb-6">{t("auth.patientOnlyNotice")}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
              {t("auth.fullName")} *
            </label>
            <input id="fullName" type="text" required {...field("fullName")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
              {t("auth.phone")}
            </label>
            <input id="phone" type="tel" {...field("phone")} dir="ltr"
              placeholder="07xxxxxxxx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              {t("auth.email")}
            </label>
            <input id="email" type="email" {...field("email")} dir="ltr"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            <p className="text-xs text-gray-500 mt-1">{t("auth.emailRequiredForBooking")}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              {t("auth.password")} *
            </label>
            <input id="password" type="password" required autoComplete="new-password" {...field("password")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
              {t("auth.confirmPassword")} *
            </label>
            <input id="confirmPassword" type="password" required autoComplete="new-password" {...field("confirmPassword")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.consentAccepted}
              onChange={(e) => setForm({ ...form, consentAccepted: e.target.checked })}
              className="mt-1"
            />
            <span className="text-sm text-gray-600">
              {t("auth.consentText")}{" "}
              <Link to="/privacy" className="text-blue-600 hover:underline">{t("auth.privacyPolicy")}</Link>
              {" "}{t("auth.and")}{" "}
              <Link to="/terms" className="text-blue-600 hover:underline">{t("auth.terms")}</Link>.
            </span>
          </label>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50">
            {loading ? t("common.loading") : t("auth.registerButton")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t("auth.haveAccount")}{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-semibold">{t("auth.login")}</Link>
        </p>
      </div>
    </div>
  )
}
