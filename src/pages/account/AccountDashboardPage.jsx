// src/pages/account/AccountDashboardPage.jsx
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import {
  Calendar, User, ShieldCheck, Bell, LogOut,
  AlertTriangle, Clock, CheckCircle2, XCircle, FileText,
} from "lucide-react"
import Layout from "../../components/Layout"
import { useAuth } from "../../contexts/AuthContext"
import { apiGet } from "../../api/client"

const STATUS_STYLE = {
  PENDING:   { cls: "bg-amber-100 text-amber-800",  icon: Clock },
  CONFIRMED: { cls: "bg-green-100 text-green-800",  icon: CheckCircle2 },
  CANCELLED: { cls: "bg-red-100 text-red-700",      icon: XCircle },
  COMPLETED: { cls: "bg-blue-100 text-blue-800",    icon: CheckCircle2 },
  NO_SHOW:   { cls: "bg-gray-100 text-gray-600",    icon: XCircle },
}

function StatusPill({ status }) {
  const { t } = useTranslation()
  const s = STATUS_STYLE[status] ?? { cls: "bg-gray-100 text-gray-600", icon: Clock }
  const Icon = s.icon
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${s.cls}`}>
      <Icon size={11} aria-hidden />
      {t(`appointments.status.${status.toLowerCase()}`)}
    </span>
  )
}

export default function AccountDashboardPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => apiGet("/appointments/mine", lang),
    enabled: !!user,
  })

  const upcoming  = appointments.filter(a => ["PENDING","CONFIRMED"].includes(a.status))
  const completed = appointments.filter(a => a.status === "COMPLETED")

  const formatDate = (iso) =>
    new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : "fr-DZ", {
      dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Algiers",
    }).format(new Date(iso))

  const handleLogout = async () => { await logout(); navigate("/login", { replace: true }) }

  const quickActions = [
    { to: "/account/appointments", icon: Calendar,   label: t("account.dashboard.viewAllAppointments"), color: "text-blue-600",   bg: "bg-blue-50" },
    { to: "/account/profile",      icon: User,        label: t("account.dashboard.editProfile"),         color: "text-violet-600", bg: "bg-violet-50" },
    { to: "/account/security",     icon: ShieldCheck, label: t("account.dashboard.accountSettings"),     color: "text-teal-600",   bg: "bg-teal-50" },
    { to: "/account/notifications",icon: Bell,        label: t("account.notifications.title"),           color: "text-amber-600",  bg: "bg-amber-50" },
    { to: "/account/privacy",      icon: FileText,    label: t("account.privacy"),                       color: "text-gray-600",   bg: "bg-gray-100" },
  ]

  const initials = (name) =>
    (name ?? "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* ── Hero card ── */}
        <div className="bg-gradient-to-br from-[#2C5F8A] to-[#1a4068] rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
                {initials(user?.fullName)}
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">{user?.fullName}</p>
                {user?.email && <p className="text-blue-200 text-sm mt-0.5" dir="ltr">{user.email}</p>}
                {user?.emailVerifiedAt
                  ? <span className="inline-flex items-center gap-1 text-xs text-green-300 mt-1"><CheckCircle2 size={11} />{lang === "ar" ? "بريد موثق" : "Email vérifié"}</span>
                  : <span className="inline-flex items-center gap-1 text-xs text-amber-300 mt-1"><AlertTriangle size={11} />{lang === "ar" ? "بريد غير موثق" : "Email non vérifié"}</span>
                }
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors"
            >
              <LogOut size={15} aria-hidden />
              {t("nav.logout")}
            </button>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold">{isLoading ? "…" : upcoming.length}</p>
              <p className="text-xs text-blue-200 mt-0.5">{lang === "ar" ? "قادمة" : "À venir"}</p>
            </div>
            <div className="text-center border-x border-white/20">
              <p className="text-2xl font-bold">{isLoading ? "…" : completed.length}</p>
              <p className="text-xs text-blue-200 mt-0.5">{lang === "ar" ? "مكتملة" : "Terminés"}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{isLoading ? "…" : appointments.length}</p>
              <p className="text-xs text-blue-200 mt-0.5">{lang === "ar" ? "الكل" : "Total"}</p>
            </div>
          </div>
        </div>

        {/* ── Unverified email warning ── */}
        {user && user.email && !user.emailVerifiedAt && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" aria-hidden />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800">{t("account.dashboard.unverifiedEmail")}</p>
              <Link to="/account/add-email" className="text-xs text-amber-700 underline mt-1 inline-block">
                {t("account.dashboard.addEmail")}
              </Link>
            </div>
          </div>
        )}

        {/* ── Upcoming appointments ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">{t("account.dashboard.upcomingTitle")}</h2>
            <Link to="/account/appointments" className="text-xs text-[#2C5F8A] hover:underline font-medium">
              {lang === "ar" ? "عرض الكل" : "Voir tout"}
            </Link>
          </div>

          {isLoading && (
            <div className="space-y-2">
              {[1,2].map(i => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && upcoming.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
              <Calendar size={40} className="text-gray-200 mb-3 mx-auto" aria-hidden />
              <p className="text-gray-400 text-sm">{t("account.dashboard.noUpcoming")}</p>
              <Link to="/doctors" className="mt-3 inline-block text-sm text-[#2C5F8A] hover:underline font-medium">
                {lang === "ar" ? "احجز موعداً" : "Prendre un rendez-vous"}
              </Link>
            </div>
          )}

          {!isLoading && upcoming.length > 0 && (
            <div className="space-y-3">
              {upcoming.slice(0, 3).map((appt) => (
                <div key={appt.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <Calendar size={18} className="text-blue-600" aria-hidden />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {appt.doctor?.user?.fullName ?? (lang === "ar" ? appt.service?.nameAr : appt.service?.nameFr) ?? "—"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(appt.startsAt)}</p>
                      {appt.institution && (
                        <p className="text-xs text-gray-400">{lang === "ar" ? appt.institution.nameAr : appt.institution.nameFr}</p>
                      )}
                    </div>
                  </div>
                  <StatusPill status={appt.status} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Quick actions ── */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">{lang === "ar" ? "الإجراءات السريعة" : "Actions rapides"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const ActionIcon = action.icon
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all flex flex-col items-center gap-2 text-center min-h-[90px] justify-center focus-visible:ring-2 focus-visible:ring-[#2C5F8A] focus-visible:outline-none"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.bg}`}>
                    <ActionIcon size={20} className={action.color} aria-hidden />
                  </div>
                  <p className="text-xs font-medium text-gray-700 leading-snug">{action.label}</p>
                </Link>
              )
            })}
          </div>
        </section>

      </div>
    </Layout>
  )
}
