// src/pages/ResetPasswordPage.jsx
import { useState } from "react"
import { useSearchParams, useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { apiPost } from "../api/client"

export default function ResetPasswordPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const [params] = useSearchParams()
  const token = params.get("token")
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: "", confirm: "" })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      toast.error(t("auth.passwordMismatch"))
      return
    }
    if (!token) {
      toast.error(t("auth.invalidToken"))
      return
    }
    setLoading(true)
    try {
      await apiPost("/auth/reset-password", { token, newPassword: form.password }, lang)
      toast.success(t("auth.passwordResetSuccess"))
      navigate("/login")
    } catch {
      toast.error(t("auth.resetPasswordError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">{t("auth.resetPassword")}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              {t("auth.newPassword")}
            </label>
            <input id="password" type="password" required autoComplete="new-password"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm">
              {t("auth.confirmPassword")}
            </label>
            <input id="confirm" type="password" required autoComplete="new-password"
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50">
            {loading ? t("common.loading") : t("auth.resetPasswordButton")}
          </button>
        </form>
        <p className="mt-6 text-center">
          <Link to="/login" className="text-gray-500 hover:underline text-sm">{t("auth.backToLogin")}</Link>
        </p>
      </div>
    </div>
  )
}
