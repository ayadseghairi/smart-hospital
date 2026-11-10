import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"

export default function TooManyRequestsPage() {
  const { t } = useTranslation()
  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl font-bold text-orange-400 mb-4">429</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">{t("error.tooManyRequests.title")}</h1>
          <p className="text-gray-500 mb-6">{t("error.tooManyRequests.message")}</p>
          <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {t("nav.backHome")}
          </Link>
        </div>
      </div>
    </Layout>
  )
}
