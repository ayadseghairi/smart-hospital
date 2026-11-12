// src/pages/SuperAdminDashboardPage.jsx
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  LayoutDashboard, Users, Building2, Stethoscope,
  ScrollText, Settings, LogOut, ChevronRight, ChevronLeft,
  Shield, Activity, ClipboardList, UserCog, Plus, Pencil, Trash2, CheckCircle2, XCircle,
} from "lucide-react"
import { apiGet, apiPost, apiPatch, apiDelete } from "../api/client"
import { useAuth } from "../contexts/AuthContext"

const inp = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5F8A] focus:border-transparent"

// ─── Stats Panel ─────────────────────────────────────────────────────────────
function StatsPanel({ lang }) {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => apiGet("/admin/stats", lang),
    staleTime: 60_000,
  })

  const cards = [
    { label: lang === "ar" ? "المستخدمون" : "Utilisateurs", value: (stats?.patients ?? 0) + (stats?.doctors ?? 0), icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: lang === "ar" ? "الأطباء" : "Médecins", value: stats?.doctors ?? 0, icon: Stethoscope, color: "bg-teal-50 text-teal-600" },
    { label: lang === "ar" ? "المؤسسات" : "Établissements", value: stats?.institutions?.total ?? 0, icon: Building2, color: "bg-purple-50 text-purple-600" },
    { label: lang === "ar" ? "مواعيد معلقة" : "RDV en attente", value: stats?.pendingAppointments ?? 0, icon: ClipboardList, color: "bg-amber-50 text-amber-600" },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">{lang === "ar" ? "نظرة عامة" : "Vue d'ensemble"}</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const CardIcon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} mb-3`}>
                <CardIcon size={20} aria-hidden />
              </div>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            </div>
          )
        })}
      </div>
      {stats?.institutions && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">{lang === "ar" ? "حالة المؤسسات" : "Statut des établissements"}</h3>
          <div className="flex gap-6 flex-wrap">
            <span className="text-sm"><span className="font-bold text-green-600">{stats.institutions.verified}</span> <span className="text-gray-500">{lang === "ar" ? "موثقة" : "vérifiés"}</span></span>
            <span className="text-sm"><span className="font-bold text-amber-500">{stats.institutions.draft}</span> <span className="text-gray-500">{lang === "ar" ? "مسودة" : "brouillons"}</span></span>
            <span className="text-sm"><span className="font-bold text-red-500">{stats.institutions.suspended}</span> <span className="text-gray-500">{lang === "ar" ? "موقوفة" : "suspendus"}</span></span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Users Panel ──────────────────────────────────────────────────────────────
function UsersPanel({ lang }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [q, setQ] = useState("")

  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users", q],
    queryFn: () => apiGet(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`, lang),
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

  const ROLE_BADGE = {
    PATIENT: "bg-blue-100 text-blue-700",
    DOCTOR: "bg-teal-100 text-teal-700",
    INSTITUTION_ADMIN: "bg-purple-100 text-purple-700",
    SUPER_ADMIN: "bg-red-100 text-red-700",
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-bold text-gray-800">{t("admin.users")}</h2>
        <form onSubmit={(e) => { e.preventDefault(); setQ(search) }} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "ar" ? "بحث بالاسم أو الإيميل…" : "Rechercher par nom ou email…"}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-[#2C5F8A]"
          />
          <button type="submit" className="bg-[#2C5F8A] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#245075]">
            {lang === "ar" ? "بحث" : "Chercher"}
          </button>
        </form>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">{t("common.loading")}</p>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{t("auth.fullName")}</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{t("auth.email")}</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{t("admin.role")}</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{t("admin.status")}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">{t("admin.noUsers")}</td></tr>
                )}
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.fullName}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs" dir="ltr">{u.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_BADGE[u.role] ?? "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.isActive ? t("admin.active") : t("admin.inactive")}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex items-center gap-3">
                      {u.isActive
                        ? <button onClick={() => deactivate.mutate(u.id)} className="text-red-600 hover:underline text-xs">{t("admin.deactivate")}</button>
                        : <button onClick={() => reactivate.mutate(u.id)} className="text-green-600 hover:underline text-xs">{t("admin.reactivate")}</button>
                      }
                      {u.mustSetPassword && (
                        <button onClick={() => resendInvite.mutate(u.id)} className="text-blue-600 hover:underline text-xs">{t("admin.resendInvite")}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {users.length === 0 && <p className="text-center text-gray-400 py-4">{t("admin.noUsers")}</p>}
            {users.map(u => (
              <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-gray-800 text-sm">{u.fullName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {u.isActive ? t("admin.active") : t("admin.inactive")}
                  </span>
                </div>
                <p className="text-xs text-gray-400" dir="ltr">{u.email ?? "—"}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block ${ROLE_BADGE[u.role] ?? "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                <div className="flex gap-3 pt-1">
                  {u.isActive
                    ? <button onClick={() => deactivate.mutate(u.id)} className="text-red-600 text-xs hover:underline">{t("admin.deactivate")}</button>
                    : <button onClick={() => reactivate.mutate(u.id)} className="text-green-600 text-xs hover:underline">{t("admin.reactivate")}</button>
                  }
                  {u.mustSetPassword && (
                    <button onClick={() => resendInvite.mutate(u.id)} className="text-blue-600 text-xs hover:underline">{t("admin.resendInvite")}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Institutions Panel ───────────────────────────────────────────────────────
function InstitutionsPanel({ lang }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [editInst, setEditInst] = useState(null) // institution being edited

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-institutions", page],
    queryFn: () => apiGet(`/admin/institutions?page=${page}&limit=20`, lang),
  })
  const institutions = data?.institutions ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / 20)

  const { data: communesRaw = [] } = useQuery({
    queryKey: ["communes-admin"],
    queryFn: () => apiGet("/emergency/communes", lang),
    staleTime: Infinity,
  })

  const verify = useMutation({
    mutationFn: (id) => apiPatch(`/admin/institutions/${id}/verify`, {}, lang),
    onSuccess: () => { toast.success(lang === "ar" ? "تم التوثيق." : "Vérifié."); qc.invalidateQueries({ queryKey: ["admin-institutions"] }) },
    onError: () => toast.error(t("admin.updateError")),
  })
  const suspend = useMutation({
    mutationFn: (id) => apiPatch(`/admin/institutions/${id}/suspend`, {}, lang),
    onSuccess: () => { toast.success(lang === "ar" ? "تم الإيقاف." : "Suspendu."); qc.invalidateQueries({ queryKey: ["admin-institutions"] }) },
    onError: () => toast.error(t("admin.updateError")),
  })
  const remove = useMutation({
    mutationFn: (id) => apiDelete(`/admin/institutions/${id}`, lang),
    onSuccess: () => { toast.success(lang === "ar" ? "تم الحذف." : "Supprimé."); qc.invalidateQueries({ queryKey: ["admin-institutions"] }) },
    onError: () => toast.error(lang === "ar" ? "فشل الحذف." : "Échec de la suppression."),
  })

  const STATUS_STYLE = {
    VERIFIED: "bg-green-100 text-green-700",
    DRAFT: "bg-amber-100 text-amber-700",
    SUSPENDED: "bg-red-100 text-red-700",
  }
  const STATUS_LABEL = {
    VERIFIED: lang === "ar" ? "موثقة" : "Vérifiée",
    DRAFT: lang === "ar" ? "مسودة" : "Brouillon",
    SUSPENDED: lang === "ar" ? "موقوفة" : "Suspendue",
  }

  const handleDelete = (inst) => {
    if (!window.confirm(lang === "ar" ? `هل تريد حذف "${inst.nameAr}"؟` : `Supprimer "${inst.nameFr}" ?`)) return
    remove.mutate(inst.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-bold text-gray-800">{lang === "ar" ? "المؤسسات" : "Établissements"}</h2>
        <button onClick={() => refetch()} className="text-xs text-[#2C5F8A] hover:underline">
          {lang === "ar" ? "تحديث" : "Actualiser"}
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">{t("common.loading")}</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{lang === "ar" ? "الاسم" : "Nom"}</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{lang === "ar" ? "النوع" : "Type"}</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{lang === "ar" ? "الحالة" : "Statut"}</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{lang === "ar" ? "الهاتف" : "Téléphone"}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {institutions.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">{lang === "ar" ? "لا توجد مؤسسات." : "Aucun établissement."}</td></tr>
                )}
                {institutions.map(inst => (
                  <tr key={inst.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{lang === "ar" ? inst.nameAr : inst.nameFr}</p>
                      <p className="text-xs text-gray-400">{lang === "ar" ? inst.nameFr : inst.nameAr}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{inst.type}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLE[inst.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABEL[inst.status] ?? inst.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs" dir="ltr">{inst.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {inst.status === "DRAFT" && (
                          <button onClick={() => verify.mutate(inst.id)} className="flex items-center gap-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-lg transition-colors">
                            <CheckCircle2 size={12} aria-hidden />
                            {lang === "ar" ? "توثيق" : "Vérifier"}
                          </button>
                        )}
                        {inst.status === "VERIFIED" && (
                          <button onClick={() => suspend.mutate(inst.id)} className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg transition-colors">
                            <XCircle size={12} aria-hidden />
                            {lang === "ar" ? "إيقاف" : "Suspendre"}
                          </button>
                        )}
                        {inst.status === "SUSPENDED" && (
                          <button onClick={() => verify.mutate(inst.id)} className="flex items-center gap-1 text-xs text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-lg transition-colors">
                            <CheckCircle2 size={12} aria-hidden />
                            {lang === "ar" ? "إعادة تفعيل" : "Réactiver"}
                          </button>
                        )}
                        <button onClick={() => setEditInst(inst)} className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors">
                          <Pencil size={12} aria-hidden />
                          {lang === "ar" ? "تعديل" : "Modifier"}
                        </button>
                        <button onClick={() => handleDelete(inst)} className="flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors">
                          <Trash2 size={12} aria-hidden />
                          {lang === "ar" ? "حذف" : "Supprimer"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="text-xs text-gray-600 disabled:opacity-40 px-3 py-1.5 rounded-lg border border-gray-200 bg-white">
                {lang === "ar" ? "السابق" : "Précédent"}
              </button>
              <span className="text-xs text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="text-xs text-gray-600 disabled:opacity-40 px-3 py-1.5 rounded-lg border border-gray-200 bg-white">
                {lang === "ar" ? "التالي" : "Suivant"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit modal */}
      {editInst && (
        <EditInstitutionModal
          inst={editInst}
          lang={lang}
          communes={communesRaw}
          onClose={() => setEditInst(null)}
          onSaved={() => { setEditInst(null); qc.invalidateQueries({ queryKey: ["admin-institutions"] }) }}
        />
      )}
    </div>
  )
}

function EditInstitutionModal({ inst, lang, communes, onClose, onSaved }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    nameAr: inst.nameAr ?? "",
    nameFr: inst.nameFr ?? "",
    type: inst.type ?? "EPH",
    sector: inst.sector ?? "PUBLIC",
    addressAr: inst.addressAr ?? "",
    addressFr: inst.addressFr ?? "",
    phone: inst.phone ?? "",
    email: inst.email ?? "",
    communeId: inst.communeId ? String(inst.communeId) : "",
    hasEmergency24h: inst.hasEmergency24h ?? false,
  })
  const [loading, setLoading] = useState(false)
  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) })

  const save = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form }
      if (payload.communeId) payload.communeId = parseInt(payload.communeId)
      else delete payload.communeId
      if (!payload.phone) delete payload.phone
      if (!payload.email) delete payload.email
      if (!payload.addressFr) delete payload.addressFr
      await apiPatch(`/admin/institutions/${inst.id}`, payload, lang)
      toast.success(lang === "ar" ? "تم حفظ التغييرات." : "Modifications enregistrées.")
      onSaved()
    } catch {
      toast.error(t("admin.updateError"))
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-800 text-base">{lang === "ar" ? "تعديل المؤسسة" : "Modifier l'établissement"}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">✕</button>
        </div>
        <form onSubmit={save} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{lang === "ar" ? "الاسم بالعربية" : "Nom en arabe"}</label>
              <input required className={inp} {...f("nameAr")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{lang === "ar" ? "الاسم بالفرنسية" : "Nom en français"}</label>
              <input required className={inp} dir="ltr" {...f("nameFr")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{lang === "ar" ? "النوع" : "Type"}</label>
              <select className={inp} {...f("type")}>
                {["CHU","EPH","EPSP","EHS","POLYCLINIC","PRIVATE_CLINIC","PRIVATE_LAB","PRIVATE_IMAGING","PHARMACY"].map(v =>
                  <option key={v} value={v}>{v}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{lang === "ar" ? "القطاع" : "Secteur"}</label>
              <select className={inp} {...f("sector")}>
                <option value="PUBLIC">{lang === "ar" ? "عام" : "Public"}</option>
                <option value="PRIVATE">{lang === "ar" ? "خاص" : "Privé"}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{lang === "ar" ? "العنوان (ع)" : "Adresse (ar)"}</label>
              <input className={inp} {...f("addressAr")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{lang === "ar" ? "العنوان (ف)" : "Adresse (fr)"}</label>
              <input className={inp} dir="ltr" {...f("addressFr")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{lang === "ar" ? "الهاتف" : "Téléphone"}</label>
              <input className={inp} dir="ltr" {...f("phone")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">{lang === "ar" ? "البريد الإلكتروني" : "E-mail"}</label>
              <input className={inp} type="email" dir="ltr" {...f("email")} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">{lang === "ar" ? "البلدية" : "Commune"}</label>
              <select className={inp} {...f("communeId")}>
                <option value="">{lang === "ar" ? "اختر البلدية" : "Choisir une commune"}</option>
                {communes.map(c => (
                  <option key={c.id} value={c.id}>{lang === "ar" ? c.nameAr : c.nameFr}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-emergency"
                checked={form.hasEmergency24h}
                onChange={(e) => setForm({ ...form, hasEmergency24h: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="edit-emergency" className="text-sm text-gray-700">
                {lang === "ar" ? "متاح للطوارئ 24 ساعة" : "Urgences 24h/24"}
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50">
              {t("common.cancel")}
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#2C5F8A] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#245075] disabled:opacity-50">
              {loading ? t("common.loading") : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Create Institution Form ──────────────────────────────────────────────────
function CreateInstitutionPanel({ lang }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [form, setForm] = useState({
    nameAr: "", nameFr: "", type: "EPH", sector: "PUBLIC", addressAr: "", communeId: "",
    phone: "", email: "", hasEmergency24h: false,
    adminFullName: "", adminEmail: "", adminLang: "ar",
  })
  const [loading, setLoading] = useState(false)
  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) })

  const { data: communesRaw = [] } = useQuery({
    queryKey: ["communes-admin"],
    queryFn: () => apiGet("/emergency/communes", lang),
    staleTime: Infinity,
  })

  const create = async (e) => {
    e.preventDefault()
    if (!form.communeId) { toast.error(lang === "ar" ? "اختر البلدية" : "Choisissez une commune"); return }
    setLoading(true)
    try {
      const { adminFullName, adminEmail, adminLang, ...instData } = form
      const result = await apiPost("/admin/institutions", {
        ...instData,
        communeId: parseInt(instData.communeId),
        phone: instData.phone || undefined,
        email: instData.email || undefined,
      }, lang)
      const institutionId = result?.id ?? result?.data?.id
      // Create admin account if email provided
      if (adminEmail && adminFullName && institutionId) {
        await apiPost(`/admin/institutions/${institutionId}/admins`, {
          fullName: adminFullName,
          email: adminEmail,
          preferredLang: adminLang,
        }, lang)
        toast.success(lang === "ar" ? "تم إنشاء المؤسسة وحساب المسؤول. تم إرسال رسالة الدعوة." : "Établissement et compte admin créés. Invitation envoyée.")
      } else {
        toast.success(t("admin.institutionCreated"))
      }
      setForm({ nameAr: "", nameFr: "", type: "EPH", sector: "PUBLIC", addressAr: "", communeId: "", phone: "", email: "", hasEmergency24h: false, adminFullName: "", adminEmail: "", adminLang: "ar" })
      qc.invalidateQueries({ queryKey: ["admin-institutions"] })
    } catch (err) {
      toast.error(err?.message ?? t("admin.createError"))
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800">{t("admin.createInstitution")}</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={create} className="space-y-5">
          {/* Institution info */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">{lang === "ar" ? "معلومات المؤسسة" : "Informations de l'établissement"}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder={lang === "ar" ? "الاسم بالعربية *" : "Nom en arabe *"} required className={inp} {...f("nameAr")} />
              <input placeholder={lang === "ar" ? "الاسم بالفرنسية *" : "Nom en français *"} required className={inp} dir="ltr" {...f("nameFr")} />
              <select className={inp} {...f("type")}>
                {["CHU","EPH","EPSP","EHS","POLYCLINIC","PRIVATE_CLINIC","PRIVATE_LAB","PRIVATE_IMAGING","PHARMACY"].map(v =>
                  <option key={v} value={v}>{v}</option>
                )}
              </select>
              <select className={inp} {...f("sector")}>
                <option value="PUBLIC">{lang === "ar" ? "عام" : "Public"}</option>
                <option value="PRIVATE">{lang === "ar" ? "خاص" : "Privé"}</option>
              </select>
              <input placeholder={lang === "ar" ? "العنوان (اختياري)" : "Adresse (optionnel)"} className={inp} {...f("addressAr")} />
              <input placeholder={lang === "ar" ? "الهاتف (اختياري)" : "Téléphone (optionnel)"} className={inp} dir="ltr" {...f("phone")} />
              <input placeholder={lang === "ar" ? "البريد الإلكتروني (اختياري)" : "E-mail (optionnel)"} type="email" className={inp} dir="ltr" {...f("email")} />
              <select required className={inp} {...f("communeId")}>
                <option value="">{lang === "ar" ? "اختر البلدية *" : "Choisissez une commune *"}</option>
                {communesRaw.map((c) => (
                  <option key={c.id} value={c.id}>{lang === "ar" ? c.nameAr : c.nameFr}</option>
                ))}
              </select>
              <div className="sm:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="create-emergency" checked={form.hasEmergency24h}
                  onChange={(e) => setForm({ ...form, hasEmergency24h: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="create-emergency" className="text-sm text-gray-700">
                  {lang === "ar" ? "متاح للطوارئ 24 ساعة" : "Urgences 24h/24"}
                </label>
              </div>
            </div>
          </div>

          {/* Institution admin account */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{lang === "ar" ? "حساب مسؤول المؤسسة (اختياري)" : "Compte administrateur (optionnel)"}</p>
            <p className="text-xs text-gray-400 mb-3">{lang === "ar" ? "إذا أضفت بريداً إلكترونياً سيُرسل دعوة تسجيل." : "Si vous renseignez un email, une invitation sera envoyée."}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder={lang === "ar" ? "اسم المسؤول" : "Nom de l'administrateur"} className={inp} {...f("adminFullName")} />
              <input placeholder={lang === "ar" ? "البريد الإلكتروني للمسؤول" : "Email de l'administrateur"} type="email" className={inp} dir="ltr" {...f("adminEmail")} />
              <select className={inp} {...f("adminLang")}>
                <option value="ar">العربية</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#2C5F8A] text-white py-2.5 rounded-lg hover:bg-[#245075] disabled:opacity-50 font-medium text-sm transition-colors flex items-center justify-center gap-2">
            <Plus size={16} aria-hidden />
            {loading ? t("common.loading") : t("admin.createInstitution")}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Doctors Panel ────────────────────────────────────────────────────────────
function DoctorsPanel({ lang }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [q, setQ] = useState("")
  const [editDoc, setEditDoc] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-doctors-list", page, q],
    queryFn: () => apiGet(`/admin/doctors?page=${page}&limit=20${q ? `&q=${encodeURIComponent(q)}` : ""}`, lang),
  })
  const doctors = data?.doctors ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / 20)

  const { data: specialties = [] } = useQuery({
    queryKey: ["specialties"],
    queryFn: () => apiGet("/admin/specialties", lang),
  })

  const remove = useMutation({
    mutationFn: (id) => apiDelete(`/admin/doctors/${id}`, lang),
    onSuccess: () => { toast.success(lang === "ar" ? "تم إيقاف الطبيب." : "Médecin désactivé."); qc.invalidateQueries({ queryKey: ["admin-doctors-list"] }) },
    onError: () => toast.error(t("admin.updateError")),
  })

  const handleDelete = (doc) => {
    if (!window.confirm(lang === "ar" ? `هل تريد إيقاف "${doc.user?.fullName}"؟` : `Désactiver "${doc.user?.fullName}" ?`)) return
    remove.mutate(doc.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-bold text-gray-800">{lang === "ar" ? "الأطباء" : "Médecins"}</h2>
        <form onSubmit={(e) => { e.preventDefault(); setQ(search); setPage(1) }} className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={lang === "ar" ? "بحث…" : "Rechercher…"}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-[#2C5F8A]" />
          <button type="submit" className="bg-[#2C5F8A] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#245075]">
            {lang === "ar" ? "بحث" : "Chercher"}
          </button>
        </form>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">{t("common.loading")}</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{t("auth.fullName")}</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{lang === "ar" ? "التخصص" : "Spécialité"}</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{lang === "ar" ? "المؤسسات" : "Établissements"}</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{lang === "ar" ? "الرسوم" : "Honoraires"}</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{t("admin.status")}</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {doctors.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">{lang === "ar" ? "لا يوجد أطباء." : "Aucun médecin."}</td></tr>
                )}
                {doctors.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{doc.user?.fullName}</p>
                      <p className="text-xs text-gray-400" dir="ltr">{doc.user?.email ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {lang === "ar" ? doc.specialty?.nameAr : doc.specialty?.nameFr}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px]">
                      {doc.institutionLinks?.map(l => (
                        <span key={l.institution.id} className="block truncate">
                          {l.isPrimary ? "★ " : ""}{lang === "ar" ? l.institution.nameAr : l.institution.nameFr}
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {doc.consultationFeeDZD != null ? `${doc.consultationFeeDZD} دج` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${doc.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {doc.status === "ACTIVE" ? (lang === "ar" ? "نشط" : "Actif") : (lang === "ar" ? "غير نشط" : "Inactif")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setEditDoc(doc)} className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg">
                          <Pencil size={12} aria-hidden />
                          {lang === "ar" ? "تعديل" : "Modifier"}
                        </button>
                        <button onClick={() => handleDelete(doc)} className="flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg">
                          <Trash2 size={12} aria-hidden />
                          {lang === "ar" ? "إيقاف" : "Désactiver"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="text-xs text-gray-600 disabled:opacity-40 px-3 py-1.5 rounded-lg border border-gray-200 bg-white">
                {lang === "ar" ? "السابق" : "Précédent"}
              </button>
              <span className="text-xs text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="text-xs text-gray-600 disabled:opacity-40 px-3 py-1.5 rounded-lg border border-gray-200 bg-white">
                {lang === "ar" ? "التالي" : "Suivant"}
              </button>
            </div>
          )}
        </div>
      )}

      {editDoc && (
        <EditDoctorModal
          doc={editDoc}
          lang={lang}
          specialties={specialties}
          onClose={() => setEditDoc(null)}
          onSaved={() => { setEditDoc(null); qc.invalidateQueries({ queryKey: ["admin-doctors-list"] }) }}
        />
      )}
    </div>
  )
}

function EditDoctorModal({ doc, lang, specialties, onClose, onSaved }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    specialtyId: doc.specialtyId ?? "",
    consultationFeeDZD: doc.consultationFeeDZD != null ? String(doc.consultationFeeDZD) : "",
    licenseNumber: doc.licenseNumber ?? "",
    status: doc.status ?? "ACTIVE",
  })
  const [loading, setLoading] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        specialtyId: form.specialtyId || undefined,
        consultationFeeDZD: form.consultationFeeDZD ? parseInt(form.consultationFeeDZD) : undefined,
        licenseNumber: form.licenseNumber || undefined,
        status: form.status,
      }
      await apiPatch(`/admin/doctors/${doc.id}`, payload, lang)
      toast.success(lang === "ar" ? "تم حفظ بيانات الطبيب." : "Médecin mis à jour.")
      onSaved()
    } catch {
      toast.error(t("admin.updateError"))
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="font-bold text-gray-800 text-base">{lang === "ar" ? "تعديل الطبيب" : "Modifier le médecin"}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{doc.user?.fullName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg">✕</button>
        </div>
        <form onSubmit={save} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{lang === "ar" ? "التخصص" : "Spécialité"}</label>
            <select className={inp} value={form.specialtyId} onChange={e => setForm({ ...form, specialtyId: e.target.value })}>
              <option value="">{lang === "ar" ? "اختر التخصص" : "Choisir une spécialité"}</option>
              {specialties.map(s => <option key={s.id} value={s.id}>{lang === "ar" ? s.nameAr : s.nameFr}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{lang === "ar" ? "رسوم الاستشارة (دج)" : "Honoraires (DA)"}</label>
            <input type="number" min="0" className={inp} value={form.consultationFeeDZD} onChange={e => setForm({ ...form, consultationFeeDZD: e.target.value })} dir="ltr" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{lang === "ar" ? "رقم الترخيص" : "N° de licence"}</label>
            <input className={inp} value={form.licenseNumber} onChange={e => setForm({ ...form, licenseNumber: e.target.value })} dir="ltr" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{lang === "ar" ? "الحالة" : "Statut"}</label>
            <select className={inp} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="ACTIVE">{lang === "ar" ? "نشط" : "Actif"}</option>
              <option value="INACTIVE">{lang === "ar" ? "غير نشط" : "Inactif"}</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm hover:bg-gray-50">
              {t("common.cancel")}
            </button>
            <button type="submit" disabled={loading} className="flex-1 bg-[#2C5F8A] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#245075] disabled:opacity-50">
              {loading ? t("common.loading") : t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Create Doctor Form ───────────────────────────────────────────────────────
function CreateDoctorPanel({ lang }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [form, setForm] = useState({ fullName: "", email: "", specialtyId: "", preferredLang: "ar", consultationFeeDZD: "", licenseNumber: "" })
  const [selectedInstitutions, setSelectedInstitutions] = useState([])
  const [loading, setLoading] = useState(false)
  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) })

  const { data: specialties = [] } = useQuery({
    queryKey: ["specialties"],
    queryFn: () => apiGet("/admin/specialties", lang),
  })

  const { data: institutionsData } = useQuery({
    queryKey: ["admin-institutions-all"],
    queryFn: () => apiGet("/admin/institutions?limit=50", lang),
  })
  const allInstitutions = institutionsData?.institutions ?? []

  const toggleInst = (id) => {
    setSelectedInstitutions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const create = async (e) => {
    e.preventDefault()
    if (selectedInstitutions.length === 0) {
      toast.error(lang === "ar" ? "اختر مؤسسة واحدة على الأقل." : "Sélectionnez au moins un établissement.")
      return
    }
    setLoading(true)
    try {
      await apiPost("/admin/doctors", {
        fullName: form.fullName,
        email: form.email,
        specialtyId: form.specialtyId,
        preferredLang: form.preferredLang,
        institutionIds: selectedInstitutions,
        consultationFeeDZD: form.consultationFeeDZD ? parseInt(form.consultationFeeDZD) : undefined,
        licenseNumber: form.licenseNumber || undefined,
      }, lang)
      toast.success(t("admin.doctorCreated"))
      setForm({ fullName: "", email: "", specialtyId: "", preferredLang: "ar", consultationFeeDZD: "", licenseNumber: "" })
      setSelectedInstitutions([])
      qc.invalidateQueries({ queryKey: ["admin-doctors-list"] })
    } catch (err) {
      toast.error(err?.message ?? t("admin.createError"))
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-4 max-w-lg">
      <h2 className="text-xl font-bold text-gray-800">{t("admin.createDoctor")}</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={create} className="space-y-4">
          <input placeholder={t("auth.fullName")} required className={inp} {...f("fullName")} />
          <input placeholder={t("auth.email")} type="email" required dir="ltr" className={inp} {...f("email")} />
          <select className={inp} {...f("specialtyId")} required>
            <option value="">{t("admin.selectSpecialty")}</option>
            {specialties.map(s => <option key={s.id} value={s.id}>{lang === "ar" ? s.nameAr : s.nameFr}</option>)}
          </select>
          <select className={inp} {...f("preferredLang")}>
            <option value="ar">العربية</option>
            <option value="fr">Français</option>
          </select>
          <input placeholder={lang === "ar" ? "رسوم الاستشارة بالدينار (اختياري)" : "Honoraires en DA (optionnel)"} type="number" min="0" className={inp} dir="ltr" {...f("consultationFeeDZD")} />
          <input placeholder={lang === "ar" ? "رقم الترخيص (اختياري)" : "N° de licence (optionnel)"} className={inp} dir="ltr" {...f("licenseNumber")} />

          {/* Institution multi-select */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">
              {lang === "ar" ? "المؤسسات المرتبطة *" : "Établissements liés *"}
            </p>
            {allInstitutions.length === 0 ? (
              <p className="text-xs text-gray-400">{lang === "ar" ? "لا توجد مؤسسات بعد." : "Aucun établissement disponible."}</p>
            ) : (
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                {allInstitutions.map(inst => (
                  <label key={inst.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedInstitutions.includes(inst.id)}
                      onChange={() => toggleInst(inst.id)}
                      className="w-4 h-4 text-[#2C5F8A]"
                    />
                    <span className="text-sm text-gray-700">{lang === "ar" ? inst.nameAr : inst.nameFr}</span>
                    <span className="text-xs text-gray-400 ms-auto">{inst.type}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#2C5F8A] text-white py-2.5 rounded-lg hover:bg-[#245075] disabled:opacity-50 font-medium text-sm transition-colors flex items-center justify-center gap-2">
            <Plus size={16} aria-hidden />
            {loading ? t("common.loading") : t("admin.createDoctor")}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Audit Log Panel ──────────────────────────────────────────────────────────
function AuditLogPanel({ lang }) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit", page],
    queryFn: () => apiGet(`/admin/audit-log?page=${page}`, lang),
    staleTime: 30_000,
  })
  const logs = data?.logs ?? []
  const total = data?.total ?? 0
  const limit = data?.limit ?? 50
  const totalPages = Math.ceil(total / limit)

  const fmt = (iso) => new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : "fr-DZ", {
    dateStyle: "short", timeStyle: "short", timeZone: "Africa/Algiers",
  }).format(new Date(iso))

  const ACTION_COLORS = {
    CREATE: "bg-green-100 text-green-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
    DEACTIVATE: "bg-orange-100 text-orange-700",
    REACTIVATE: "bg-teal-100 text-teal-700",
    VERIFY: "bg-green-100 text-green-700",
    SUSPEND: "bg-orange-100 text-orange-700",
  }
  const actionColor = (action) => {
    const prefix = Object.keys(ACTION_COLORS).find(k => action.startsWith(k))
    return prefix ? ACTION_COLORS[prefix] : "bg-gray-100 text-gray-600"
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">{lang === "ar" ? "سجل العمليات" : "Journal d'audit"}</h2>
      {isLoading ? (
        <p className="text-gray-400 text-sm">…</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{lang === "ar" ? "الوقت" : "Date"}</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{lang === "ar" ? "الإجراء" : "Action"}</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">{lang === "ar" ? "الكيان" : "Entité"}</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-start">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">{lang === "ar" ? "لا توجد سجلات." : "Aucun enregistrement."}</td></tr>
                )}
                {logs.map(l => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap" dir="ltr">{fmt(l.createdAt)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full font-medium text-xs ${actionColor(l.action)}`}>{l.action}</span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{l.entity}</td>
                    <td className="px-4 py-2.5 text-gray-400" dir="ltr">{l.ip ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="text-xs text-gray-600 hover:text-gray-800 disabled:opacity-40 px-3 py-1.5 rounded-lg border border-gray-200 bg-white">
                {lang === "ar" ? "السابق" : "Précédent"}
              </button>
              <span className="text-xs text-gray-500">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="text-xs text-gray-600 hover:text-gray-800 disabled:opacity-40 px-3 py-1.5 rounded-lg border border-gray-200 bg-white">
                {lang === "ar" ? "التالي" : "Suivant"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Profile / Settings Panel ─────────────────────────────────────────────────
function ProfilePanel({ lang, user }) {
  const { t } = useTranslation()
  const { refreshUser } = useAuth()
  const [fullName, setFullName] = useState(user?.fullName ?? "")
  const [prefLang, setPrefLang] = useState(user?.preferredLang ?? "ar")
  const [loading, setLoading] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await apiPatch("/auth/profile", { fullName, preferredLang: prefLang }, lang)
      await refreshUser()
      toast.success(lang === "ar" ? "تم حفظ الملف الشخصي." : "Profil mis à jour.")
    } catch {
      toast.error(lang === "ar" ? "حدث خطأ." : "Une erreur s'est produite.")
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-xl font-bold text-gray-800">{lang === "ar" ? "الملف الشخصي" : "Profil"}</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#2C5F8A] flex items-center justify-center text-white text-xl font-bold shrink-0">
            {(user?.fullName ?? "A")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800">{user?.fullName}</p>
            <p className="text-xs text-gray-400" dir="ltr">{user?.email}</p>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">SUPER_ADMIN</span>
          </div>
        </div>
        <hr className="border-gray-100" />
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("auth.fullName")}</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} className={inp} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{lang === "ar" ? "اللغة المفضلة" : "Langue préférée"}</label>
            <select value={prefLang} onChange={e => setPrefLang(e.target.value)} className={inp}>
              <option value="ar">العربية</option>
              <option value="fr">Français</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-[#2C5F8A] text-white py-2.5 rounded-lg hover:bg-[#245075] disabled:opacity-50 font-medium text-sm transition-colors">
            {loading ? t("common.loading") : (lang === "ar" ? "حفظ التغييرات" : "Enregistrer")}
          </button>
        </form>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={18} className="text-[#2C5F8A]" aria-hidden />
          <span className="text-sm font-medium text-gray-700">{lang === "ar" ? "الأمان والمصادقة الثنائية" : "Sécurité & 2FA"}</span>
        </div>
        <a href="/account/security/2fa-setup" className="text-xs text-[#2C5F8A] hover:underline font-medium">
          {lang === "ar" ? "إدارة" : "Gérer"}
        </a>
      </div>
    </div>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function SuperAdminDashboardPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const isRtl = lang === "ar"
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [section, setSection] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/login", { replace: true })
  }

  const navItems = [
    { key: "overview",      icon: LayoutDashboard, label: lang === "ar" ? "نظرة عامة"         : "Vue d'ensemble" },
    { key: "users",         icon: Users,            label: t("admin.users") },
    { key: "institutions",  icon: Building2,        label: lang === "ar" ? "المؤسسات"          : "Établissements" },
    { key: "institution",   icon: Plus,             label: t("admin.createInstitution") },
    { key: "doctors",       icon: Stethoscope,      label: lang === "ar" ? "الأطباء"           : "Médecins" },
    { key: "doctor",        icon: Plus,             label: t("admin.createDoctor") },
    { key: "audit",         icon: ScrollText,       label: lang === "ar" ? "سجل العمليات"      : "Journal d'audit" },
    { key: "profile",       icon: UserCog,          label: lang === "ar" ? "الملف الشخصي"      : "Profil" },
  ]

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight

  const Sidebar = ({ mobile = false }) => (
    <nav className={`flex flex-col h-full ${mobile ? "" : ""}`}>
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Activity size={18} className="text-white" aria-hidden />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Delin</p>
            <p className="text-white/60 text-xs">{lang === "ar" ? "لوحة المسؤول" : "Administration"}</p>
          </div>
        </div>
      </div>
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const NavIcon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => { setSection(item.key); if (mobile) setSidebarOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-start ${
                section === item.key
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <NavIcon size={17} aria-hidden />
              <span className="flex-1">{item.label}</span>
              {section === item.key && <ChevronIcon size={14} className="opacity-60" aria-hidden />}
            </button>
          )
        })}
      </div>
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {(user?.fullName ?? "A")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.fullName}</p>
            <p className="text-white/50 text-xs truncate" dir="ltr">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
        >
          <LogOut size={17} aria-hidden />
          {t("nav.logout")}
        </button>
      </div>
    </nav>
  )

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      <aside className="hidden lg:flex lg:flex-col w-60 bg-[#2C5F8A] shrink-0">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-60 bg-[#2C5F8A] flex flex-col h-full">
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="فتح القائمة"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-base font-semibold text-gray-800">
              {navItems.find(n => n.key === section)?.label ?? t("admin.superTitle")}
            </h1>
          </div>
          <button
            onClick={() => setSection("profile")}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label={lang === "ar" ? "الإعدادات" : "Paramètres"}
          >
            <Settings size={18} aria-hidden />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          {section === "overview"     && <StatsPanel lang={lang} />}
          {section === "users"        && <UsersPanel lang={lang} />}
          {section === "institutions" && <InstitutionsPanel lang={lang} />}
          {section === "institution"  && <CreateInstitutionPanel lang={lang} />}
          {section === "doctors"      && <DoctorsPanel lang={lang} />}
          {section === "doctor"       && <CreateDoctorPanel lang={lang} />}
          {section === "audit"        && <AuditLogPanel lang={lang} />}
          {section === "profile"      && <ProfilePanel lang={lang} user={user} />}
        </main>
      </div>
    </div>
  )
}
