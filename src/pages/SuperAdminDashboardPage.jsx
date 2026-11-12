// src/pages/SuperAdminDashboardPage.jsx
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { apiGet, apiPost, apiPatch } from "../api/client"

// ─── Create Institution Form ────────────────────────────────────────────────
function CreateInstitutionPanel({ lang }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [form, setForm] = useState({ nameAr: "", nameFr: "", type: "EPH", sector: "PUBLIC", addressAr: "", communeId: "" })
  const [loading, setLoading] = useState(false)
  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) })

  const create = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiPost("/admin/institutions", {
        ...form,
        communeId: form.communeId ? parseInt(form.communeId) : undefined,
      }, lang)
      toast.success(t("admin.institutionCreated"))
      setForm({ nameAr: "", nameFr: "", type: "EPH", sector: "PUBLIC", addressAr: "", communeId: "" })
      qc.invalidateQueries({ queryKey: ["admin-institutions"] })
    } catch {
      toast.error(t("admin.createError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{t("admin.createInstitution")}</h2>
      <form onSubmit={create} className="grid grid-cols-2 gap-4">
        <input placeholder={t("institution.nameAr")} required className="input-field" {...f("nameAr")} />
        <input placeholder={t("institution.nameFr")} required className="input-field" dir="ltr" {...f("nameFr")} />
        <select className="input-field" {...f("type")}>
          {["CHU","EPH","EPSP","EHS","POLYCLINIC","PRIVATE_CLINIC","PRIVATE_LAB","PRIVATE_IMAGING","PHARMACY"].map(v =>
            <option key={v} value={v}>{v}</option>
          )}
        </select>
        <select className="input-field" {...f("sector")}>
          <option value="PUBLIC">{t("institution.public")}</option>
          <option value="PRIVATE">{t("institution.private")}</option>
        </select>
        <input placeholder={t("institution.address")} className="input-field col-span-2" {...f("addressAr")} />
        <button type="submit" disabled={loading}
          className="col-span-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? t("common.loading") : t("admin.createInstitution")}
        </button>
      </form>
    </div>
  )
}

// ─── Create Doctor Form ─────────────────────────────────────────────────────
function CreateDoctorPanel({ lang }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [form, setForm] = useState({ fullName: "", email: "", specialtyId: "" })
  const [loading, setLoading] = useState(false)
  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) })

  const { data: specialties = [] } = useQuery({
    queryKey: ["specialties"],
    queryFn: () => apiGet("/admin/specialties", lang),
  })

  const create = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiPost("/admin/doctors", form, lang)
      toast.success(t("admin.doctorCreated"))
      setForm({ fullName: "", email: "", specialtyId: "" })
      qc.invalidateQueries({ queryKey: ["admin-doctors"] })
    } catch {
      toast.error(t("admin.createError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{t("admin.createDoctor")}</h2>
      <form onSubmit={create} className="space-y-3">
        <input placeholder={t("auth.fullName")} required className="input-field w-full" {...f("fullName")} />
        <input placeholder={t("auth.email")} type="email" required dir="ltr" className="input-field w-full" {...f("email")} />
        <select className="input-field w-full" {...f("specialtyId")} required>
          <option value="">{t("admin.selectSpecialty")}</option>
          {specialties.map(s => <option key={s.id} value={s.id}>{lang === "ar" ? s.nameAr : s.nameFr}</option>)}
        </select>
        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? t("common.loading") : t("admin.createDoctor")}
        </button>
      </form>
    </div>
  )
}

