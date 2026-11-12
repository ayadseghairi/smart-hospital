// src/pages/account/AccountProfilePage.jsx
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { User, Mail, Phone, Globe, CheckCircle2, AlertTriangle, ShieldCheck, Lock } from "lucide-react"
import Layout from "../../components/Layout"
import { useAuth } from "../../contexts/AuthContext"
import { apiPatch } from "../../api/client"

const inp = "w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C5F8A] focus:border-transparent"
const inpRO = "w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed"

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

export default function AccountProfilePage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const { user, refreshUser } = useAuth()
  const qc = useQueryClient()

  const [fullName, setFullName] = useState("")
  const [preferredLang, setPreferredLang] = useState("ar")

  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? "")
      setPreferredLang(user.preferredLang ?? "ar")
    }
  }, [user])

  const save = useMutation({
    mutationFn: () => apiPatch("/auth/profile", { fullName: fullName.trim(), preferredLang }, lang),
    onSuccess: async () => {
      toast.success(t("account.profile.saveSuccess"))
      await refreshUser()
      qc.invalidateQueries({ queryKey: ["me"] })
    },
    onError: () => toast.error(t("account.profile.saveError")),
  })

  const initials = (name) =>
    (name ?? "?").split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 py-8 space-y-5">

        {/* Avatar banner */}
        <div className="bg-gradient-to-br from-[#2C5F8A] to-[#1a4068] rounded-2xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white shrink-0">
            {initials(user?.fullName)}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{user?.fullName}</p>
            {user?.email && (
              <p className="text-blue-200 text-sm mt-0.5 flex items-center gap-1.5" dir="ltr">
                {user.email}
                {user.emailVerifiedAt
                  ? <CheckCircle2 size={13} className="text-green-300" aria-hidden />
                  : <AlertTriangle size={13} className="text-amber-300" aria-hidden />
                }
              </p>
            )}
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
              {lang === "ar" ? "مريض" : "Patient"}
            </span>
          </div>
        </div>

        {/* Personal info */}
        <SectionCard icon={User} title={t("account.profile.title")}>
          <form
            onSubmit={(e) => { e.preventDefault(); if (fullName.trim().length >= 2) save.mutate() }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("account.profile.fullName")}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                minLength={2} maxLength={100} required
                className={inp}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("account.profile.preferredLang")}</label>
              <select value={preferredLang} onChange={(e) => setPreferredLang(e.target.value)} className={inp}>
                <option value="ar">{t("account.profile.langAr")}</option>
                <option value="fr">{t("account.profile.langFr")}</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={save.isPending || fullName.trim().length < 2}
              className="w-full bg-[#2C5F8A] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#245075] disabled:opacity-50 transition-colors"
            >
              {save.isPending ? t("common.loading") : t("account.profile.save")}
            </button>
          </form>
        </SectionCard>

        {/* Contact info */}
        <SectionCard icon={Mail} title={lang === "ar" ? "معلومات الاتصال" : "Coordonnées"}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                <Mail size={12} aria-hidden />
                {t("account.profile.email")}
                {user?.emailVerifiedAt
                  ? <span className="text-green-600 font-medium">{lang === "ar" ? "· موثق" : "· Vérifié"}</span>
                  : <span className="text-amber-600 font-medium">{lang === "ar" ? "· غير موثق" : "· Non vérifié"}</span>
                }
              </label>
              <div className="flex gap-2 items-center">
                <input type="text" value={user?.email ?? "—"} readOnly className={`${inpRO} flex-1`} dir="ltr" />
                <Link
                  to="/account/add-email"
                  className="shrink-0 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2.5 rounded-xl font-medium transition-colors"
                >
                  {user?.email ? t("account.profile.changeEmail") : t("account.profile.addEmail")}
                </Link>
              </div>
            </div>

            {/* Phone */}
            {user?.phone && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                  <Phone size={12} aria-hidden />
                  {t("account.profile.phone")}
                </label>
                <input type="text" value={user.phone} readOnly className={inpRO} dir="ltr" />
                <p className="text-xs text-gray-400 mt-1">{t("account.profile.phoneNote")}</p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Security shortcuts */}
        <SectionCard icon={ShieldCheck} title={t("account.security.title")}>
          <div className="space-y-2">
            <Link
              to="/account/security"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                  <Lock size={15} className="text-teal-600" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{t("account.security.changePasswordTitle")}</p>
                  <p className="text-xs text-gray-400">{lang === "ar" ? "تغيير كلمة مرورك" : "Modifier votre mot de passe"}</p>
                </div>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </Link>
            <Link
              to="/account/security"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ShieldCheck size={15} className="text-blue-600" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{t("account.security.mfaTitle")}</p>
                  <p className="text-xs text-gray-400">{lang === "ar" ? "المصادقة الثنائية" : "Double authentification"}</p>
                </div>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </Link>
            <Link
              to="/account/privacy"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Globe size={15} className="text-gray-600" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">{t("account.privacy")}</p>
                  <p className="text-xs text-gray-400">{lang === "ar" ? "البيانات والخصوصية" : "Données et confidentialité"}</p>
                </div>
              </div>
              <span className="text-gray-300 text-lg">›</span>
            </Link>
          </div>
        </SectionCard>

      </div>
    </Layout>
  )
}
