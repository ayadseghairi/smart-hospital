// src/pages/DoctorDashboardPage.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
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

  if (isLoading) return <div className="max-w-5xl mx-auto px-4 py-10 text-center text-gray-500">{t("common.loading")}</div>
  if (error) return <div className="max-w-5xl mx-auto px-4 py-10 text-center text-red-500">{t("common.loadError")}</div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("doctor.dashboard")}</h1>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <i className="bx bx-calendar-check text-5xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">{t("appointments.noAppointments")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appt) => (
            <div key={appt.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-gray-800">{appt.patient?.fullName ?? t("common.unknown")}</p>
                  <p className="text-sm text-gray-500">{formatDate(appt.startsAt)}</p>
                  {appt.reason && <p className="text-sm text-gray-600 mt-1">{appt.reason}</p>}
                </div>
                <StatusBadge status={appt.status} />
              </div>

              {appt.status === "PENDING" && (
                <div className="mt-4 flex gap-3 justify-end">
                  <button
                    onClick={() => updateStatus.mutate({ id: appt.id, status: "CONFIRMED" })}
                    disabled={updateStatus.isPending}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {t("appointments.confirm")}
                  </button>
                  <button
                    onClick={() => updateStatus.mutate({ id: appt.id, status: "CANCELLED" })}
                    disabled={updateStatus.isPending}
                    className="border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-50 disabled:opacity-50"
                  >
                    {t("appointments.cancel")}
                  </button>
                </div>
              )}

              {appt.status === "CONFIRMED" && (
                <div className="mt-4 flex gap-3 justify-end">
                  <button
                    onClick={() => updateStatus.mutate({ id: appt.id, status: "COMPLETED" })}
                    disabled={updateStatus.isPending}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {t("appointments.markCompleted")}
                  </button>
                  <button
                    onClick={() => updateStatus.mutate({ id: appt.id, status: "NO_SHOW" })}
                    disabled={updateStatus.isPending}
                    className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t("appointments.markNoShow")}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
