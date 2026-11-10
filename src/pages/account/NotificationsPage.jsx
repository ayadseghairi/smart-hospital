// src/pages/account/NotificationsPage.jsx
import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import Layout from "../../components/Layout"
import { useAuth } from "../../contexts/AuthContext"
import { apiGet, apiPatch } from "../../api/client"

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${checked ? "bg-blue-600" : "bg-gray-300"}`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${checked ? "translate-x-5" : "translate-x-0.5"}`}
        />
      </button>
    </div>
  )
}

export default function NotificationsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const { user } = useAuth()

  const { data: prefs, isLoading, error } = useQuery({
    queryKey: ["notification-prefs"],
    queryFn: () => apiGet("/notifications/preferences", lang),
    enabled: !!user,
  })

  const [emailReminders, setEmailReminders] = useState(true)
  const [emailDigest, setEmailDigest] = useState(true)

  useEffect(() => {
    if (prefs) {
      setEmailReminders(prefs.emailReminders ?? true)
      setEmailDigest(prefs.emailDigest ?? true)
    }
  }, [prefs])

  const save = useMutation({
    mutationFn: () => apiPatch("/notifications/preferences", { emailReminders, emailDigest }, lang),
    onSuccess: () => toast.success(t("account.notifications.saveSuccess")),
    onError: () => toast.error(t("account.notifications.saveError")),
  })

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-10 text-center text-gray-400 text-sm">{t("common.loading")}</div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-10 text-center text-red-500 text-sm">{t("common.loadError")}</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("account.notifications.title")}</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <Toggle
            checked={emailReminders}
            onChange={setEmailReminders}
            label={t("account.notifications.emailReminders")}
            description={t("account.notifications.emailRemindersDesc")}
          />
          {user?.role === "DOCTOR" && (
            <Toggle
              checked={emailDigest}
              onChange={setEmailDigest}
              label={t("account.notifications.emailDigest")}
              description={t("account.notifications.emailDigestDesc")}
            />
          )}
        </div>

        <p className="text-xs text-gray-400 mb-4">{t("account.notifications.securityNote")}</p>

        <button
          onClick={() => save.mutate()}
          disabled={save.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {save.isPending ? t("common.loading") : t("account.notifications.save")}
        </button>
      </div>
    </Layout>
  )
}
