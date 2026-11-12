// src/pages/VerifyEmailPage.jsx
// Handles the /verify-email?token=... link from the email
import { useEffect, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { apiPost } from "../api/client"

export default function VerifyEmailPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const [params] = useSearchParams()
  const token = params.get("token")

  const [status, setStatus] = useState("loading") // loading | success | error

  useEffect(() => {
    if (!token) {
      setStatus("error")
      return
    }
    apiPost("/auth/verify-email", { token }, lang)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"))
  }, [token, lang])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <Loader2 size={48} className="text-blue-500 animate-spin mb-4 mx-auto" aria-hidden />
            <p className="text-gray-600">{t("auth.verifyingEmail")}</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 size={64} className="text-green-500 mb-4 mx-auto" aria-hidden />
            <h1 className="text-2xl font-bold text-gray-800 mb-3">{t("auth.emailVerified")}</h1>
            <p className="text-gray-600 mb-6">{t("auth.emailVerifiedText")}</p>
            <Link to="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block font-semibold">
              {t("auth.loginButton")}
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={64} className="text-red-500 mb-4 mx-auto" aria-hidden />
            <h1 className="text-2xl font-bold text-gray-800 mb-3">{t("auth.verifyEmailError")}</h1>
            <p className="text-gray-600 mb-6">{t("auth.verifyEmailErrorText")}</p>
            <Link to="/login" className="text-blue-600 hover:underline text-sm">
              {t("auth.backToLogin")}
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
