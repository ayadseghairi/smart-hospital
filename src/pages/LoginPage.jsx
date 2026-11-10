// src/pages/LoginPage.jsx
import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">{t("auth.login")}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="identifier">
              {t("auth.phoneOrEmail")}
            </label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("auth.phoneOrEmailPlaceholder")}
              dir="ltr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              {t("auth.password")}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="text-end">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              {t("auth.forgotPassword")}
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
          >
            {loading ? t("common.loading") : t("auth.loginButton")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="text-blue-600 hover:underline font-semibold">
            {t("auth.createPatientAccount")}
          </Link>
        </p>
      </div>
    </div>
  )
}
