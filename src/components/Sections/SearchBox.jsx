"use client"

// components/Sections/SearchBox.jsx

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./SearchBox.css"

const SearchBox = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate()

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true)
      // Simulate search delay
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
        <h2 className="text-xl font-semibold text-gray-800 mb-2">البحث الذكي</h2>
        <p className="text-gray-600 text-sm">إدخال أي اسم، كلمة مفتاحية أو مصدر للوصول السريع</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن طبيب، مستشفى، أو خدمة..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <i className="bx bx-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>

        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 space-x-reverse"
        >
          {isSearching ? (
            <>
              <i className="bx bx-loader-alt animate-spin"></i>
              <span>جاري البحث...</span>
            </>
          ) : (
            <>
              <i className="bx bx-search"></i>
              <span>بحث</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>يمكنك البحث عن:</p>
        <div className="flex flex-wrap gap-1 mt-1">
          <span className="bg-gray-100 px-2 py-1 rounded">أطباء</span>
          <span className="bg-gray-100 px-2 py-1 rounded">مستشفيات</span>
          <span className="bg-gray-100 px-2 py-1 rounded">تخصصات</span>
        </div>
      </div>
    </div>
  )
}

export default SearchBox
