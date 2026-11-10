// src/pages/account/AccountProfilePage.jsx
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import Layout from "../../components/Layout"
import { useAuth } from "../../contexts/AuthContext"
import { apiPatch } from "../../api/client"

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

  function handleSubmit(e) {
    e.preventDefault()
    if (fullName.trim().length < 2) return
    save.mutate()
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("account.profile.title")}</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("account.profile.fullName")}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              minLength={2}
              maxLength={100}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Preferred language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("account.profile.preferredLang")}
            </label>
            <select
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ar">{t("account.profile.langAr")}</option>
              <option value="fr">{t("account.profile.langFr")}</option>
            </select>
          </div>

          {/* Phone (read-only) */}
          {user?.phone && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("account.profile.phone")}
              </label>
              <input
                type="text"
                value={user.phone}
                readOnly
                className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">{t("account.profile.phoneNote")}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("account.profile.email")}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={user?.email ?? "—"}
                readOnly
                className="flex-1 border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
              />
              {user?.email ? (
                <Link to="/account/add-email" className="text-sm text-blue-600 hover:underline whitespace-nowrap">
                  {t("account.profile.changeEmail")}
                </Link>
              ) : (
                <Link to="/account/add-email" className="text-sm text-blue-600 hover:underline whitespace-nowrap">
                  {t("account.profile.addEmail")}
                </Link>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={save.isPending || fullName.trim().length < 2}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {save.isPending ? t("common.loading") : t("account.profile.save")}
          </button>
        </form>
      </div>
    </Layout>
  )
}
