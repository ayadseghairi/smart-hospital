// src/pages/LoginTwoFactorPage.jsx
// /login/2fa
// Shown when login returns mfaRequired:true — user enters TOTP code or recovery code.
import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { ShieldCheck, KeyRound } from "lucide-react"
import { apiPost, setAccessToken } from "../api/client"
import { useAuth } from "../contexts/AuthContext"
import { isSafeReturnTo } from "../lib/returnTo"

const ROLE_HOME = {
  PATIENT: "/account",
  DOCTOR: "/doctor",
  INSTITUTION_ADMIN: "/institution",
  SUPER_ADMIN: "/admin",
}

export default function LoginTwoFactorPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const { refreshUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // mfaToken passed via router state by LoginPage
  const mfaToken = location.state?.mfaToken ?? ""
  const returnTo = location.state?.returnTo ?? ""

  const [code, setCode] = useState("")
  const [recoveryCode, setRecoveryCode] = useState("")
  const [useRecovery, setUseRecovery] = useState(false)
  const [loading, setLoading] = useState(false)

  // If no mfaToken, redirect to login
  if (!mfaToken) {
    navigate("/login", { replace: true })
    return null
  }

  const handleComplete = async (data) => {
    setAccessToken(data.accessToken)
    const me = await refreshUser()
    const role = me?.role ?? "PATIENT"
    if (data.mustChangePassword) {
      navigate("/force-change-password", { replace: true })
      return
    }
    const destination =
      returnTo && isSafeReturnTo(returnTo)
        ? returnTo
        : ROLE_HOME[role] ?? "/"
    navigate(destination, { replace: true })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let data
      if (useRecovery) {
        data = await apiPost("/auth/login/recovery-code", { mfaToken, recoveryCode }, lang)
      } else {
        data = await apiPost("/auth/login/2fa", { mfaToken, code }, lang)
      }
      await handleComplete(data)
    } catch (err) {
      toast.error(err?.message ?? t("mfa.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-[#2C5F8A] px-6 py-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={28} className="text-white" aria-hidden />
          </div>
          <h1 className="text-xl font-bold text-white">
            {useRecovery ? t("mfa.recoveryCodeLabel") : t("mfa.challengeTitle")}
          </h1>
          <p className="text-sm text-blue-100 mt-1">
            {useRecovery ? "" : t("mfa.challengeDesc")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pt-6 pb-7 space-y-5">
          {!useRecovery ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="totp-code">
                {t("mfa.codeLabel")}
              </label>
              <input
                id="totp-code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder={t("mfa.codePlaceholder")}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2C5F8A] focus:border-transparent"
                style={{ fontSize: "24px", letterSpacing: "0.3em" }}
                autoFocus
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="recovery-code">
                {t("mfa.recoveryCodeLabel")}
              </label>
              <input
                id="recovery-code"
                type="text"
                autoComplete="off"
                placeholder={t("mfa.recoveryCodePlaceholder")}
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                className="w-full px-4 py-3 font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2C5F8A] focus:border-transparent"
                style={{ fontSize: "16px" }}
                autoFocus
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (!useRecovery && code.length !== 6) || (useRecovery && !recoveryCode)}
            className="w-full bg-[#2C5F8A] text-white py-3 rounded-xl hover:bg-[#245075] font-semibold min-h-[48px] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#2C5F8A] focus-visible:outline-none"
          >
            {loading ? t("common.loading") : t("mfa.verifyBtn")}
          </button>

          <button
            type="button"
            onClick={() => { setUseRecovery(!useRecovery); setCode(""); setRecoveryCode("") }}
            className="w-full text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2 py-1 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded"
          >
            <KeyRound size={14} aria-hidden />
            {useRecovery ? t("mfa.backToCode") : t("mfa.useRecoveryCode")}
          </button>
        </form>
      </div>
    </div>
  )
}
