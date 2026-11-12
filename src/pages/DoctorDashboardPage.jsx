// src/pages/DoctorDashboardPage.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  Calendar, Clock, UserCircle2, ShieldCheck, LogOut,
  CheckCircle2, XCircle, AlertCircle,
  ClipboardList, ChevronRight, ChevronLeft, Phone,
} from "lucide-react"
import Layout from "../components/Layout"
import { apiGet, apiPatch } from "../api/client"
import { useAuth } from "../contexts/AuthContext"

const STATUS_META = {
  PENDING:   { cls: "bg-amber-100 text-amber-800",  dot: "bg-amber-500",  icon: Clock },
  CONFIRMED: { cls: "bg-green-100 text-green-800",  dot: "bg-green-500",  icon: CheckCircle2 },
  CANCELLED: { cls: "bg-red-100 text-red-700",      dot: "bg-red-400",    icon: XCircle },
  COMPLETED: { cls: "bg-blue-100 text-blue-800",    dot: "bg-blue-500",   icon: CheckCircle2 },
  NO_SHOW:   { cls: "bg-gray-100 text-gray-600",    dot: "bg-gray-400",   icon: AlertCircle },
}

function StatusBadge({ status }) {
  const { t } = useTranslation()
  const m = STATUS_META[status] ?? { cls: "bg-gray-100 text-gray-600", icon: Clock }
  const Icon = m.icon
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${m.cls}`}>
      <Icon size={11} aria-hidden />
      {t(`appointments.status.${status.toLowerCase()}`)}
    </span>
  )
}

export default function DoctorDashboardPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const isRtl = lang === "ar"
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Algiers" })

  const { data: todayAppts = [], isLoading: loadingToday } = useQuery({
    queryKey: ["doctor-appointments-today", todayStr],
    queryFn: () => apiGet(`/doctor/appointments?date=${todayStr}`, lang),
  })

  const { data: allAppts = [] } = useQuery({
    queryKey: ["doctor-appointments"],
    queryFn: () => apiGet("/doctor/appointments", lang),
  })

  const pendingCount   = allAppts.filter(a => a.status === "PENDING").length
  const confirmedCount = allAppts.filter(a => a.status === "CONFIRMED").length
  const completedCount = allAppts.filter(a => a.status === "COMPLETED").length

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => apiPatch(`/doctor/appointments/${id}/status`, { status }, lang),
    onSuccess: () => {
      toast.success(t("appointments.statusUpdated"))
      qc.invalidateQueries({ queryKey: ["doctor-appointments-today"] })
      qc.invalidateQueries({ queryKey: ["doctor-appointments"] })
    },
    onError: () => toast.error(t("appointments.updateError")),
  })

  const formatTime = (iso) =>
    new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : "fr-DZ", {
      timeStyle: "short", timeZone: "Africa/Algiers",
    }).format(new Date(iso))

  const handleLogout = async () => { await logout(); navigate("/login", { replace: true }) }

  const initials = (name) =>
    (name ?? "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* ── Doctor hero card ── */}
        <div className="bg-gradient-to-br from-[#2C5F8A] to-[#1a4068] rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold shrink-0">
                {initials(user?.fullName)}
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">{user?.fullName}</p>
                <p className="text-blue-200 text-sm mt-0.5">{lang === "ar" ? "طبيب" : "Médecin"}</p>
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

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/20">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-300">{pendingCount}</p>
              <p className="text-xs text-blue-200 mt-0.5">{lang === "ar" ? "طلبات" : "En attente"}</p>
            </div>
            <div className="text-center border-x border-white/20">
              <p className="text-2xl font-bold text-green-300">{confirmedCount}</p>
              <p className="text-xs text-blue-200 mt-0.5">{lang === "ar" ? "مؤكدة" : "Confirmés"}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{completedCount}</p>
              <p className="text-xs text-blue-200 mt-0.5">{lang === "ar" ? "مكتملة" : "Terminés"}</p>
            </div>
          </div>
        </div>

        {/* ── Pending requests alert ── */}
        {pendingCount > 0 && (
          <Link
            to="/doctor/appointments"
            className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 hover:bg-amber-100 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <ClipboardList size={18} className="text-amber-600" aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {t("doctor.dashboard_.pendingCount", { count: pendingCount })}
                </p>
                <p className="text-xs text-amber-600">{lang === "ar" ? "انقر للمراجعة والتأكيد" : "Cliquez pour examiner"}</p>
              </div>
            </div>
            <ChevronIcon size={18} className="text-amber-500" aria-hidden />
          </Link>
        )}

        {/* ── Today's appointments ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800">{t("doctor.dashboard_.todayTitle")}</h2>
            <Link to="/doctor/appointments" className="text-xs text-[#2C5F8A] hover:underline font-medium">
              {lang === "ar" ? "عرض الكل" : "Voir tout"}
            </Link>
          </div>

          {loadingToday && (
            <div className="space-y-2">
              {[1,2].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!loadingToday && todayAppts.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
              <Calendar size={40} className="text-gray-200 mb-3 mx-auto" aria-hidden />
              <p className="text-gray-400 text-sm">{t("doctor.dashboard_.noToday")}</p>
            </div>
          )}

          {!loadingToday && todayAppts.length > 0 && (
            <div className="space-y-3">
              {todayAppts.map((appt) => {
                const meta = STATUS_META[appt.status] ?? STATUS_META.PENDING
                return (
                  <div key={appt.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <div className={`h-1 ${meta.dot}`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                        <div>
                          <p className="font-semibold text-gray-800">{appt.patient?.fullName ?? t("common.unknown")}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={11} aria-hidden />
                            {formatTime(appt.startsAt)}
                          </p>
                          {appt.patient?.phone && (
                            <a
                              href={`tel:${appt.patient.phone}`}
                              className="text-xs text-[#2C5F8A] flex items-center gap-1 mt-0.5 hover:underline"
                              dir="ltr"
                            >
                              <Phone size={11} aria-hidden />
                              {appt.patient.phone}
                            </a>
                          )}
                          {appt.reason && <p className="text-xs text-gray-400 mt-0.5">{appt.reason}</p>}
                        </div>
                        <StatusBadge status={appt.status} />
                      </div>

                      {/* PENDING actions */}
                      {appt.status === "PENDING" && (
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => updateStatus.mutate({ id: appt.id, status: "CONFIRMED" })}
                            disabled={updateStatus.isPending}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white py-2 rounded-xl text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle2 size={13} aria-hidden />
                            {t("appointments.confirm")}
                          </button>
                          <button
                            onClick={() => updateStatus.mutate({ id: appt.id, status: "CANCELLED" })}
                            disabled={updateStatus.isPending}
                            className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 py-2 rounded-xl text-xs font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                          >
                            <XCircle size={13} aria-hidden />
                            {t("appointments.cancel")}
                          </button>
                        </div>
                      )}

                      {/* CONFIRMED actions */}
                      {appt.status === "CONFIRMED" && (
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => updateStatus.mutate({ id: appt.id, status: "COMPLETED" })}
                            disabled={updateStatus.isPending}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 text-white py-2 rounded-xl text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle2 size={13} aria-hidden />
                            {t("appointments.markCompleted")}
                          </button>
                          <button
                            onClick={() => updateStatus.mutate({ id: appt.id, status: "NO_SHOW" })}
                            disabled={updateStatus.isPending}
                            className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-500 px-3 py-2 rounded-xl text-xs hover:bg-gray-50 disabled:opacity-50 transition-colors"
                          >
                            <AlertCircle size={13} aria-hidden />
                            {t("appointments.markNoShow")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* ── Quick actions ── */}
        <section>
          <h2 className="text-base font-semibold text-gray-800 mb-3">{lang === "ar" ? "الإجراءات السريعة" : "Actions rapides"}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { to: "/doctor/appointments",  icon: Calendar,     label: t("doctor.appointments.title"), color: "text-blue-600",   bg: "bg-blue-50" },
              { to: "/doctor/availability",  icon: Clock,        label: t("doctor.dashboard_.manageAvailability"), color: "text-teal-600", bg: "bg-teal-50" },
              { to: "/doctor/profile",       icon: UserCircle2,  label: t("doctor.dashboard_.editProfile"), color: "text-violet-600", bg: "bg-violet-50" },
              { to: "/doctor/security",      icon: ShieldCheck,  label: t("account.security.title"), color: "text-amber-600", bg: "bg-amber-50" },
            ].map((action) => {
              const ActionIcon = action.icon
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all flex flex-col items-center gap-2 text-center min-h-[88px] justify-center focus-visible:ring-2 focus-visible:ring-[#2C5F8A] focus-visible:outline-none"
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
