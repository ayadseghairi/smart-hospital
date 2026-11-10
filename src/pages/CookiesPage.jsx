// src/pages/CookiesPage.jsx
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import Layout from "../components/Layout"

export default function CookiesPage() {
  const { t } = useTranslation()

  const cookies = [
    { key: "session" },
    { key: "lang" },
  ]

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("cookies.title")}</h1>
        <p className="text-gray-500 mb-8">{t("cookies.lastUpdated")}</p>

        <section className="mb-8">
          <p className="text-gray-700 leading-relaxed mb-4">{t("cookies.intro")}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{t("cookies.whatWeUseTitle")}</h2>
          <div className="space-y-4">
            {cookies.map((c) => (
              <div key={c.key} className="bg-white rounded-lg border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded">
                    {t("cookies.essential")}
                  </span>
                  <h3 className="font-semibold text-gray-800">{t(`cookies.items.${c.key}.name`)}</h3>
                </div>
                <p className="text-sm text-gray-500 font-mono mb-1">{t(`cookies.items.${c.key}.key`)}</p>
                <p className="text-sm text-gray-600">{t(`cookies.items.${c.key}.purpose`)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-3">{t("cookies.noTrackingTitle")}</h2>
          <p className="text-gray-700 leading-relaxed">{t("cookies.noTrackingDesc")}</p>
        </section>

        <section>
          <p className="text-gray-700">
            {t("cookies.moreInfo")}{" "}
            <Link to="/privacy" className="text-blue-600 hover:underline">
              {t("account.privacy")}
            </Link>
            .
          </p>
        </section>
      </div>
    </Layout>
  )
}
