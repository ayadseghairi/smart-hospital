// src/pages/SuperAdminDashboardPage.jsx
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import {
  LayoutDashboard, Users, Building2, Stethoscope,
  ScrollText, Settings, LogOut, ChevronRight, ChevronLeft,
  Shield, Activity, ClipboardList, UserCog,
} from "lucide-react"
import { apiGet, apiPost, apiPatch } from "../api/client"
import { useAuth } from "../contexts/AuthContext"

// ─── Shared input style ───────────────────────────────────────────────────────
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

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const CardIcon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                <CardIcon size={22} aria-hidden />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Institutions breakdown */}
      {stats?.institutions && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            {lang === "ar" ? "حالة المؤسسات" : "Statut des établissements"}
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { key: "verified", label: lang === "ar" ? "موثقة" : "Vérifiés", color: "text-green-600", bg: "bg-green-50" },
              { key: "draft", label: lang === "ar" ? "مسودة" : "Brouillons", color: "text-amber-600", bg: "bg-amber-50" },
              { key: "suspended", label: lang === "ar" ? "موقوفة" : "Suspendus", color: "text-red-600", bg: "bg-red-50" },
            ].map(({ key, label, color, bg }) => (
              <div key={key} className={`rounded-xl p-4 ${bg}`}>
                <p className={`text-2xl font-bold ${color}`}>{stats.institutions[key] ?? 0}</p>
                <p className={`text-xs mt-1 font-medium ${color}`}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Users Panel ─────────────────────────────────────────────────────────────
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
          {/* Desktop table */}
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
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_BADGE[u.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {u.role}
                      </span>
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

          {/* Mobile cards */}
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

// ─── Create Institution Form ──────────────────────────────────────────────────
function CreateInstitutionPanel({ lang }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [form, setForm] = useState({ nameAr: "", nameFr: "", type: "EPH", sector: "PUBLIC", addressAr: "", communeId: "" })
  const [loading, setLoading] = useState(false)
  const f = (k) => ({ value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) })

  // Load communes for dropdown (re-use public endpoint)
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
      await apiPost("/admin/institutions", { ...form, communeId: parseInt(form.communeId) }, lang)
      toast.success(t("admin.institutionCreated"))
      setForm({ nameAr: "", nameFr: "", type: "EPH", sector: "PUBLIC", addressAr: "", communeId: "" })
      qc.invalidateQueries({ queryKey: ["admin-institutions"] })
    } catch { toast.error(t("admin.createError")) }
    finally { setLoading(false) }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <h2 className="text-xl font-bold text-gray-800">{t("admin.createInstitution")}</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={create} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input placeholder={t("institution.nameAr")} required className={inp} {...f("nameAr")} />
          <input placeholder={t("institution.nameFr")} required className={inp} dir="ltr" {...f("nameFr")} />
          <select className={inp} {...f("type")}>
            {["CHU","EPH","EPSP","EHS","POLYCLINIC","PRIVATE_CLINIC","PRIVATE_LAB","PRIVATE_IMAGING","PHARMACY"].map(v =>
              <option key={v} value={v}>{v}</option>
            )}
          </select>
          <select className={inp} {...f("sector")}>
            <option value="PUBLIC">{t("institution.public")}</option>
            <option value="PRIVATE">{t("institution.private")}</option>
          </select>
          <input placeholder={t("institution.address")} className={`${inp} sm:col-span-2`} {...f("addressAr")} />
          <select required className={`${inp} sm:col-span-2`} {...f("communeId")}>
            <option value="">{lang === "ar" ? "اختر البلدية *" : "Choisissez une commune *"}</option>
            {communesRaw.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === "ar" ? c.nameAr : c.nameFr}
              </option>
            ))}
          </select>
          <button type="submit" disabled={loading}
            className="sm:col-span-2 bg-[#2C5F8A] text-white py-2.5 rounded-lg hover:bg-[#245075] disabled:opacity-50 font-medium text-sm transition-colors">
            {loading ? t("common.loading") : t("admin.createInstitution")}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Create Doctor Form ───────────────────────────────────────────────────────
function CreateDoctorPanel({ lang }) {
  const { t } = useTranslation()
  const qc = useQueryClient()
  const [form, setForm] = useState({ fullName: "", email: "", specialtyId: "", preferredLang: "ar" })
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
      setForm({ fullName: "", email: "", specialtyId: "", preferredLang: "ar" })
      qc.invalidateQueries({ queryKey: ["admin-doctors"] })
    } catch { toast.error(t("admin.createError")) }
    finally { setLoading(false) }
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
          <button type="submit" disabled={loading}
            className="w-full bg-[#2C5F8A] text-white py-2.5 rounded-lg hover:bg-[#245075] disabled:opacity-50 font-medium text-sm transition-colors">
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 max-w-md">
      <h2 className="text-xl font-bold text-gray-800">{lang === "ar" ? "الملف الشخصي" : "Profil"}</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Avatar placeholder */}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("auth.fullName")}
            </label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} className={inp} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {lang === "ar" ? "اللغة المفضلة" : "Langue préférée"}
            </label>
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

      {/* Security link */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={18} className="text-[#2C5F8A]" aria-hidden />
          <span className="text-sm font-medium text-gray-700">
            {lang === "ar" ? "الأمان والمصادقة الثنائية" : "Sécurité & 2FA"}
          </span>
        </div>
        <a href="/account/security/2fa-setup"
          className="text-xs text-[#2C5F8A] hover:underline font-medium">
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
    { key: "overview",    icon: LayoutDashboard, label: lang === "ar" ? "نظرة عامة"     : "Vue d'ensemble" },
    { key: "users",       icon: Users,            label: t("admin.users") },
    { key: "institution", icon: Building2,        label: t("admin.createInstitution") },
    { key: "doctor",      icon: Stethoscope,      label: t("admin.createDoctor") },
    { key: "audit",       icon: ScrollText,       label: lang === "ar" ? "سجل العمليات" : "Journal d'audit" },
    { key: "profile",     icon: UserCog,          label: lang === "ar" ? "الملف الشخصي" : "Profil" },
  ]

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight

  const Sidebar = ({ mobile = false }) => (
    <nav className={`flex flex-col h-full ${mobile ? "" : ""}`}>
      {/* Logo */}
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

      {/* Nav links */}
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

      {/* User + logout */}
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
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 bg-[#2C5F8A] shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-60 bg-[#2C5F8A] flex flex-col h-full">
            <Sidebar mobile />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
          {/* Mobile hamburger */}
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

          {/* Settings shortcut */}
          <button
            onClick={() => setSection("profile")}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label={lang === "ar" ? "الإعدادات" : "Paramètres"}
          >
            <Settings size={18} aria-hidden />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {section === "overview"    && <StatsPanel lang={lang} />}
          {section === "users"       && <UsersPanel lang={lang} />}
          {section === "institution" && <CreateInstitutionPanel lang={lang} />}
          {section === "doctor"      && <CreateDoctorPanel lang={lang} />}
          {section === "audit"       && <AuditLogPanel lang={lang} />}
          {section === "profile"     && <ProfilePanel lang={lang} user={user} />}
        </main>
      </div>
    </div>
  )
}
