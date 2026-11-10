import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"

export default function ExpiredLinkPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{t("error.expiredLink.title")}</h1>
          <p className="text-gray-500 mb-6">{t("error.expiredLink.message")}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              {t("error.expiredLink.tryAgain")}
            </button>
            <Link to="/" className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              {t("nav.backHome")}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
