import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import Layout from "../../components/Layout"
import { apiGet, apiPatch } from "../../api/client"

export default function InstitutionProfilePage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const qc = useQueryClient()

  const { data: institution, isLoading } = useQuery({
    queryKey: ["institution-mine"],
    queryFn: () => apiGet("/institution/mine", lang),
  })

  const [form, setForm] = useState(null)

  // Initialize form from fetched data
  if (institution && !form) {
    setForm({
      nameAr: institution.nameAr ?? "",
      nameFr: institution.nameFr ?? "",
      addressAr: institution.addressAr ?? "",
      addressFr: institution.addressFr ?? "",
      phone: institution.phone ?? "",
      email: institution.email ?? "",
      website: institution.website ?? "",
      hasEmergency24h: institution.hasEmergency24h ?? false,
      openingHours: institution.openingHours ? JSON.stringify(institution.openingHours, null, 2) : "",
    })
  }

  const mutation = useMutation({
    mutationFn: (data) => apiPatch("/institution/mine", data, lang),
    onSuccess: () => {
      toast.success(t("instAdmin.profile.saved"))
      qc.invalidateQueries({ queryKey: ["institution-mine"] })
    },
    onError: () => toast.error(t("common.error")),
  })

  function handleSubmit(e) {
    e.preventDefault()
    let openingHours = undefined
    if (form.openingHours) {
      try { openingHours = JSON.parse(form.openingHours) } catch { toast.error(t("instAdmin.profile.invalidJson")); return }
    }
    mutation.mutate({ ...form, openingHours })
  }

  if (isLoading) return <Layout><div className="max-w-2xl mx-auto px-4 py-8 animate-pulse h-40 bg-gray-100 rounded-xl mt-8" /></Layout>

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("instAdmin.profile.title")}</h1>
        {form && (
          <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-xl border border-gray-200 p-6">
            {[
              ["nameAr", t("institution.nameAr")],
              ["nameFr", t("institution.nameFr")],
              ["addressAr", t("institution.address") + " (ar)"],
              ["addressFr", t("institution.address") + " (fr)"],
              ["phone", t("auth.phone")],
              ["email", t("auth.email")],
              ["website", "Website"],
            ].map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input className="input-field" value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="emergency" checked={form.hasEmergency24h}
                onChange={e => setForm(f => ({ ...f, hasEmergency24h: e.target.checked }))} />
              <label htmlFor="emergency" className="text-sm text-gray-700">{t("instAdmin.profile.emergency24h")}</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("instAdmin.profile.openingHours")}</label>
              <textarea rows={4} className="input-field font-mono text-xs"
                value={form.openingHours}
                onChange={e => setForm(f => ({ ...f, openingHours: e.target.value }))}
                placeholder={'{\n  "sunday": {"from":"08:00","to":"16:00"},\n  "monday": {"from":"08:00","to":"16:00"}\n}'} />
              <p className="text-xs text-gray-400 mt-1">{t("instAdmin.profile.openingHoursHint")}</p>
            </div>
            <button type="submit" disabled={mutation.isPending}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {mutation.isPending ? t("common.loading") : t("common.save")}
            </button>
          </form>
        )}
      </div>
    </Layout>
  )
}
