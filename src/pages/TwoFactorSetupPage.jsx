// src/pages/TwoFactorSetupPage.jsx
// /account/security/2fa-setup
// Allows any authenticated user (specifically SUPER_ADMIN) to enroll TOTP.
// Flow: GET /auth/2fa/setup → shows QR + URI → user enters code → POST /auth/2fa/enable → shows recovery codes
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { ShieldCheck, Copy, Download, ArrowLeft, ArrowRight, CheckCircle2, Lock } from "lucide-react"
import { apiGet, apiPost } from "../api/client"
import { useAuth } from "../contexts/AuthContext"

export default function TwoFactorSetupPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const isRtl = lang === "ar"
  const BackIcon = isRtl ? ArrowRight : ArrowLeft
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState("loading") // loading | qr | codes | done
  const [qrDataUrl, setQrDataUrl] = useState("")
  const [uri, setUri] = useState("")
  const [code, setCode] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [recoveryCodes, setRecoveryCodes] = useState([])
  const [copied, setCopied] = useState(false)

  // Load QR code on mount
  useEffect(() => {
    apiPost(`/auth/2fa/setup`, {}, lang)
      .then((data) => {
        setQrDataUrl(data.qrCodeDataUrl)
        setUri(data.uri)
        setStep("qr")
      })
      .catch(() => {
        toast.error(t("common.error"))
        navigate("/account/security")
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEnable = async (e) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(code)) {
      toast.error(t("mfa.error"))
      return
    }
    setSubmitting(true)
    try {
      const data = await apiPost(`/auth/2fa/enable`, { code }, lang)
      setRecoveryCodes(data.recoveryCodes)
      await refreshUser()
      setStep("codes")
    } catch (err) {
      toast.error(err?.message ?? t("mfa.error"))
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([recoveryCodes.join("\n")], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "delin-recovery-codes.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDone = () => {
    // Redirect: SUPER_ADMIN goes to /admin, others go to /account/security
    if (user?.role === "SUPER_ADMIN") navigate("/admin", { replace: true })
    else navigate("/account/security", { replace: true })
  }

  const backLink = user?.role === "SUPER_ADMIN" ? "/admin" : "/account/security"

  if (step === "loading") {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <span className="text-gray-400 animate-pulse text-sm">{t("common.loading")}</span>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link to={backLink} className="text-blue-600 hover:text-blue-800 min-h-[44px] flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded">
            <BackIcon size={18} aria-hidden />
            <span className="text-sm">{t("nav.backHome")}</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">{t("mfa.setupTitle")}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-lg">
        {step === "qr" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={28} className="text-blue-600" aria-hidden />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{t("mfa.step1")}</h2>
              <p className="text-sm text-gray-500 mt-1">{t("mfa.setupDesc")}</p>
            </div>

            {qrDataUrl && (
              <div className="flex justify-center">
                <img src={qrDataUrl} alt="QR Code for TOTP setup" className="w-48 h-48 rounded-xl border border-gray-200" />
              </div>
            )}

            {uri && (
              <details className="text-xs text-gray-400">
                <summary className="cursor-pointer">{t("common.showMore")}</summary>
                <p className="mt-1 break-all font-mono bg-gray-50 p-2 rounded">{uri}</p>
              </details>
            )}

            <form onSubmit={handleEnable} className="space-y-4">
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
                  className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ fontSize: "24px", letterSpacing: "0.3em" }}
                  autoFocus
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting || code.length !== 6}
                className="w-full bg-[#2C5F8A] text-white py-3 rounded-xl hover:bg-[#245075] font-semibold min-h-[48px] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#2C5F8A] focus-visible:outline-none"
              >
                {submitting ? t("common.loading") : t("mfa.enableBtn")}
              </button>
            </form>
          </div>
        )}

        {step === "codes" && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={28} className="text-green-600" aria-hidden />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{t("mfa.recoveryCodesTitle")}</h2>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2">
              <Lock size={16} className="text-amber-600 mt-0.5 shrink-0" aria-hidden />
              <p className="text-sm text-amber-800">{t("mfa.recoveryCodesDesc")}</p>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm text-green-400 grid grid-cols-2 gap-1" dir="ltr">
              {recoveryCodes.map((c, i) => (
                <span key={i} className="tracking-wider">{c}</span>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-xl py-2.5 text-sm hover:bg-gray-50 min-h-[44px]"
              >
                <Copy size={16} aria-hidden />
                {copied ? t("mfa.recoveryCodesCopied") : t("mfa.recoveryCopyBtn")}
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-300 rounded-xl py-2.5 text-sm hover:bg-gray-50 min-h-[44px]"
              >
                <Download size={16} aria-hidden />
                {t("mfa.recoveryDownloadBtn")}
              </button>
            </div>

            <button
              onClick={handleDone}
              className="w-full bg-[#2C5F8A] text-white py-3 rounded-xl hover:bg-[#245075] font-semibold min-h-[48px] focus-visible:ring-2 focus-visible:ring-[#2C5F8A] focus-visible:outline-none"
            >
              {t("common.continue")}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
