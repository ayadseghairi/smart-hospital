// src/pages/MyAppointmentsPage.jsx
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Calendar, Download } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { apiGet, apiPatch, apiFetch } from "../api/client"
import Layout from "../components/Layout"

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

const TAB_STATUSES = {
  upcoming:  ["PENDING", "CONFIRMED"],
  past:      ["COMPLETED", "NO_SHOW"],
  cancelled: ["CANCELLED"],
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

  const filtered = appointments.filter((a) => TAB_STATUSES[tab].includes(a.status))

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-10 text-center text-gray-500">
          {t("common.loading")}
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <p className="text-red-600 mb-4">{t("common.loadError")}</p>
          <button
            onClick={() => qc.invalidateQueries({ queryKey: ["my-appointments"] })}
            className="text-blue-600 hover:underline text-sm"
          >
            {t("common.retry")}
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("appointments.myTitle")}</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
          {(["upcoming", "past", "cancelled"]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t(`appointments.tabs.${key}`)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Calendar size={48} className="text-gray-300 mb-4 mx-auto" aria-hidden />
            <p className="text-gray-500">{t("appointments.noAppointments")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((appt) => (
              <div key={appt.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    {appt.doctor && (
                      <p className="font-semibold text-gray-800">
                        {appt.doctor.user.fullName}
                        {appt.doctor.specialty && (
                          <span className="font-normal text-gray-500 text-sm ms-2">
                            — {lang === "ar" ? appt.doctor.specialty.nameAr : appt.doctor.specialty.nameFr}
                          </span>
                        )}
                      </p>
                    )}
                    {appt.service && (
                      <p className="font-semibold text-gray-800">
                        {lang === "ar" ? appt.service.nameAr : appt.service.nameFr}
                      </p>
                    )}
                    {appt.institution && (
                      <p className="text-sm text-gray-500">
                        {lang === "ar" ? appt.institution.nameAr : appt.institution.nameFr}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">{formatDate(appt.startsAt)}</p>
                    {appt.reason && (
                      <p className="text-xs text-gray-400 mt-1">{appt.reason}</p>
                    )}
                  </div>
                  <StatusBadge status={appt.status} />
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    onClick={() => downloadIcs(appt.id)}
                    title={t("appointments.icsTooltip")}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                  >
                    <Download size={13} aria-hidden />
                    {t("appointments.downloadIcs")}
                  </button>
                  {(appt.status === "PENDING" || appt.status === "CONFIRMED") && (
                    <button
                      onClick={() => cancel.mutate(appt.id)}
                      disabled={cancel.isPending}
                      className="text-sm text-red-600 hover:underline disabled:opacity-50"
                    >
                      {t("appointments.cancel")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
