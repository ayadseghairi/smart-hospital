// src/pages/DoctorDashboardPage.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { ChevronLeft, CalendarCheck, Clock, UserCircle2 } from "lucide-react"
import Layout from "../components/Layout"
import { apiGet, apiPatch } from "../api/client"

function StatusBadge({ status }) {
  const { t } = useTranslation()
  const MAP = {
    PENDING:   "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    COMPLETED: "bg-blue-100 text-blue-800",
    NO_SHOW:   "bg-gray-100 text-gray-800",
  }
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${MAP[status] ?? "bg-gray-100 text-gray-600"}`}>
      {t(`appointments.status.${status.toLowerCase()}`)}
    </span>
  )
}

export default function DoctorDashboardPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const qc = useQueryClient()

  // Today's appointments
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Algiers" }) // YYYY-MM-DD
  const { data: todayAppts = [], isLoading: loadingToday, error: errorToday } = useQuery({
    queryKey: ["doctor-appointments-today", todayStr],
    queryFn: () => apiGet(`/doctor/appointments?date=${todayStr}`, lang),
  })

  // Pending appointments count
  const { data: allAppts = [] } = useQuery({
    queryKey: ["doctor-appointments"],
    queryFn: () => apiGet("/doctor/appointments", lang),
  })
  const pendingCount = allAppts.filter((a) => a.status === "PENDING").length

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => apiPatch(`/doctor/appointments/${id}/status`, { status }, lang),
    onSuccess: () => {
      toast.success(t("appointments.statusUpdated"))
      qc.invalidateQueries({ queryKey: ["doctor-appointments-today"] })
      qc.invalidateQueries({ queryKey: ["doctor-appointments"] })
    },
    onError: () => toast.error(t("appointments.updateError")),
  })

  const formatDate = (iso) =>
    new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : "fr-DZ", {
      timeStyle: "short", timeZone: "Africa/Algiers",
    }).format(new Date(iso))

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("doctor.dashboard")}</h1>

        {/* Pending requests banner */}
        {pendingCount > 0 && (
          <Link to="/doctor/appointments" className="block focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:outline-none rounded-xl">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-6 flex items-center justify-between hover:bg-amber-100 transition-colors min-h-[56px]">
              <span className="text-amber-800 text-sm font-medium">
                {t("doctor.dashboard_.pendingCount", { count: pendingCount })}
              </span>
              <ChevronLeft size={20} className="text-amber-600 rtl:rotate-180" aria-hidden />
            </div>
          </Link>
        )}

        {/* Today's appointments */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-3">{t("doctor.dashboard_.todayTitle")}</h2>

          {loadingToday && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm animate-pulse">
              {t("common.loading")}
            </div>
          )}
          {errorToday && (
            <p className="text-red-500 text-sm">{t("common.loadError")}</p>
          )}
          {!loadingToday && !errorToday && todayAppts.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <CalendarCheck size={40} className="text-gray-300 mb-2 mx-auto" aria-hidden />
              <p className="text-gray-500 text-sm">{t("doctor.dashboard_.noToday")}</p>
            </div>
          )}
          {!loadingToday && !errorToday && todayAppts.length > 0 && (
            <div className="space-y-3">
              {todayAppts.map((appt) => (
                <div key={appt.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-medium text-gray-800">{appt.patient?.fullName ?? t("common.unknown")}</p>
                      <p className="text-sm text-gray-500">{formatDate(appt.startsAt)}</p>
                      {appt.reason && <p className="text-xs text-gray-400 mt-0.5">{appt.reason}</p>}
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                  {appt.status === "PENDING" && (
                    <div className="mt-3 flex gap-2 justify-end">
                      <button
                        onClick={() => updateStatus.mutate({ id: appt.id, status: "CONFIRMED" })}
                        disabled={updateStatus.isPending}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-green-700 disabled:opacity-50"
                      >
                        {t("appointments.confirm")}
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: appt.id, status: "CANCELLED" })}
                        disabled={updateStatus.isPending}
                        className="border border-red-300 text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-50 disabled:opacity-50"
                      >
                        {t("appointments.cancel")}
                      </button>
                    </div>
                  )}
                  {appt.status === "CONFIRMED" && (
                    <div className="mt-3 flex gap-2 justify-end">
                      <button
                        onClick={() => updateStatus.mutate({ id: appt.id, status: "COMPLETED" })}
                        disabled={updateStatus.isPending}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50"
                      >
                        {t("appointments.markCompleted")}
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: appt.id, status: "NO_SHOW" })}
                        disabled={updateStatus.isPending}
                        className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-50"
                      >
                        {t("appointments.markNoShow")}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/doctor/availability" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all text-center min-h-[88px] flex flex-col items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
              <Clock size={24} className="text-blue-600 mb-2" aria-hidden />
              <p className="text-sm font-medium text-gray-700">{t("doctor.dashboard_.manageAvailability")}</p>
            </Link>
            <Link to="/doctor/profile" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all text-center min-h-[88px] flex flex-col items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
              <UserCircle2 size={24} className="text-blue-600 mb-2" aria-hidden />
              <p className="text-sm font-medium text-gray-700">{t("doctor.dashboard_.editProfile")}</p>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  )
}
