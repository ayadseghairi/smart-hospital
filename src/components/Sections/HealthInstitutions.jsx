// components/Sections/HealthInstitutions.jsx

import "./HealthInstitutions.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const HealthInstitutions = ({ onInstitutionSelect }) => {
  const [showList, setShowList] = useState(false)
  const [selectedType, setSelectedType] = useState("all")
  const navigate = useNavigate()

  // No mock data. Institutions load from the real API (Phase 5).
  // Until then, show an honest empty state.
  const institutions = []

  const institutionTypes = [
    { id: "all", name: "جميع المؤسسات", icon: "bx-buildings" },
    { id: "PUBLIC", name: "عامة", icon: "bx-building" },
    { id: "PRIVATE", name: "خاصة", icon: "bx-store" },
  ]

  const filteredInstitutions =
    selectedType === "all"
      ? institutions
      : institutions.filter((inst) => inst.sector === selectedType)

  const handleInstitutionClick = (institution) => {
    if (onInstitutionSelect) {
      onInstitutionSelect(institution)
    } else {
      navigate(`/institution/${institution.id}`)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-purple-500">
      <div className="text-center mb-4">
        <i className="bx bx-hospital text-5xl text-purple-500 mb-3"></i>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">قائمة المؤسسات الصحية</h2>
        <p className="text-gray-600 text-sm">تصفح المستشفيات والانتقال إلى صفحاتها المخصصة</p>
      </div>

      {!showList ? (
        <div className="space-y-3">
          <button
            onClick={() => setShowList(true)}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <i className="bx bx-list-ul"></i>
            <span>عرض المؤسسات</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Filter Buttons */}
          <div className="flex gap-1">
            {institutionTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                  selectedType === type.id
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <i className={`bx ${type.icon} me-1`}></i>
                {type.name}
              </button>
            ))}
          </div>

          {/* Institutions List */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredInstitutions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="bx bx-buildings text-4xl mb-2 text-gray-300"></i>
                <p className="text-sm">لا توجد مؤسسات صحية موثقة في منطقتك بعد.</p>
                <p className="text-xs mt-1 text-gray-400">ستظهر المؤسسات هنا بعد التحقق منها.</p>
              </div>
            ) : (
              filteredInstitutions.map((institution) => (
                <div
                  key={institution.id}
                  onClick={() => handleInstitutionClick(institution)}
                  className="border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <h4 className="font-semibold text-sm text-gray-800">{institution.nameAr}</h4>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(institution.specialties || []).slice(0, 2).map((specialty, index) => (
                      <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setShowList(false)}
            className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            إخفاء القائمة
          </button>
        </div>
      )}
    </div>
  )
}

export default HealthInstitutions
