// src/pages/institution/InstitutionDashboardPage.jsx
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  Building2, Calendar, Stethoscope, Wrench, ShieldCheck,
  Clock, CheckCircle2, XCircle, AlertCircle, LogOut,
  ChevronRight, ChevronLeft, Trash2, AlertTriangle,
} from "lucide-react"
import Layout from "../../components/Layout"
import { useAuth } from "../../contexts/AuthContext"
import { apiGet, apiDelete } from "../../api/client"

const STATUS_CLR = {
  PENDING:   { bg: "bg-amber-50",  border: "border-amber-200", text: "text-amber-700",  icon: Clock },
  CONFIRMED: { bg: "bg-green-50",  border: "border-green-200", text: "text-green-700",  icon: CheckCircle2 },
  COMPLETED: { bg: "bg-blue-50",   border: "border-blue-200",  text: "text-blue-700",   icon: CheckCircle2 },
  CANCELLED: { bg: "bg-red-50",    border: "border-red-200",   text: "text-red-700",    icon: XCircle },
  NO_SHOW:   { bg: "bg-gray-50",   border: "border-gray-200",  text: "text-gray-600",   icon: AlertCircle },
}

export default function InstitutionDashboardPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const isRtl = lang === "ar"
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [deleteConfirm, setDeleteConfirm] = useState("")

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["institution-stats"],
    queryFn: () => apiGet("/institution/mine/stats", lang),
  })

  const { data: institution } = useQuery({
    queryKey: ["institution-mine"],
    queryFn: () => apiGet("/institution/mine", lang),
  })

  const handleLogout = async () => { await logout(); navigate("/login", { replace: true }) }

  const deleteAccount = useMutation({
    mutationFn: () => apiDelete("/auth/account", lang),
    onSuccess: async () => {
      toast.success(lang === "ar" ? "تم حذف الحساب." : "Compte supprimé.")
      await logout()
      navigate("/login", { replace: true })
    },
    onError: () => toast.error(lang === "ar" ? "حدث خطأ أثناء الحذف." : "Erreur lors de la suppression."),
  })

  const ChevronIcon = isRtl ? ChevronLeft : ChevronRight

  const navLinks = [
    { to: "/institution/appointments", icon: Calendar,    label: lang === "ar" ? "المواعيد"          : "Rendez-vous" },
    { to: "/institution/profile",      icon: Building2,   label: lang === "ar" ? "معلومات المؤسسة"  : "Profil établissement" },
    { to: "/institution/services",     icon: Wrench,      label: lang === "ar" ? "الخدمات"          : "Services" },
    { to: "/institution/doctors",      icon: Stethoscope, label: lang === "ar" ? "الأطباء"          : "Médecins" },
    { to: "/institution/security",     icon: ShieldCheck, label: lang === "ar" ? "الأمان"           : "Sécurité" },
  ]

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6" dir={isRtl ? "rtl" : "ltr"}>

        {/* ── Hero banner ── */}
        <div className="bg-gradient-to-br from-[#2C5F8A] to-[#1a4068] rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Building2 size={26} className="text-white" aria-hidden />
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">
                  {institution ? (lang === "ar" ? institution.nameAr : institution.nameFr) : (user?.fullName ?? "—")}
                </p>
                <p className="text-blue-200 text-sm mt-0.5">{lang === "ar" ? "مسؤول المؤسسة" : "Administrateur établissement"}</p>
                {institution?.hasEmergency24h && (
                  <span className="text-xs bg-red-500/30 text-red-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                    {lang === "ar" ? "طوارئ 24/7" : "Urgences 24h"}
                  </span>
                )}
              </div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors">
              <LogOut size={15} aria-hidden />
              {t("nav.logout")}
            </button>
          </div>

          {/* Stats row */}
          {!statsLoading && stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/20">
              {(stats.appointmentsByStatus ?? []).map(({ status, count }) => (
                <div key={status} className="text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-blue-200 mt-0.5">{t(`appointments.status.${status.toLowerCase()}`)}</p>
                </div>
              ))}
              <div className="text-center">
                <p className="text-2xl font-bold text-teal-300">{stats.totalServices ?? 0}</p>
                <p className="text-xs text-blue-200 mt-0.5">{t("instAdmin.dashboard.activeServices")}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Quick navigation cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {navLinks.map(({ to, icon, label }) => {
            const NavIcon = icon
            return (
              <Link key={to} to={to}
                className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-[#2C5F8A]/40 hover:shadow-sm transition-all flex items-center gap-3 group focus-visible:ring-2 focus-visible:ring-[#2C5F8A] focus-visible:outline-none">
                <div className="w-10 h-10 rounded-xl bg-[#2C5F8A]/8 flex items-center justify-center shrink-0 group-hover:bg-[#2C5F8A]/15 transition-colors">
                  <NavIcon size={18} className="text-[#2C5F8A]" aria-hidden />
                </div>
                <span className="text-sm font-medium text-gray-700 flex-1">{label}</span>
                <ChevronIcon size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" aria-hidden />
              </Link>
            )
          })}
        </div>

        {/* ── Appointments by status (visual breakdown) ── */}
        {!statsLoading && stats?.appointmentsByStatus && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">
              {lang === "ar" ? "توزيع المواعيد" : "Répartition des rendez-vous"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {stats.appointmentsByStatus.map(({ status, count }) => {
                const s = STATUS_CLR[status] ?? { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700", icon: Clock }
                const StatusIcon = s.icon
                return (
                  <div key={status} className={`rounded-xl border p-3 text-center ${s.bg} ${s.border}`}>
                    <StatusIcon size={18} className={`mx-auto mb-1 ${s.text}`} aria-hidden />
                    <p className={`text-xl font-bold ${s.text}`}>{count}</p>
                    <p className={`text-xs mt-0.5 ${s.text} opacity-80`}>{t(`appointments.status.${status.toLowerCase()}`)}</p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Recent appointments link ── */}
        <Link to="/institution/appointments"
          className="flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-5 py-4 hover:border-[#2C5F8A]/30 hover:shadow-sm transition-all group focus-visible:ring-2 focus-visible:ring-[#2C5F8A] focus-visible:outline-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-blue-600" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {lang === "ar" ? "عرض جميع المواعيد" : "Voir tous les rendez-vous"}
              </p>
              <p className="text-xs text-gray-400">
                {lang === "ar" ? "تأكيد وإدارة مواعيد المرضى" : "Confirmer et gérer les rendez-vous"}
              </p>
            </div>
          </div>
          <ChevronIcon size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors" aria-hidden />
        </Link>

        {/* ── Danger zone — delete account ── */}
        <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-red-50">
            <AlertTriangle size={16} className="text-red-500 shrink-0" aria-hidden />
            <h2 className="text-sm font-semibold text-red-700">
              {lang === "ar" ? "منطقة الخطر" : "Zone dangereuse"}
            </h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-sm text-gray-600">
              {lang === "ar"
                ? "حذف الحساب إجراء لا رجعة فيه. سيتم مسح جميع بياناتك الشخصية وإلغاء جلسات الدخول."
                : "La suppression du compte est irréversible. Toutes vos données personnelles seront effacées."}
            </p>
            <p className="text-xs text-gray-400">
              {lang === "ar"
                ? "اكتب «حذف» للتأكيد قبل الضغط على الزر."
                : "Tapez «supprimer» pour confirmer avant de cliquer."}
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder={lang === "ar" ? "اكتب: حذف" : "Tapez: supprimer"}
              className="w-full border border-red-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
            />
            <button
              onClick={() => deleteAccount.mutate()}
              disabled={
                deleteAccount.isPending ||
                (lang === "ar" ? deleteConfirm !== "حذف" : deleteConfirm.toLowerCase() !== "supprimer")
              }
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 size={15} aria-hidden />
              {deleteAccount.isPending
                ? t("common.loading")
                : lang === "ar" ? "حذف الحساب نهائياً" : "Supprimer le compte définitivement"}
            </button>
          </div>
        </div>

      </div>
    </Layout>
  )
}
