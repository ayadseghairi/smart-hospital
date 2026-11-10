// src/pages/account/AddEmailPage.jsx
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import Layout from "../../components/Layout"
import { useAuth } from "../../contexts/AuthContext"
import { apiPost } from "../../api/client"

export default function AddEmailPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const { user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")

  const submit = useMutation({
    mutationFn: () => apiPost("/auth/add-email", { email: email.trim().toLowerCase() }, lang),
    onSuccess: () => {
      toast.success(t("account.addEmail.success"))
      navigate("/check-inbox")
    },
    onError: () => toast.error(t("account.addEmail.error")),
  })

  // Only show this page if user has no email
  if (user?.email) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <p className="text-gray-500 text-sm">{t("account.addEmail.hint")}</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t("account.addEmail.title")}</h1>
        <p className="text-gray-500 text-sm mb-6">{t("account.addEmail.hint")}</p>

        <form
          onSubmit={(e) => { e.preventDefault(); submit.mutate() }}
          className="bg-white rounded-xl border border-gray-200 p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("account.addEmail.email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={submit.isPending || !email.trim()}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submit.isPending ? t("common.loading") : t("account.addEmail.submit")}
          </button>
        </form>
      </div>
    </Layout>
  )
}
