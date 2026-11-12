// src/pages/ForceChangePasswordPage.jsx
/**
 * /force-change-password
 *
 * Rendered when the server returns mustChangePassword=true at login.
 * The server blocks all other authenticated routes until the password is changed
 * (403 PASSWORD_CHANGE_REQUIRED). This page is the client-side companion.
 *
 * Accessible only while the flag is set; redirects away if it is not.
 */
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Eye, EyeOff, ShieldCheck, Lock } from "lucide-react"
import { apiPatch } from "../api/client"
import { useAuth } from "../contexts/AuthContext"

const ROLE_HOME = {
  PATIENT: "/account",
  DOCTOR: "/doctor",
  INSTITUTION_ADMIN: "/institution",
  SUPER_ADMIN: "/admin",
}

export default function ForceChangePasswordPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const { user, loaded, refreshUser, logout } = useAuth()
  const navigate = useNavigate()

  // Hooks must be declared before any conditional return (Rules of Hooks).
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" })
  const [show, setShow] = useState({ current: false, new: false, confirm: false })
  const [loading, setLoading] = useState(false)

  // Guard: must be authenticated. Once `loaded` is true, if there's no user,
  // redirect to /login. We do NOT check mustChangePassword here — the server
  // enforces that. This guard only prevents accessing the page when logged out.
  if (loaded && !user) {
    navigate("/login", { replace: true })
    return null
  }

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const toggleShow = (key) => setShow((s) => ({ ...s, [key]: !s[key] }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.newPassword !== form.confirm) {
      toast.error(t("auth.passwordMismatch"))
      return
    }

    setLoading(true)
    try {
      await apiPatch(
        "/auth/password",
        { currentPassword: form.currentPassword, newPassword: form.newPassword },
        lang,
      )
      toast.success(t("forceChangePassword.successMsg"))
      await refreshUser()
      navigate(ROLE_HOME[user?.role] ?? "/", { replace: true })
    } catch (err) {
      const code = err?.code
      if (code === "SAME_PASSWORD") {
        toast.error(t("forceChangePassword.samePasswordError"))
      } else if (code === "POLICY_VIOLATION") {
        toast.error(err.message ?? t("forceChangePassword.policyError"))
      } else if (code === "INVALID_CURRENT") {
        toast.error(t("forceChangePassword.wrongCurrentPassword"))
      } else {
        toast.error(t("forceChangePassword.error"))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate("/login", { replace: true })
  }

  return (
    <div
      className="flex items-center justify-center px-4 py-12"
      style={{ minHeight: "100svh" }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header band */}
        <div className="bg-[#2C5F8A] px-6 py-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={28} className="text-white" aria-hidden />
          </div>
          <h1 className="text-xl font-bold text-white">{t("forceChangePassword.title")}</h1>
          <p className="text-sm text-blue-100 mt-1 leading-snug">{t("forceChangePassword.subtitle")}</p>
        </div>

        {/* Notice */}
        <div className="mx-6 mt-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
          <Lock size={16} className="text-amber-600 mt-0.5 shrink-0" aria-hidden />
          <p className="text-xs text-amber-800 leading-snug">{t("forceChangePassword.notice")}</p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pt-5 pb-7 space-y-5">
          {/* Current password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="currentPassword">
              {t("account.security.currentPassword")}
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={show.current ? "text" : "password"}
                autoComplete="current-password"
                required
                value={form.currentPassword}
                onChange={(e) => update("currentPassword", e.target.value)}
                enterKeyHint="next"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2C5F8A] focus:border-transparent pe-11"
                style={{ fontSize: "16px" }}
              />
              <button
                type="button"
                className="absolute inset-y-0 end-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus-visible:outline-none"
                onClick={() => toggleShow("current")}
                aria-label={show.current ? t("auth.hidePassword") : t("auth.showPassword")}
                tabIndex={-1}
              >
                {show.current ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="newPassword">
              {t("account.security.newPassword")}
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={show.new ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={10}
                value={form.newPassword}
                onChange={(e) => update("newPassword", e.target.value)}
                enterKeyHint="next"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2C5F8A] focus:border-transparent pe-11"
                style={{ fontSize: "16px" }}
              />
              <button
                type="button"
                className="absolute inset-y-0 end-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus-visible:outline-none"
                onClick={() => toggleShow("new")}
                aria-label={show.new ? t("auth.hidePassword") : t("auth.showPassword")}
                tabIndex={-1}
              >
                {show.new ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-400">{t("forceChangePassword.passwordHint")}</p>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
              {t("auth.confirmPassword")}
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={show.confirm ? "text" : "password"}
                autoComplete="new-password"
                required
                value={form.confirm}
                onChange={(e) => update("confirm", e.target.value)}
                enterKeyHint="done"
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2C5F8A] focus:border-transparent pe-11"
                style={{ fontSize: "16px" }}
              />
              <button
                type="button"
                className="absolute inset-y-0 end-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus-visible:outline-none"
                onClick={() => toggleShow("confirm")}
                aria-label={show.confirm ? t("auth.hidePassword") : t("auth.showPassword")}
                tabIndex={-1}
              >
                {show.confirm ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2C5F8A] text-white py-3 rounded-xl hover:bg-[#245075] transition-colors font-semibold text-sm min-h-[48px] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#2C5F8A] focus-visible:outline-none"
          >
            {loading ? t("common.loading") : t("forceChangePassword.submit")}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-sm text-gray-500 hover:text-gray-700 underline py-1 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded"
          >
            {t("nav.logout")}
          </button>
        </form>
      </div>
    </div>
  )
}
