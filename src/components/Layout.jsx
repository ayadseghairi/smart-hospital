// src/components/Layout.jsx
import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../contexts/AuthContext"
import { useInstallPrompt } from "../hooks/useInstallPrompt"
import {
  Menu, X, Home, Building2, UserRound, AlertTriangle,
  LogOut, User, LayoutDashboard, Download,
  Stethoscope, Globe,
} from "lucide-react"

const ROLE_HOME = {
  PATIENT: "/account",
  DOCTOR: "/doctor",
  INSTITUTION_ADMIN: "/institution",
  SUPER_ADMIN: "/admin",
}

// Patient bottom-tab items
const PATIENT_TABS = [
  { to: "/account",              icon: Home,         labelKey: "nav.home" },
  { to: "/institutions",         icon: Building2,    labelKey: "nav.institutions" },
  { to: "/doctors",              icon: Stethoscope,  labelKey: "nav.doctors" },
  { to: "/account/appointments", icon: UserRound,    labelKey: "nav.myAppointments" },
]

export default function Layout({ children }) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isRtl = i18n.language === "ar"

  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerRef = useRef(null)
  const { canInstall, triggerInstall, isDismissed } = useInstallPrompt()

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false) }, [location.pathname])

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [drawerOpen])

  // Close drawer on outside click
  useEffect(() => {
    if (!drawerOpen) return
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("touchstart", handler, { passive: true })
    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("touchstart", handler)
    }
  }, [drawerOpen])

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  const switchLang = () => i18n.changeLanguage(isRtl ? "fr" : "ar")

  const isPatient = user?.role === "PATIENT"
  const showBottomTabs = isPatient

  // Compute nav label for logged-in users
  const dashLabel =
    user?.role === "PATIENT"         ? t("nav.myAppointments")
    : user?.role === "DOCTOR"        ? t("nav.doctorDashboard")
    : user?.role === "INSTITUTION_ADMIN" ? t("nav.myAccount")
    : user?.role === "SUPER_ADMIN"   ? t("nav.adminPanel")
    : null

  // Pre-render icon elements to avoid JSX-in-array ESLint issues
  const drawerMainLinks = [
    { to: "/institutions", label: t("nav.institutions"), icon: <Building2 size={18} aria-hidden />, },
    { to: "/doctors",      label: t("nav.doctors"),      icon: <Stethoscope size={18} aria-hidden /> },
    { to: "/emergency",    label: t("nav.emergency"),    icon: <AlertTriangle size={18} aria-hidden />, className: "text-red-600" },
  ]

  return (
    <div
      className="flex flex-col overflow-x-hidden"
      style={{ minHeight: "100svh" }}
    >
      {/* ── Skip-nav ─────────────────────────────────────────── */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[110] focus:bg-white focus:text-blue-700 focus:px-4 focus:py-2 focus:rounded focus:shadow-lg focus:text-sm focus:font-medium"
      >
        {t("nav.skipToContent", "Skip to content")}
      </a>

      {/* ── Header ──────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-2">

            {/* Brand */}
            <Link
              to="/"
              className="flex items-center gap-2.5 shrink-0 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              aria-label={t("brand.name")}
            >
              <img
                src="/logo.jpg"
                alt={t("brand.logoAlt")}
                width={36}
                height={36}
                className="w-9 h-9 rounded-full object-cover shadow-sm"
              />
              <div className="hidden sm:block leading-tight">
                <span className="block font-bold text-gray-800 text-[15px]">{t("brand.nameAr")}</span>
                <span className="block text-[11px] text-gray-400">{t("brand.name")}</span>
              </div>
            </Link>

            {/* Desktop nav — hidden below lg */}
            <nav
              aria-label={t("nav.mainNav")}
              className="hidden lg:flex items-center gap-1 flex-1 justify-center"
            >
              {[
                { to: "/institutions", label: t("nav.institutions") },
                { to: "/doctors",      label: t("nav.doctors") },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                    location.pathname === to
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {label}
                </Link>
              ))}
              <Link
                to="/emergency"
                className="px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
              >
                {t("nav.emergency")}
              </Link>
            </nav>

            {/* Desktop actions — hidden below lg */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {user ? (
                <>
                  <Link
                    to={ROLE_HOME[user.role] ?? "/"}
                    className="text-sm text-blue-600 hover:underline px-2 py-1.5 rounded focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  >
                    {dashLabel}
                  </Link>
                  <span className="text-gray-300">|</span>
                  <span className="text-sm text-gray-600 max-w-[120px] truncate" title={user.fullName}>
                    {user.fullName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 border border-red-200 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 text-sm transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                  >
                    <LogOut size={15} aria-hidden />
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="bg-[#2C5F8A] text-white px-4 py-2 rounded-lg hover:bg-[#245075] transition-colors text-sm font-medium min-h-[44px] flex items-center focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/register"
                    className="border border-[#2C5F8A] text-[#2C5F8A] px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium min-h-[44px] flex items-center focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  >
                    {t("nav.register")}
                  </Link>
                </>
              )}

              {/* Install app */}
              {canInstall && !isDismissed && (
                <button
                  onClick={triggerInstall}
                  className="flex items-center gap-1.5 text-sm text-[#2C5F8A] border border-[#2C5F8A]/30 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  title={t("install.installApp")}
                >
                  <Download size={15} aria-hidden />
                  <span className="hidden xl:inline">{t("install.installApp")}</span>
                </button>
              )}

              {/* Language toggle */}
              <button
                onClick={switchLang}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-lg transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                aria-label={t("langSwitch.label")}
              >
                <Globe size={14} aria-hidden />
                {t("langSwitch.label")}
              </button>
            </div>

            {/* Mobile right-side actions */}
            <div className="flex lg:hidden items-center gap-1">
              {/* Language toggle — always visible */}
              <button
                onClick={switchLang}
                className="flex items-center gap-1 text-xs text-gray-600 border border-gray-300 px-2 py-1.5 rounded-lg min-h-[44px] min-w-[44px] justify-center focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                aria-label={t("langSwitch.label")}
              >
                <Globe size={14} aria-hidden />
              </button>

              {/* Hamburger */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center justify-center w-11 h-11 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                aria-label={t("nav.openMenu", "Open menu")}
                aria-expanded={drawerOpen}
                aria-controls="mobile-drawer"
              >
                <Menu size={22} aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer Overlay ────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 lg:hidden"
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
          style={{ backdropFilter: "blur(2px)" }}
        />
      )}

      {/* ── Mobile Drawer Panel ──────────────────────────────── */}
      <div
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("nav.mainNav")}
        className={`fixed top-0 z-[70] w-[min(320px,88vw)] h-full bg-white shadow-2xl transition-transform duration-300 lg:hidden flex flex-col ${
          isRtl ? "right-0" : "left-0"
        } ${
          drawerOpen
            ? "translate-x-0"
            : isRtl ? "translate-x-full" : "-translate-x-full"
        }`}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 shrink-0">
          <Link to="/" className="flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
            <img src="/logo.jpg" alt={t("brand.logoAlt")} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
            <span className="font-bold text-gray-800 text-sm">{t("brand.nameAr")}</span>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            aria-label={t("nav.closeMenu", "Close menu")}
          >
            <X size={20} aria-hidden />
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {/* User greeting */}
          {user && (
            <div className="px-3 py-3 mb-2 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-[#2C5F8A] flex items-center justify-center shrink-0">
                  <User size={18} className="text-white" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main links */}
          {drawerMainLinks.map(({ to, label, icon: NavIconEl, className: cls }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors min-h-[48px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                location.pathname === to
                  ? "bg-blue-50 text-blue-700"
                  : cls ?? "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {NavIconEl}
              {label}
            </Link>
          ))}

          {/* Divider */}
          <hr className="my-2 border-gray-100" />

          {/* Auth links */}
          {user ? (
            <>
              <Link
                to={ROLE_HOME[user.role] ?? "/"}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[48px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              >
                <LayoutDashboard size={18} aria-hidden />
                {dashLabel}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors min-h-[48px] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
              >
                <LogOut size={18} aria-hidden />
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-semibold bg-[#2C5F8A] text-white hover:bg-[#245075] transition-colors min-h-[48px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              >
                {t("nav.login")}
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium border border-[#2C5F8A] text-[#2C5F8A] hover:bg-blue-50 transition-colors min-h-[48px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              >
                {t("nav.register")}
              </Link>
            </>
          )}

          {/* Install app */}
          {canInstall && !isDismissed && (
            <button
              onClick={() => { triggerInstall(); setDrawerOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-[#2C5F8A] hover:bg-blue-50 border border-[#2C5F8A]/30 transition-colors min-h-[48px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              <Download size={18} aria-hidden />
              {t("install.installApp")}
            </button>
          )}

          {/* Language */}
          <button
            onClick={() => { switchLang(); setDrawerOpen(false) }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 transition-colors min-h-[48px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            <Globe size={18} aria-hidden />
            {t("langSwitch.label")}
          </button>
        </nav>

        {/* Drawer footer */}
        <div className="border-t border-gray-100 px-4 py-3 shrink-0">
          <Link
            to="/install"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors focus-visible:outline-none"
            onClick={() => setDrawerOpen(false)}
          >
            {t("install.getApp")}
          </Link>
        </div>
      </div>

      {/* ── Page content ────────────────────────────────────── */}
      <main
        id="main-content"
        className="flex-1"
        style={{ paddingBottom: showBottomTabs ? "calc(env(safe-area-inset-bottom) + 64px)" : "env(safe-area-inset-bottom)" }}
      >
        {children}
      </main>

      {/* ── Bottom Tab Bar (patient mobile only) ─────────────── */}
      {showBottomTabs && (
        <nav
          aria-label={t("nav.bottomNav", "Bottom navigation")}
          className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="grid grid-cols-4">
            {PATIENT_TABS.map((tab) => {
              const active = location.pathname === tab.to || location.pathname.startsWith(tab.to + "/")
              const TabIconComp = tab.icon
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`flex flex-col items-center justify-center gap-1 py-2 min-h-[56px] transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 focus-visible:outline-none ${
                    active ? "text-[#2C5F8A]" : "text-gray-500 hover:text-[#2C5F8A]"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <TabIconComp size={22} aria-hidden strokeWidth={active ? 2.5 : 1.75} />
                  <span className="text-[10px] font-medium leading-none">{t(tab.labelKey)}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-gray-800 text-white py-10 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <img src="/logo.jpg" alt={t("brand.logoAlt")} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
              <div>
                <span className="block font-semibold text-white">{t("brand.nameAr")}</span>
                <span className="block text-xs text-gray-400">{t("brand.tagline")}</span>
              </div>
            </div>
            <nav aria-label={t("nav.footerNav")} className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { to: "/about",           label: t("nav.about") },
                { to: "/contact",         label: t("nav.contact") },
                { to: "/for-institutions", label: t("footer.forInstitutions") },
                { to: "/privacy",         label: t("account.privacy") },
                { to: "/terms",           label: t("account.terms") },
                { to: "/cookies",         label: t("footer.cookies") },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm text-gray-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-white rounded focus-visible:outline-none"
                >
                  {label}
                </Link>
              ))}
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
