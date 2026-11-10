// src/components/UnverifiedEmailBanner.jsx
// Shown to logged-in patients who have not yet verified their email.
// Only displayed if the user has an email that is not verified.
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useAuth } from "../contexts/AuthContext"
import { apiPost } from "../api/client"

export default function UnverifiedEmailBanner() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const { user } = useAuth()
  const [resending, setResending] = useState(false)
  const [sent, setSent] = useState(false)

  // Only show if: logged in, has email, email not verified
  if (!user || !user.email || user.emailVerifiedAt) return null

  const resend = async () => {
    setResending(true)
    try {
      await apiPost("/auth/resend-verification", { email: user.email }, lang)
      setSent(true)
      toast.success(t("auth.verificationResent"))
    } catch {
      toast.error(t("auth.resendError"))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-amber-800 text-sm">
          <i className="bx bx-error text-lg"></i>
          <span>{t("auth.unverifiedEmailBanner")}</span>
        </div>
        {!sent ? (
          <button
            onClick={resend}
            disabled={resending}
            className="text-sm text-amber-700 underline hover:text-amber-900 disabled:opacity-50 shrink-0"
          >
            {resending ? t("common.loading") : t("auth.resendVerification")}
          </button>
        ) : (
          <span className="text-sm text-green-600">{t("auth.verificationResent")}</span>
        )}
      </div>
    </div>
  )
}
