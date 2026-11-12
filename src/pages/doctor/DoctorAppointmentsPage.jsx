// src/pages/doctor/DoctorAppointmentsPage.jsx
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  Calendar, Clock, CheckCircle2, XCircle, AlertCircle,
  Building2, User,
} from "lucide-react"
import Layout from "../../components/Layout"
import { apiGet, apiPatch } from "../../api/client"

const STATUS_META = {
  PENDING:   { cls: "bg-amber-100 text-amber-800 border-amber-200",  dot: "bg-amber-500",  icon: Clock },
  CONFIRMED: { cls: "bg-green-100 text-green-800 border-green-200",  dot: "bg-green-500",  icon: CheckCircle2 },
  CANCELLED: { cls: "bg-red-100 text-red-700 border-red-200",        dot: "bg-red-400",    icon: XCircle },
  COMPLETED: { cls: "bg-blue-100 text-blue-800 border-blue-200",     dot: "bg-blue-500",   icon: CheckCircle2 },
  NO_SHOW:   { cls: "bg-gray-100 text-gray-600 border-gray-200",     dot: "bg-gray-400",   icon: AlertCircle },
}

function StatusBadge({ status }) {
  const { t } = useTranslation()
  const m = STATUS_META[status] ?? { cls: "bg-gray-100 text-gray-600 border-gray-200", icon: Clock }
  const Icon = m.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${m.cls}`}>
      <Icon size={11} aria-hidden />
      {t(`appointments.status.${status.toLowerCase()}`)}
    </span>
  )
}

const TABS = {
  pending:   ["PENDING"],
  confirmed: ["CONFIRMED"],
  history:   ["COMPLETED", "NO_SHOW", "CANCELLED"],
}

export default function DoctorAppointmentsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const qc = useQueryClient()
  const [tab, setTab] = useState("pending")

  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ["doctor-appointments"],
    queryFn: () => apiGet("/doctor/appointments", lang),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => apiPatch(`/doctor/appointments/${id}/status`, { status }, lang),
    onSuccess: () => {
      toast.success(t("appointments.statusUpdated"))
      qc.invalidateQueries({ queryKey: ["doctor-appointments"] })
    },
    onError: () => toast.error(t("appointments.updateError")),
  })

  const formatDate = (iso) =>
    new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : "fr-DZ", {
      dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Algiers",
    }).format(new Date(iso))

  const tabCounts = Object.fromEntries(
    Object.entries(TABS).map(([k, v]) => [k, appointments.filter(a => v.includes(a.status)).length])
  )
  const filtered = appointments.filter(a => TABS[tab].includes(a.status))

  if (isLoading) return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/5" />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )

  if (error) return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-red-500 text-sm mb-3">{t("common.loadError")}</p>
        <button onClick={() => qc.invalidateQueries({ queryKey: ["doctor-appointments"] })} className="text-sm text-[#2C5F8A] hover:underline">
          {t("common.retry")}
        </button>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("doctor.appointments.title")}</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {Object.keys(TABS).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t(`doctor.appointments.tabs.${key}`)}
              {tabCounts[key] > 0 && (
                <span className={`ms-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                  tab === key
                    ? key === "pending" ? "bg-amber-100 text-amber-700" : "bg-[#2C5F8A] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {tabCounts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Calendar size={48} className="text-gray-200 mb-4 mx-auto" aria-hidden />
            <p className="text-gray-400 font-medium">{t("doctor.appointments.noAppointments")}</p>
          </div>
        )}

        {/* Cards */}
        <div className="space-y-4">
          {filtered.map((appt) => {
            const meta = STATUS_META[appt.status] ?? STATUS_META.PENDING
            return (
              <div key={appt.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Status accent */}
                <div className={`h-1 ${meta.dot}`} />

                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                    <div>
                      <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                        <User size={14} className="text-gray-400 shrink-0" aria-hidden />
                        {appt.patient?.fullName ?? t("common.unknown")}
                      </p>
                      {appt.institution && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Building2 size={11} aria-hidden />
                          {lang === "ar" ? appt.institution.nameAr : appt.institution.nameFr}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>

                  {/* Date & reason */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                    <Clock size={13} className="text-gray-400" aria-hidden />
                    {formatDate(appt.startsAt)}
                  </div>
                  {appt.reason && (
                    <p className="text-xs text-gray-400 mt-1 pb-3 border-b border-gray-100">{appt.reason}</p>
                  )}

                  {/* PENDING: confirm or decline */}
                  {appt.status === "PENDING" && (
                    <div className="flex gap-2 pt-3">
                      <button
                        onClick={() => updateStatus.mutate({ id: appt.id, status: "CONFIRMED" })}
                        disabled={updateStatus.isPending}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle2 size={15} aria-hidden />
                        {t("doctor.appointments.confirm")}
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: appt.id, status: "CANCELLED" })}
                        disabled={updateStatus.isPending}
                        className="flex-1 flex items-center justify-center gap-1.5 border border-red-200 text-red-600 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <XCircle size={15} aria-hidden />
                        {t("doctor.appointments.decline")}
                      </button>
                    </div>
                  )}

                  {/* CONFIRMED: complete, no-show, or cancel */}
                  {appt.status === "CONFIRMED" && (
                    <div className="flex gap-2 pt-3 flex-wrap">
                      <button
                        onClick={() => updateStatus.mutate({ id: appt.id, status: "COMPLETED" })}
                        disabled={updateStatus.isPending}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-[#2C5F8A] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#245075] disabled:opacity-50 transition-colors"
                      >
                        <CheckCircle2 size={15} aria-hidden />
                        {t("doctor.appointments.markComplete")}
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: appt.id, status: "NO_SHOW" })}
                        disabled={updateStatus.isPending}
                        className="flex items-center justify-center gap-1.5 border border-gray-200 text-gray-500 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        <AlertCircle size={15} aria-hidden />
                        {t("doctor.appointments.markNoShow")}
                      </button>
                      <button
                        onClick={() => updateStatus.mutate({ id: appt.id, status: "CANCELLED" })}
                        disabled={updateStatus.isPending}
                        className="flex items-center justify-center gap-1.5 border border-red-200 text-red-500 px-4 py-2.5 rounded-xl text-sm hover:bg-red-50 disabled:opacity-50 transition-colors"
                      >
                        <XCircle size={15} aria-hidden />
                        {t("doctor.appointments.cancel")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
