// src/components/Layout.jsx
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../contexts/AuthContext"

const ROLE_HOME = {
  PATIENT: "/account",
  DOCTOR: "/doctor",
  INSTITUTION_ADMIN: "/institution",
  SUPER_ADMIN: "/admin",
}

export default function Layout({ children }) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Brand */}
            <Link to="/" className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">
              <img
                src="/logo.jpg"
                alt={t("brand.logoAlt")}
                className="w-10 h-10 rounded-full object-cover shadow-sm"
              />
              <div>
                <span className="block font-bold text-gray-800 text-base leading-tight">{t("brand.nameAr")}</span>
                <span className="block text-xs text-gray-500">{t("brand.name")}</span>
              </div>
            </Link>

            {/* Main nav */}
            <nav aria-label={t("nav.mainNav")} className="flex items-center gap-4 flex-wrap">
              <Link to="/institutions" className="text-sm text-gray-600 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1 py-0.5 transition-colors">
                {t("nav.institutions")}
              </Link>
              <Link to="/doctors" className="text-sm text-gray-600 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1 py-0.5 transition-colors">
                {t("nav.doctors")}
              </Link>
              <Link to="/emergency" className="text-sm font-semibold text-red-600 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded px-1 py-0.5 transition-colors">
                {t("nav.emergency")}
              </Link>
            </nav>

            {/* Auth + lang */}
            <div className="flex items-center gap-2 flex-wrap">
              {user ? (
                <>
                  <Link
                    to={ROLE_HOME[user.role] ?? "/"}
                    className="text-sm text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1"
                  >
                    {user.role === "PATIENT" && t("nav.myAppointments")}
                    {user.role === "DOCTOR" && t("nav.doctorDashboard")}
                    {user.role === "INSTITUTION_ADMIN" && t("nav.myAccount")}
                    {user.role === "SUPER_ADMIN" && t("nav.adminPanel")}
                  </Link>
                  <Link
                    to="/my-account"
                    className="text-sm text-gray-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1"
                  >
                    {user.fullName}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="border border-red-300 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/register"
                    className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {t("nav.register")}
                  </Link>
                </>
              )}
              <button
                onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "fr" : "ar")}
                className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label={t("langSwitch.label")}
              >
                {t("langSwitch.label")}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────── */}
      <main className="flex-1">{children}</main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-gray-800 text-white py-10 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Brand block */}
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt={t("brand.logoAlt")} className="w-8 h-8 rounded-full object-cover" />
              <div>
                <span className="block font-semibold text-white">{t("brand.nameAr")}</span>
                <span className="block text-xs text-gray-400">{t("brand.tagline")}</span>
              </div>
            </div>

            {/* Footer links */}
            <nav aria-label={t("nav.footerNav")} className="flex flex-wrap gap-x-6 gap-y-2">
              <Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">{t("nav.about")}</Link>
              <Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">{t("nav.contact")}</Link>
              <Link to="/for-institutions" className="text-sm text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">{t("footer.forInstitutions")}</Link>
              <Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">{t("account.privacy")}</Link>
              <Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">{t("account.terms")}</Link>
              <Link to="/cookies" className="text-sm text-gray-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded">{t("footer.cookies")}</Link>
            </nav>
          </div>

          <div className="border-t border-gray-700 mt-6 pt-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Delin Smart Care. {t("footer.rights")}
          </div>
        </div>
      </footer>
    </div>
  )
}