// ─── Users List ─────────────────────────────────────────────────────────────
function UsersPanel({ lang }) {
  const { t } = useTranslation()
  const qc = useQueryClient()

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => apiGet("/admin/users", lang),
  })
  const users = usersData?.users ?? []

  const deactivate = useMutation({
    mutationFn: (id) => apiPatch(`/admin/users/${id}/deactivate`, {}, lang),
    onSuccess: () => { toast.success(t("admin.deactivated")); qc.invalidateQueries({ queryKey: ["admin-users"] }) },
    onError: () => toast.error(t("admin.updateError")),
  })
  const reactivate = useMutation({
    mutationFn: (id) => apiPatch(`/admin/users/${id}/reactivate`, {}, lang),
    onSuccess: () => { toast.success(t("admin.reactivated")); qc.invalidateQueries({ queryKey: ["admin-users"] }) },
    onError: () => toast.error(t("admin.updateError")),
  })
  const resendInvite = useMutation({
    mutationFn: (id) => apiPost(`/admin/users/${id}/resend-invite`, {}, lang),
    onSuccess: () => toast.success(t("admin.inviteResent")),
    onError: () => toast.error(t("admin.inviteError")),
  })

  if (isLoading) return <p className="text-gray-500 text-sm">{t("common.loading")}</p>

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{t("admin.users")}</h2>

      {/* Desktop table — hidden on small screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-start text-gray-500 border-b">
              <th className="pb-2 font-medium text-start">{t("auth.fullName")}</th>
              <th className="pb-2 font-medium text-start">{t("auth.email")}</th>
              <th className="pb-2 font-medium text-start">{t("admin.role")}</th>
              <th className="pb-2 font-medium text-start">{t("admin.status")}</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="py-3">{u.fullName}</td>
                <td className="py-3 text-gray-500" dir="ltr">{u.email}</td>
                <td className="py-3">{u.role}</td>
                <td className="py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {u.isActive ? t("admin.active") : t("admin.inactive")}
                  </span>
                </td>
                <td className="py-3 flex gap-2">
                  {u.isActive
                    ? <button onClick={() => deactivate.mutate(u.id)} className="text-red-600 hover:underline text-xs min-h-[44px] flex items-center">{t("admin.deactivate")}</button>
                    : <button onClick={() => reactivate.mutate(u.id)} className="text-green-600 hover:underline text-xs min-h-[44px] flex items-center">{t("admin.reactivate")}</button>
                  }
                  {u.mustSetPassword && (
                    <button onClick={() => resendInvite.mutate(u.id)} className="text-blue-600 hover:underline text-xs ms-2 min-h-[44px] flex items-center">{t("admin.resendInvite")}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center text-gray-400 py-4">{t("admin.noUsers")}</p>}
      </div>

      {/* Mobile card list — shown below md */}
      <div className="md:hidden space-y-3">
        {users.length === 0 && <p className="text-center text-gray-400 py-4">{t("admin.noUsers")}</p>}
        {users.map(u => (
          <div key={u.id} className="border border-gray-200 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-gray-800 text-sm">{u.fullName}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {u.isActive ? t("admin.active") : t("admin.inactive")}
              </span>
            </div>
            <p className="text-xs text-gray-400" dir="ltr">{u.email}</p>
            <p className="text-xs text-gray-500">{u.role}</p>
            <div className="flex gap-3 pt-1">
              {u.isActive
                ? <button onClick={() => deactivate.mutate(u.id)} className="text-red-600 text-xs min-h-[44px] flex items-center hover:underline">{t("admin.deactivate")}</button>
                : <button onClick={() => reactivate.mutate(u.id)} className="text-green-600 text-xs min-h-[44px] flex items-center hover:underline">{t("admin.reactivate")}</button>
              }
              {u.mustSetPassword && (
                <button onClick={() => resendInvite.mutate(u.id)} className="text-blue-600 text-xs min-h-[44px] flex items-center hover:underline">{t("admin.resendInvite")}</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main dashboard ──────────────────────────────────────────────────────────
export default function SuperAdminDashboardPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const [tab, setTab] = useState("users")

  const tabs = [
    { key: "users", label: t("admin.users") },
    { key: "institution", label: t("admin.createInstitution") },
    { key: "doctor", label: t("admin.createDoctor") },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("admin.superTitle")}</h1>

      <div className="flex gap-2 mb-6 border-b">
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`pb-3 px-4 text-sm font-medium border-b-2 transition-colors ${tab === key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "users" && <UsersPanel lang={lang} />}
      {tab === "institution" && <CreateInstitutionPanel lang={lang} />}
      {tab === "doctor" && <CreateDoctorPanel lang={lang} />}
    </div>
  )
}
