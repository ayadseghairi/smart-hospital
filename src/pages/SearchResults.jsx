"use client"

// pages/SearchResults.jsx

import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import "./SearchResults.css"

const SearchResults = () => {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  // Mock search results
  const mockResults = [
    {
      id: 1,
      type: "doctor",
      name: "د. أحمد محمد السعيد",
      specialty: "أخصائي القلب والأوعية الدموية",
      institution: "مستشفى الملك فهد التخصصي",
      institutionId: 1,
      rating: 4.9,
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      type: "institution",
      name: "مستشفى الملك فهد التخصصي",
      description: "مستشفى حكومي متخصص في جراحة القلب والأعصاب",
      rating: 4.8,
      distance: "2.5 كم",
      availability: "متاح",
    },
    {
      id: 3,
      type: "service",
      name: "تصوير بالرنين المغناطيسي",
      description: "خدمة التصوير بالرنين المغناطيسي متاحة في عدة مستشفيات",
      institutions: ["مستشفى الملك فهد", "مستشفى الأمل"],
    },
    {
      id: 4,
      type: "doctor",
      name: "د. فاطمة علي الزهراني",
      specialty: "أخصائية الأعصاب",
      institution: "مستشفى الأمل الخاص",
      institutionId: 2,
      rating: 4.8,
      image: "/placeholder.svg?height=80&width=80",
    },
  ]

  useEffect(() => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      const filteredResults = mockResults.filter(
        (result) =>
          result.name.toLowerCase().includes(query.toLowerCase()) ||
          (result.specialty && result.specialty.toLowerCase().includes(query.toLowerCase())) ||
          (result.description && result.description.toLowerCase().includes(query.toLowerCase())),
      )
      setResults(filteredResults)
      setLoading(false)
    }, 1000)
  }, [query])

  const filteredResults = filter === "all" ? results : results.filter((result) => result.type === filter)

  const filters = [
    { id: "all", name: "جميع النتائج", icon: "bx-search" },
    { id: "doctor", name: "أطباء", icon: "bx-user-plus" },
    { id: "institution", name: "مستشفيات", icon: "bx-hospital" },
    { id: "service", name: "خدمات", icon: "bx-cog" },
  ]

  const renderResult = (result) => {
    switch (result.type) {
      case "doctor":
        return (
          <Link
            to={`/doctor/${result.id}`}
            key={result.id}
            className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4 space-x-reverse">
              <img
                src={result.image || "/placeholder.svg"}
                alt={result.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{result.name}</h3>
                <p className="text-gray-600">{result.specialty}</p>
                <p className="text-sm text-gray-500">{result.institution}</p>
                <div className="flex items-center space-x-1 space-x-reverse mt-1">
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <i
                        key={i}
                        className={`bx ${i <= Math.floor(result.rating) ? "bxs-star" : "bx-star"} text-sm`}
                      ></i>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({result.rating})</span>
                </div>
              </div>
              <i className="bx bx-chevron-left text-gray-400"></i>
            </div>
          </Link>
        )

      case "institution":
        return (
          <Link
            to={`/institution/${result.id}`}
            key={result.id}
            className="block bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4 space-x-reverse">
              <i className="bx bx-hospital text-4xl text-blue-500"></i>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{result.name}</h3>
                <p className="text-gray-600">{result.description}</p>
                <div className="flex items-center space-x-4 space-x-reverse mt-2">
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <i className="bx bx-star text-yellow-500"></i>
                    <span className="text-sm">{result.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <i className="bx bx-map text-gray-400"></i>
                    <span className="text-sm">{result.distance}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      result.availability === "متاح" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {result.availability}
                  </span>
                </div>
              </div>
              <i className="bx bx-chevron-left text-gray-400"></i>
            </div>
          </Link>
        )

      case "service":
        return (
          <div key={result.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center space-x-4 space-x-reverse">
              <i className="bx bx-cog text-4xl text-purple-500"></i>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">{result.name}</h3>
                <p className="text-gray-600">{result.description}</p>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-1">متاح في:</p>
                  <div className="flex flex-wrap gap-2">
                    {result.institutions.map((inst, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-800 transition-colors"
            >
              <i className="bx bx-arrow-back text-xl"></i>
              <span>العودة للرئيسية</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">نتائج البحث</h1>
              <p className="text-gray-600">البحث عن: "{query}"</p>
            </div>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex space-x-2 space-x-reverse overflow-x-auto">
            {filters.map((filterItem) => (
              <button
                key={filterItem.id}
                onClick={() => setFilter(filterItem.id)}
                className={`flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
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
              <h2 className="text-xl font-semibold text-gray-800">تم العثور على {filteredResults.length} نتيجة</h2>
            </div>
            <div className="space-y-4">{filteredResults.map(renderResult)}</div>
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="bx bx-search text-6xl text-gray-400 mb-4"></i>
            <h2 className="text-xl font-semibold text-gray-600 mb-2">لم يتم العثور على نتائج</h2>
            <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تحقق من الإملاء</p>
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
