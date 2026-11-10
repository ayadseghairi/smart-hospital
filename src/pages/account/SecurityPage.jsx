// src/pages/account/SecurityPage.jsx
import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import Layout from "../../components/Layout"
import { useAuth } from "../../contexts/AuthContext"
import { apiGet, apiPatch, apiDelete } from "../../api/client"

export default function SecurityPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const { user } = useAuth()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")

  // Active sessions
  const { data: sessions = [], isLoading: sessionsLoading, error: sessionsError, refetch: refetchSessions } = useQuery({
    queryKey: ["auth-sessions"],
    queryFn: () => apiGet("/auth/sessions", lang),
    enabled: !!user,
  })

  // Change password
  const changePassword = useMutation({
    mutationFn: () => apiPatch("/auth/password", { currentPassword, newPassword }, lang),
    onSuccess: () => {
      toast.success(t("account.security.passwordSuccess"))
      setCurrentPassword("")
      setNewPassword("")
    },
    onError: () => toast.error(t("account.security.passwordError")),
  })

  // Sign out all other sessions
  const signOutAll = useMutation({
    mutationFn: () => apiDelete("/auth/sessions", lang),
    onSuccess: (data) => {
      toast.success(t("account.security.signOutAllSuccess", { count: data?.revoked ?? 0 }))
      refetchSessions()
    },
    onError: () => toast.error(t("account.security.signOutAllError")),
  })

  function handlePasswordSubmit(e) {
    e.preventDefault()
    if (newPassword.length < 10 || newPassword.length > 128) return
    changePassword.mutate()
  }

  const formatDate = (iso) =>
    new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : "fr-DZ", {
      dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Algiers",
    }).format(new Date(iso))

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold text-gray-800">{t("account.security.title")}</h1>

        {/* Change password */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">{t("account.security.changePasswordTitle")}</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("account.security.currentPassword")}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("account.security.newPassword")}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={10}
                maxLength={128}
                autoComplete="new-password"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">{t("account.security.newPasswordHint")}</p>
            </div>
            <button
              type="submit"
              disabled={changePassword.isPending || newPassword.length < 10}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {changePassword.isPending ? t("common.loading") : t("account.security.changePassword")}
            </button>
          </form>
        </section>

        {/* Active sessions */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-700">{t("account.security.sessionsTitle")}</h2>
            {sessions.length > 1 && (
              <button
                onClick={() => signOutAll.mutate()}
                disabled={signOutAll.isPending}
                className="text-sm text-red-600 hover:underline disabled:opacity-50"
              >
                {t("account.security.signOutAll")}
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-4">{t("account.security.sessionsHint")}</p>

          {sessionsLoading && <p className="text-gray-400 text-sm">{t("common.loading")}</p>}
          {sessionsError && <p className="text-red-500 text-sm">{t("common.loadError")}</p>}

          {!sessionsLoading && !sessionsError && (
            <ul className="space-y-2">
              {sessions.map((session, idx) => (
                <li key={session.id} className="flex items-center justify-between text-xs text-gray-600 border border-gray-100 rounded-lg px-3 py-2">
                  <span>
                    {t("account.security.createdAt")}: {formatDate(session.createdAt)}
                  </span>
                  {idx === 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {lang === "ar" ? "الجلسة الحالية" : "Session actuelle"}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Layout>
  )
}
