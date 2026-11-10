// pages/NotFound.jsx

import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import "./NotFound.css"

const NotFound = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <i className="bx bx-error-circle text-8xl text-gray-400 mb-4"></i>
          <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">{t("notFound.title")}</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">{t("notFound.desc")}</p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            {t("notFound.backBtn")}
          </Link>

          <div className="flex justify-center gap-4">
            <Link to="/search" className="text-blue-600 hover:text-blue-800 transition-colors">
              {t("nav.search")}
            </Link>
            <span className="text-gray-400">|</span>
            <Link to="/emergency" className="text-red-600 hover:text-red-800 transition-colors">
              {t("nav.emergency")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
