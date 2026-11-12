// src/pages/MyAppointmentsPage.jsx
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import {
  Calendar, Download, Clock, CheckCircle2, XCircle,
  Stethoscope, Building2, FileText, AlertCircle,
} from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { apiGet, apiPatch, apiFetch } from "../api/client"
import Layout from "../components/Layout"

const STATUS_META = {
  PENDING:   { cls: "bg-amber-100 text-amber-800 border-amber-200",  dot: "bg-amber-500",  icon: Clock },
  CONFIRMED: { cls: "bg-green-100 text-green-800 border-green-200",  dot: "bg-green-500",  icon: CheckCircle2 },
  CANCELLED: { cls: "bg-red-100 text-red-700 border-red-200",        dot: "bg-red-400",    icon: XCircle },
  COMPLETED: { cls: "bg-blue-100 text-blue-800 border-blue-200",     dot: "bg-blue-500",   icon: CheckCircle2 },
  NO_SHOW:   { cls: "bg-gray-100 text-gray-600 border-gray-200",     dot: "bg-gray-400",   icon: AlertCircle },
}

function StatusBadge({ status }) {
  const { t } = useTranslation()
  const m = STATUS_META[status] ?? { cls: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400", icon: Clock }
  const Icon = m.icon
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border ${m.cls}`}>
      <Icon size={11} aria-hidden />
      {t(`appointments.status.${status.toLowerCase()}`)}
    </span>
  )
}

const TABS = {
  upcoming:  { statuses: ["PENDING","CONFIRMED"], color: "text-blue-600" },
  past:      { statuses: ["COMPLETED","NO_SHOW"], color: "text-gray-600" },
  cancelled: { statuses: ["CANCELLED"],           color: "text-red-500" },
}

export default function MyAppointmentsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const { user } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState("upcoming")

  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: () => apiGet("/appointments/mine", lang),
    enabled: !!user,
  })

  const cancel = useMutation({
    mutationFn: (id) => apiPatch(`/appointments/${id}/cancel`, {}, lang),
    onSuccess: () => {
      toast.success(t("appointments.cancelSuccess"))
      qc.invalidateQueries({ queryKey: ["my-appointments"] })
    },
    onError: () => toast.error(t("appointments.cancelError")),
  })

  const downloadIcs = async (id) => {
    try {
      const res = await apiFetch(`/appointments/${id}/ics`, { method: "GET" }, lang)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `appointment-${id}.ics`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error(t("common.error"))
    }
  }

  const formatDate = (iso) =>
    new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : "fr-DZ", {
      dateStyle: "long", timeStyle: "short", timeZone: "Africa/Algiers",
    }).format(new Date(iso))

  const tabCounts = Object.fromEntries(
    Object.entries(TABS).map(([k, v]) => [k, appointments.filter(a => v.statuses.includes(a.status)).length])
  )
  const filtered = appointments.filter(a => TABS[tab].statuses.includes(a.status))

  if (isLoading) return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )

  if (error) return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-red-500 text-sm mb-3">{t("common.loadError")}</p>
        <button onClick={() => qc.invalidateQueries({ queryKey: ["my-appointments"] })} className="text-sm text-[#2C5F8A] hover:underline">
          {t("common.retry")}
        </button>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("appointments.myTitle")}</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {Object.entries(TABS).map(([key]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                tab === key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t(`appointments.tabs.${key}`)}
              {tabCounts[key] > 0 && (
                <span className={`ms-1.5 text-xs font-bold ${tab === key ? "text-[#2C5F8A]" : "text-gray-400"}`}>
                  {tabCounts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Calendar size={48} className="text-gray-200 mb-4 mx-auto" aria-hidden />
            <p className="text-gray-400 font-medium">{t("appointments.noAppointments")}</p>
          </div>
        )}

        {/* Cards */}
        <div className="space-y-4">
          {filtered.map((appt) => {
            const meta = STATUS_META[appt.status] ?? STATUS_META.PENDING
            return (
              <div key={appt.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                {/* Colored top accent */}
                <div className={`h-1 ${meta.dot}`} />

                <div className="p-5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                    <div>
                      {appt.doctor && (
                        <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                          <Stethoscope size={14} className="text-[#2C5F8A] shrink-0" aria-hidden />
                          {appt.doctor.user.fullName}
                          {appt.doctor.specialty && (
                            <span className="font-normal text-gray-400 text-sm">
                              · {lang === "ar" ? appt.doctor.specialty.nameAr : appt.doctor.specialty.nameFr}
                            </span>
                          )}
                        </p>
                      )}
                      {appt.service && !appt.doctor && (
                        <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                          <FileText size={14} className="text-[#2C5F8A] shrink-0" aria-hidden />
                          {lang === "ar" ? appt.service.nameAr : appt.service.nameFr}
                        </p>
                      )}
                      {appt.institution && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Building2 size={11} aria-hidden />
                          {lang === "ar" ? appt.institution.nameAr : appt.institution.nameFr}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                    <Clock size={13} className="text-gray-400" aria-hidden />
                    {formatDate(appt.startsAt)}
                  </div>

                  {/* Reason */}
                  {appt.reason && (
                    <p className="text-xs text-gray-400 mt-1 border-t border-gray-50 pt-2">{appt.reason}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100 flex-wrap">
                    <button
                      onClick={() => downloadIcs(appt.id)}
                      title={t("appointments.icsTooltip")}
                      className="flex items-center gap-1.5 text-xs text-[#2C5F8A] hover:underline"
                    >
                      <Download size={13} aria-hidden />
                      {t("appointments.downloadIcs")}
                    </button>
                    {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                      <button
                        onClick={() => cancel.mutate(appt.id)}
                        disabled={cancel.isPending}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <XCircle size={13} aria-hidden />
                        {t("appointments.cancel")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
