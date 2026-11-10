// pages/SearchResults.jsx
import { useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { apiGet } from "../api/client"
import "./SearchResults.css"

const FILTER_ICONS = {
  all: "bx-search", doctor: "bx-user-plus", institution: "bx-hospital", service: "bx-cog",
}

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const [filter, setFilter] = useState("all")
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["search", query],
    queryFn: () => apiGet(`/search?q=${encodeURIComponent(query)}`, lang),
    enabled: !!query.trim(),
  })

  const results = Array.isArray(data) ? data : []
  const filteredResults = filter === "all" ? results : results.filter((r) => r.type === filter)
  const filterKeys = ["all", "doctor", "institution", "service"]

  const renderResult = (result) => {
    const name = lang === "ar" ? result.nameAr : result.nameFr
    const subtitle = lang === "ar" ? result.subtitleAr : result.subtitleFr

    if (result.type === "doctor") {
      return (
        <Link key={result.id} to={`/doctor/${result.id}`}
          className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
              {(name ?? "?")[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{name}</p>
              {subtitle && <p className="text-sm text-blue-600">{subtitle}</p>}
            </div>
            <span className="ms-auto text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">{t("search.filters.doctor")}</span>
          </div>
        </Link>
      )
    }
    if (result.type === "institution") {
      return (
        <Link key={result.id} to={`/institution/${result.id}`}
          className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <i className="bx bx-hospital text-2xl text-purple-500"></i>
            <div>
              <p className="font-semibold text-gray-800">{name}</p>
              {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
            <span className="ms-auto text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">{t("search.filters.institution")}</span>
          </div>
        </Link>
      )
    }
    // service or specialty
    return (
      <div key={result.id}
        className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-3">
          <i className="bx bx-cog text-2xl text-gray-400"></i>
          <div>
            <p className="font-semibold text-gray-800">{name}</p>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
          <span className="ms-auto text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-full">{t("search.filters.service")}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
              <i className="bx bx-arrow-back text-xl"></i>
              <span>{t("nav.backHome")}</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">{t("search.resultsTitle")}</h1>
              {query && <p className="text-gray-600">{t("search.searchingFor")} &ldquo;{query}&rdquo;</p>}
            </div>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {filterKeys.map((key) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  filter === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                <i className={`bx ${FILTER_ICONS[key]}`}></i>
                {t(`search.filters.${key}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {!query.trim() ? (
          <div className="text-center py-12">
            <i className="bx bx-search text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">{t("search.enterQuery")}</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <i className="bx bx-loader-alt animate-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">{t("search.loading")}</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{t("common.loadError")}</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              {t("search.found", { count: filteredResults.length })}
            </p>
            {filteredResults.map(renderResult)}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="bx bx-search-alt text-6xl text-gray-300 mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">{t("search.noResults")}</h2>
            <p className="text-gray-500">{t("search.tryOther")}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchResults
