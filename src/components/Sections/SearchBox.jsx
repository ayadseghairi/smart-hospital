// components/Sections/SearchBox.jsx

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import "./SearchBox.css"

const SearchBox = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true)
      setTimeout(() => {
        setIsSearching(false)
        if (onSearch) {
          onSearch(searchQuery)
        } else {
          navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
      }, 500)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-blue-500">
      <div className="text-center mb-4">
        <i className="bx bx-search text-5xl text-blue-500 mb-3"></i>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("search.title")}</h2>
        <p className="text-gray-600 text-sm">{t("search.subtitle")}</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <i className="bx bx-search absolute start-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>

        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSearching ? (
            <>
              <i className="bx bx-loader-alt animate-spin"></i>
              <span>{t("search.searching")}</span>
            </>
          ) : (
            <>
              <i className="bx bx-search"></i>
              <span>{t("search.button")}</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>{t("search.canSearch")}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="bg-gray-100 px-2 py-1 rounded">{t("search.tags.doctors")}</span>
          <span className="bg-gray-100 px-2 py-1 rounded">{t("search.tags.hospitals")}</span>
          <span className="bg-gray-100 px-2 py-1 rounded">{t("search.tags.specialties")}</span>
        </div>
      </div>
    </div>
  )
}

export default SearchBox
