// pages/SearchResults.jsx

import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import "./SearchResults.css"

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("all")
  const { t } = useTranslation()

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    // Phase 5: replace with real API call: GET /search?q=
    setLoading(true)
    const timer = setTimeout(() => {
      setResults([])
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const filteredResults = filter === "all" ? results : results.filter((result) => result.type === filter)

  const filterKeys = ["all", "doctor", "institution", "service"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
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
        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {filterKeys.map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setFilter(filterKey)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  filter === filterKey ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <i className={`bx bx-${filterKey === "all" ? "search" : filterKey === "doctor" ? "user-plus" : filterKey === "institution" ? "hospital" : "cog"}`}></i>
                <span>{t(`search.filters.${filterKey}`)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <i className="bx bx-loader-alt animate-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">{t("search.loading")}</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {t("search.found", { count: filteredResults.length })}
              </h2>
            </div>
            {/* Results will be rendered here from real API in Phase 5 */}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="bx bx-search text-6xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              {query ? t("search.noResults") : t("search.startSearch")}
            </h2>
            <p className="text-gray-500">
              {query ? t("search.tryOther") : t("search.enterQuery")}
            </p>
            <Link
              to="/"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("nav.backHome")}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchResults
