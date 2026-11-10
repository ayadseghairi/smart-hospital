// pages/SearchResults.jsx

import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import "./SearchResults.css"

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    // Phase 5: replace with real API call: GET /search?q=
    setLoading(true)
    // Simulate brief loading then show empty (no mock data)
    const t = setTimeout(() => {
      setResults([])
      setLoading(false)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const filteredResults = filter === "all" ? results : results.filter((result) => result.type === filter)

  const filters = [
    { id: "all", name: "جميع النتائج", icon: "bx-search" },
    { id: "doctor", name: "أطباء", icon: "bx-user-plus" },
    { id: "institution", name: "مستشفيات", icon: "bx-hospital" },
    { id: "service", name: "خدمات", icon: "bx-cog" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <i className="bx bx-arrow-back text-xl"></i>
              <span>العودة للرئيسية</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">نتائج البحث</h1>
              {query && <p className="text-gray-600">البحث عن: &ldquo;{query}&rdquo;</p>}
            </div>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {filters.map((filterItem) => (
              <button
                key={filterItem.id}
                onClick={() => setFilter(filterItem.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  filter === filterItem.id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <i className={`bx ${filterItem.icon}`}></i>
                <span>{filterItem.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <i className="bx bx-loader-alt animate-spin text-4xl text-blue-600 mb-4"></i>
            <p className="text-gray-600">جاري البحث...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                تم العثور على {filteredResults.length} نتيجة
              </h2>
            </div>
            {/* Results will be rendered here from real API in Phase 5 */}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="bx bx-search text-6xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              {query
                ? "لم يتم العثور على نتائج"
                : "ابحث عن طبيب أو مؤسسة صحية"}
            </h2>
            <p className="text-gray-500">
              {query
                ? "جرب البحث بكلمات مختلفة أو تحقق من الإملاء"
                : "أدخل كلمة بحث للبدء"}
            </p>
            <Link
              to="/"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              العودة للرئيسية
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchResults
