// src/pages/doctor/DoctorAppointmentsPage.jsx
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import Layout from "../../components/Layout"
import { apiGet, apiPatch } from "../../api/client"

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

  const filtered = appointments.filter((a) => TAB_STATUSES[tab].includes(a.status))

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-10 text-center text-gray-400 text-sm">
          {t("common.loading")}
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-10 text-center">
          <p className="text-red-500 text-sm mb-2">{t("common.loadError")}</p>
          <button onClick={() => qc.invalidateQueries({ queryKey: ["doctor-appointments"] })} className="text-blue-600 text-sm hover:underline">
            {t("common.retry")}
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("doctor.appointments.title")}</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
          {(["pending", "confirmed", "history"]).map((key) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === key ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t(`doctor.appointments.tabs.${key}`)}
              {key === "pending" && appointments.filter((a) => a.status === "PENDING").length > 0 && (
                <span className="ms-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {appointments.filter((a) => a.status === "PENDING").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <i className="bx bx-calendar text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">{t("doctor.appointments.noAppointments")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((appt) => (
              <div key={appt.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-gray-800">{appt.patient?.fullName ?? t("common.unknown")}</p>
                    {appt.institution && (
                      <p className="text-sm text-gray-500">
                        {lang === "ar" ? appt.institution.nameAr : appt.institution.nameFr}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">{formatDate(appt.startsAt)}</p>
                    {appt.reason && <p className="text-xs text-gray-400 mt-0.5">{appt.reason}</p>}
                  </div>
                  <StatusBadge status={appt.status} />
                </div>

                {appt.status === "PENDING" && (
                  <div className="mt-4 flex gap-2 justify-end">
                    <button
                      onClick={() => updateStatus.mutate({ id: appt.id, status: "CONFIRMED" })}
                      disabled={updateStatus.isPending}
                      className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      {t("doctor.appointments.confirm")}
                    </button>
                    <button
                      onClick={() => updateStatus.mutate({ id: appt.id, status: "CANCELLED" })}
                      disabled={updateStatus.isPending}
                      className="border border-red-300 text-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50"
                    >
                      {t("doctor.appointments.decline")}
                    </button>
                  </div>
                )}

                {appt.status === "CONFIRMED" && (
                  <div className="mt-4 flex gap-2 justify-end flex-wrap">
                    <button
                      onClick={() => updateStatus.mutate({ id: appt.id, status: "COMPLETED" })}
                      disabled={updateStatus.isPending}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {t("doctor.appointments.markComplete")}
                    </button>
                    <button
                      onClick={() => updateStatus.mutate({ id: appt.id, status: "NO_SHOW" })}
                      disabled={updateStatus.isPending}
                      className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      {t("doctor.appointments.markNoShow")}
                    </button>
                    <button
                      onClick={() => updateStatus.mutate({ id: appt.id, status: "CANCELLED" })}
                      disabled={updateStatus.isPending}
                      className="border border-red-300 text-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50"
                    >
                      {t("doctor.appointments.cancel")}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
