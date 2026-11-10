// src/pages/CheckInboxPage.jsx
// Shown after registration with email — tells user to check their inbox
import { useLocation, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { toast } from "sonner"
import { apiPost } from "../api/client"

export default function CheckInboxPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const location = useLocation()
  const email = location.state?.email ?? ""
  const [resending, setResending] = useState(false)
  const [sent, setSent] = useState(false)

  const resend = async () => {
    if (!email) return
    setResending(true)
    try {
      await apiPost("/auth/resend-verification", { email }, lang)
      setSent(true)
      toast.success(t("auth.verificationResent"))
    } catch {
      toast.error(t("auth.resendError"))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        <i className="bx bx-envelope text-6xl text-blue-500 mb-4"></i>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">{t("auth.checkInboxTitle")}</h1>
        <p className="text-gray-600 mb-2">{t("auth.checkInboxText")}</p>
        {email && (
          <p className="text-sm font-semibold text-gray-800 mb-6" dir="ltr">{email}</p>
        )}
        <p className="text-sm text-gray-500 mb-6">{t("auth.checkSpam")}</p>

        {!sent && email && (
          <button
            onClick={resend}
            disabled={resending}
            className="text-blue-600 hover:underline text-sm disabled:opacity-50"
          >
            {resending ? t("common.loading") : t("auth.resendVerification")}
          </button>
        )}
        {sent && (
          <p className="text-sm text-green-600">{t("auth.verificationResent")}</p>
        )}

        <div className="mt-8">
          <Link to="/login" className="text-gray-500 hover:underline text-sm">
            {t("auth.backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  )
}
