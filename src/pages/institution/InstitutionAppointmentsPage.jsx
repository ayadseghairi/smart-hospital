import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import Layout from "../../components/Layout"
import { apiGet, apiPatch } from "../../api/client"

const STATUS_TABS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]
const STATUS_COLORS = { PENDING: "bg-yellow-100 text-yellow-800", CONFIRMED: "bg-green-100 text-green-800", COMPLETED: "bg-blue-100 text-blue-800", CANCELLED: "bg-gray-100 text-gray-600", NO_SHOW: "bg-red-100 text-red-700" }

export default function InstitutionAppointmentsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState("ALL")
  const [page, setPage] = useState(1)

  const params = new URLSearchParams({ page: String(page), limit: "20" })
  if (activeTab !== "ALL") params.set("status", activeTab)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["inst-appointments", activeTab, page],
    queryFn: () => apiGet(`/institution/mine/appointments?${params}`, lang),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => apiPatch(`/institution/mine/appointments/${id}/status`, { status }, lang),
    onSuccess: () => { toast.success(t("appointments.statusUpdated")); qc.invalidateQueries({ queryKey: ["inst-appointments"] }) },
    onError: () => toast.error(t("appointments.updateError")),
  })

  const appts = data?.appointments ?? []

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("instAdmin.appointments.title")}</h1>

        <div className="flex gap-2 border-b mb-4 overflow-x-auto">
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => { setActiveTab(s); setPage(1) }}
              className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 ${activeTab === s ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}>
              {s === "ALL" ? t("common.all") : t(`appointments.status.${s.toLowerCase()}`)}
            </button>
          ))}
        </div>

        {isLoading && <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />}
        {isError && <div className="text-center text-red-500 text-sm"><button onClick={() => refetch()}>{t("common.retry")}</button></div>}
        {!isLoading && appts.length === 0 && <p className="text-center text-gray-400 py-8">{t("instAdmin.appointments.empty")}</p>}

        <div className="space-y-3">
          {appts.map(a => (
            <div key={a.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-800">{a.patient?.fullName}</p>
                  <p className="text-sm text-gray-500">{a.doctor?.user?.fullName} · {new Date(a.startsAt).toLocaleString(lang === "ar" ? "ar-DZ" : "fr-DZ", { timeZone: "Africa/Algiers" })}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[a.status] ?? ""}`}>{t(`appointments.status.${a.status.toLowerCase()}`)}</span>
              </div>
              {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                <div className="flex gap-2 mt-3">
                  {a.status === "PENDING" && (
                    <button onClick={() => statusMutation.mutate({ id: a.id, status: "CONFIRMED" })}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700">{t("appointments.confirm")}</button>
                  )}
                  <button onClick={() => statusMutation.mutate({ id: a.id, status: "CANCELLED" })}
                    className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200">{t("appointments.cancel")}</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {data?.total > data?.limit && (
          <div className="flex gap-2 justify-center mt-6">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40">{t("common.prev")}</button>
            <button disabled={page * (data?.limit ?? 20) >= (data?.total ?? 0)} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40">{t("common.next")}</button>
          </div>
        )}
      </div>
    </Layout>
  )
}
