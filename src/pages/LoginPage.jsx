// src/pages/LoginPage.jsx
import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

const ROLE_HOME = {
  PATIENT: "/account",
  DOCTOR: "/doctor",
  INSTITUTION_ADMIN: "/institution",
  SUPER_ADMIN: "/admin",
}

/** Returns true if `path` is a safe same-origin relative path. */
function isSafeReturnTo(path) {
  if (typeof path !== "string") return false
  return path === "/" || /^\/[^/\\]/.test(path)
}

export default function LoginPage() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ identifier: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Detect phone vs email
      const isPhone = /^[0-9+]/.test(form.identifier.trim())
      const credentials = {
        password: form.password,
        ...(isPhone ? { phone: form.identifier } : { email: form.identifier }),
      }
      const data = await login(credentials)

      // Two-step TOTP challenge: server returned mfaRequired
      if (data?.mfaRequired) {
        const params = new URLSearchParams(location.search)
        const returnTo = params.get("returnTo")
        navigate("/login/2fa", {
          replace: true,
          state: { mfaToken: data.mfaToken, returnTo: returnTo ?? "" },
        })
        return
      }

      // Server-side forced password change takes priority
      if (data?.mustChangePassword) {
        navigate("/force-change-password", { replace: true })
        return
      }

      const role = data?.user?.role ?? null

      // Check returnTo query param first (safe path only)
      const params = new URLSearchParams(location.search)
      const returnTo = params.get("returnTo")
      if (returnTo && isSafeReturnTo(returnTo)) {
        navigate(returnTo, { replace: true })
        return
      }

      // Fall back to role-based home
      navigate(ROLE_HOME[role] ?? "/", { replace: true })
    } catch (err) {
      toast.error(err.message === "Invalid credentials"
        ? t("auth.invalidCredentials")
        : t("auth.loginError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center bg-gray-50 px-4 py-8"
      style={{ minHeight: "100svh" }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.jpg"
            alt={t("brand.logoAlt")}
            width={56}
            height={56}
            className="w-14 h-14 rounded-2xl object-cover mb-3 shadow-sm"
          />
          <h1 className="text-2xl font-bold text-gray-800">{t("auth.login")}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="identifier">
              {t("auth.phoneOrEmail")}
            </label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              inputMode="email"
              enterKeyHint="next"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2C5F8A] focus:border-transparent"
              placeholder={t("auth.phoneOrEmailPlaceholder")}
              dir="ltr"
              style={{ fontSize: "16px" }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              {t("auth.password")}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                enterKeyHint="done"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#2C5F8A] focus:border-transparent pe-11"
                style={{ fontSize: "16px" }}
              />
              <button
                type="button"
                className="absolute inset-y-0 end-0 px-3 flex items-center text-gray-400 hover:text-gray-600 focus-visible:outline-none"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
              </button>
            </div>
          </div>

          <div className="text-end">
            <Link to="/forgot-password" className="text-sm text-[#2C5F8A] hover:underline">
              {t("auth.forgotPassword")}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2C5F8A] text-white py-3 rounded-xl hover:bg-[#245075] transition-colors font-semibold min-h-[48px] disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#2C5F8A] focus-visible:outline-none"
          >
            {loading ? t("common.loading") : t("auth.loginButton")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="text-[#2C5F8A] hover:underline font-semibold">
            {t("auth.createPatientAccount")}
          </Link>
        </p>
      </div>
    </div>
  )
}
