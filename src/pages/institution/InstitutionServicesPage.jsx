import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import Layout from "../../components/Layout"
import { apiGet, apiPost, apiDelete } from "../../api/client"

const CATEGORIES = ["IMAGING", "LAB", "NURSING", "PHARMACY"]

export default function InstitutionServicesPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState("IMAGING")
  const [showForm, setShowForm] = useState(false)
  const [newService, setNewService] = useState({ nameAr: "", nameFr: "", category: "IMAGING", priceDZD: "", durationMin: "30", isActive: true })

  const { data: services = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["inst-services"],
    queryFn: () => apiGet("/institution/mine/services", lang),
  })

  const createMutation = useMutation({
    mutationFn: (data) => apiPost("/institution/mine/services", data, lang),
    onSuccess: () => { toast.success(t("instAdmin.services.created")); qc.invalidateQueries({ queryKey: ["inst-services"] }); setShowForm(false) },
    onError: () => toast.error(t("common.error")),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id) => apiDelete(`/institution/mine/services/${id}`, lang),
    onSuccess: () => { toast.success(t("instAdmin.services.deactivated")); qc.invalidateQueries({ queryKey: ["inst-services"] }) },
    onError: () => toast.error(t("common.error")),
  })

  const filtered = services.filter(s => s.category === activeTab)

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{t("instAdmin.services.title")}</h1>
          <button onClick={() => setShowForm(v => !v)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            {showForm ? t("common.cancel") : t("instAdmin.services.addService")}
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <form onSubmit={e => { e.preventDefault(); createMutation.mutate({ ...newService, priceDZD: newService.priceDZD ? parseInt(newService.priceDZD) : undefined, durationMin: parseInt(newService.durationMin), category: activeTab }) }}
            className="bg-white border border-gray-200 rounded-xl p-6 mb-6 space-y-3">
            {[["nameAr", t("institution.nameAr")], ["nameFr", t("institution.nameFr")]].map(([f, label]) => (
              <div key={f}>
                <label className="block text-sm text-gray-700 mb-1">{label}</label>
                <input required className="input-field" value={newService[f]} onChange={e => setNewService(n => ({ ...n, [f]: e.target.value }))} />
              </div>
            ))}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-gray-700 mb-1">{t("instAdmin.services.price")}</label>
                <input type="number" min="0" className="input-field" value={newService.priceDZD} onChange={e => setNewService(n => ({ ...n, priceDZD: e.target.value }))} placeholder={t("instAdmin.services.priceOptional")} />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-700 mb-1">{t("instAdmin.services.duration")}</label>
                <input type="number" min="5" required className="input-field" value={newService.durationMin} onChange={e => setNewService(n => ({ ...n, durationMin: e.target.value }))} />
              </div>
            </div>
            <button type="submit" disabled={createMutation.isPending} className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {createMutation.isPending ? t("common.loading") : t("instAdmin.services.addService")}
            </button>
          </form>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 border-b mb-4">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 text-sm border-b-2 ${activeTab === cat ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"}`}>
              {t(`instAdmin.services.category.${cat.toLowerCase()}`)}
            </button>
          ))}
        </div>

        {isLoading && <div className="animate-pulse h-20 bg-gray-100 rounded-xl" />}
        {isError && <div className="text-center text-red-500 text-sm"><button onClick={() => refetch()}>{t("common.retry")}</button></div>}

        {!isLoading && filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">{t("instAdmin.services.empty")}</p>
        )}

        <div className="space-y-3">
          {filtered.map(s => (
            <div key={s.id} className={`bg-white border rounded-xl p-4 flex items-center justify-between ${!s.isActive ? "opacity-50" : ""}`}>
              <div>
                <p className="font-medium text-gray-800">{lang === "ar" ? s.nameAr : s.nameFr}</p>
                <p className="text-sm text-gray-500">
                  {s.priceDZD != null ? `${s.priceDZD.toLocaleString()} دج` : t("instAdmin.services.priceUnknown")} · {s.durationMin} {t("instAdmin.services.min")}
                </p>
              </div>
              {s.isActive && (
                <button onClick={() => deactivateMutation.mutate(s.id)} className="text-red-500 text-xs hover:underline">
                  {t("instAdmin.services.deactivate")}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
