// src/pages/MyAccountPage.jsx — Privacy & Data page
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuth } from "../contexts/AuthContext"
import { apiDelete } from "../api/client"
import Layout from "../components/Layout"

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1"

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function MyAccountPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const exportMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API}/auth/export`, {
        credentials: "include",
        headers: { "Accept-Language": localStorage.getItem("delinLang") || "ar" },
      })
      if (!res.ok) throw new Error("export_failed")
      return res.json()
    },
    onSuccess: (data) => {
      downloadJson(data, `delin-export-${new Date().toISOString().slice(0, 10)}.json`)
    },
    onError: () => toast.error(t("account.deleteError")),
  })

  const deleteMutation = useMutation({
    mutationFn: () => apiDelete("/auth/account"),
    onSuccess: () => {
      toast.success(t("account.deleteSuccess"))
      logout()
      navigate("/")
    },
    onError: () => toast.error(t("account.deleteError")),
  })

  function handleDelete() {
    if (window.confirm(t("account.deleteConfirm"))) {
      deleteMutation.mutate()
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("account.title")}</h1>

        {/* Profile summary */}
        {user && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <p className="text-gray-800 font-medium">{user.fullName}</p>
            {user.email && <p className="text-gray-500 text-sm mt-1">{user.email}</p>}
            {user.phone && <p className="text-gray-500 text-sm">{user.phone}</p>}
          </div>
        )}

        {/* Consent history */}
        {user?.consentAcceptedAt && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
            <p className="text-sm text-gray-600">
              {t("account.consentHistory")}{" "}
              <span className="font-medium text-gray-800">
                {new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : "fr-DZ", {
                  dateStyle: "long",
                  timeZone: "Africa/Algiers",
                }).format(new Date(user.consentAcceptedAt))}
              </span>
            </p>
          </div>
        )}

        {/* Data export */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <p className="text-gray-600 text-sm mb-3">{t("account.exportHint")}</p>
          <button
            onClick={() => exportMutation.mutate()}
            disabled={exportMutation.isPending}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {exportMutation.isPending ? t("common.loading") : t("account.export")}
          </button>
        </div>

        {/* Legal links */}
        <div className="flex flex-wrap gap-4 text-sm text-blue-600 mb-8">
          <Link to="/privacy" className="hover:underline">{t("account.privacy")}</Link>
          <Link to="/terms" className="hover:underline">{t("account.terms")}</Link>
          <Link to="/cookies" className="hover:underline">{t("account.cookies")}</Link>
        </div>

        {/* Danger zone */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {deleteMutation.isPending ? t("common.loading") : t("account.delete")}
          </button>
        </div>
      </div>
    </Layout>
  )
}
