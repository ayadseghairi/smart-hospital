// src/pages/institution/InstitutionProfilePage.jsx
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Building2, Phone, Mail, Globe, Clock, MapPin, AlertCircle } from "lucide-react"
import Layout from "../../components/Layout"
import { apiGet, apiPatch } from "../../api/client"

const inp = "w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5F8A] focus:border-transparent"

function SectionCard({ icon, title, children }) {
  const CardIcon = icon
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <CardIcon size={16} className="text-[#2C5F8A]" aria-hidden />
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

export default function InstitutionProfilePage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const qc = useQueryClient()

  const { data: institution, isLoading } = useQuery({
    queryKey: ["institution-mine"],
    queryFn: () => apiGet("/institution/mine", lang),
  })

  const [form, setForm] = useState(null)
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
      try { openingHours = JSON.parse(form.openingHours) }
      catch { toast.error(t("instAdmin.profile.invalidJson")); return }
    }
    mutation.mutate({ ...form, openingHours })
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-8 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse h-24" />)}
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 py-8 space-y-5">

        {/* Banner */}
        <div className="bg-gradient-to-br from-[#2C5F8A] to-[#1a4068] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Building2 size={26} className="text-white" aria-hidden />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">
              {institution ? (lang === "ar" ? institution.nameAr : institution.nameFr) : "—"}
            </p>
            <p className="text-blue-200 text-xs mt-0.5">{institution?.type ?? ""}</p>
            <p className="text-blue-200 text-xs">
              {institution?.commune ? (lang === "ar" ? institution.commune?.nameAr : institution.commune?.nameFr) : ""}
            </p>
          </div>
        </div>

        {form && (
          <form onSubmit={handleSubmit} className="space-y-5">

            <SectionCard icon={Building2} title={lang === "ar" ? "الأسماء" : "Noms"}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{lang === "ar" ? "الاسم بالعربية" : "Nom en arabe"}</label>
                  <input className={inp} value={form.nameAr} onChange={e => setForm(f => ({ ...f, nameAr: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{lang === "ar" ? "الاسم بالفرنسية" : "Nom en français"}</label>
                  <input className={inp} dir="ltr" value={form.nameFr} onChange={e => setForm(f => ({ ...f, nameFr: e.target.value }))} />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={MapPin} title={lang === "ar" ? "العنوان" : "Adresse"}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{lang === "ar" ? "بالعربية" : "En arabe"}</label>
                  <input className={inp} value={form.addressAr} onChange={e => setForm(f => ({ ...f, addressAr: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{lang === "ar" ? "بالفرنسية" : "En français"}</label>
                  <input className={inp} dir="ltr" value={form.addressFr} onChange={e => setForm(f => ({ ...f, addressFr: e.target.value }))} />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={Phone} title={lang === "ar" ? "معلومات الاتصال" : "Contact"}>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5"><Phone size={12} aria-hidden />{t("auth.phone")}</label>
                  <input className={inp} dir="ltr" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5"><Mail size={12} aria-hidden />{t("auth.email")}</label>
                  <input className={inp} type="email" dir="ltr" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5"><Globe size={12} aria-hidden />Website</label>
                  <input className={inp} type="url" dir="ltr" value={form.website} placeholder="https://" onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
                </div>
              </div>
            </SectionCard>

            <SectionCard icon={Clock} title={lang === "ar" ? "ساعات العمل والطوارئ" : "Horaires & Urgences"}>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`w-10 h-6 rounded-full transition-colors relative ${form.hasEmergency24h ? "bg-red-500" : "bg-gray-300"}`}
                    onClick={() => setForm(f => ({ ...f, hasEmergency24h: !f.hasEmergency24h }))}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.hasEmergency24h ? (lang === "ar" ? "translate-x-[-100%] right-0.5" : "translate-x-full left-0.5") : "left-0.5"}`} />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{t("instAdmin.profile.emergency24h")}</span>
                </label>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("instAdmin.profile.openingHours")}</label>
                  <textarea rows={4} className={`${inp} font-mono text-xs resize-none`}
                    value={form.openingHours}
                    onChange={e => setForm(f => ({ ...f, openingHours: e.target.value }))}
                    placeholder={'{\n  "sunday": {"from":"08:00","to":"16:00"},\n  "monday": {"from":"08:00","to":"16:00"}\n}'} />
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={11} aria-hidden />{t("instAdmin.profile.openingHoursHint")}
                  </p>
                </div>
              </div>
            </SectionCard>

            <button type="submit" disabled={mutation.isPending}
              className="w-full bg-[#2C5F8A] text-white py-3 rounded-xl font-medium text-sm hover:bg-[#245075] disabled:opacity-50 transition-colors">
              {mutation.isPending ? t("common.loading") : t("common.save")}
            </button>
          </form>
        )}
      </div>
    </Layout>
  )
}
