"use client"

// components/Sections/HealthInstitutions.jsx

import "./HealthInstitutions.css"
import { useState } from "react"

const HealthInstitutions = ({ onInstitutionSelect }) => {
  const [showList, setShowList] = useState(false)
  const [selectedType, setSelectedType] = useState("all")

  const institutions = [
    {
      id: 1,
      name: "مستشفى الملك فهد التخصصي",
      type: "government",
      specialties: ["قلب", "أعصاب", "عظام"],
      rating: 4.8,
      distance: "2.5 كم",
      availability: "متاح",
    },
    {
      id: 2,
      name: "مستشفى الأمل الخاص",
      type: "private",
      specialties: ["نساء وولادة", "أطفال", "جراحة"],
      rating: 4.6,
      distance: "3.1 كم",
      availability: "مزدحم",
    },
    {
      id: 3,
      name: "مركز النور الطبي",
      type: "private",
      specialties: ["عيون", "أسنان", "جلدية"],
      rating: 4.7,
      distance: "1.8 كم",
      availability: "متاح",
    },
    {
      id: 4,
      name: "مستشفى الجامعة",
      type: "government",
      specialties: ["طوارئ", "باطنة", "جراحة عامة"],
      rating: 4.5,
      distance: "4.2 كم",
      availability: "متاح",
    },
  ]

  const institutionTypes = [
    { id: "all", name: "جميع المؤسسات", icon: "bx-buildings" },
    { id: "government", name: "حكومية", icon: "bx-building" },
    { id: "private", name: "خاصة", icon: "bx-store" },
  ]

  const filteredInstitutions =
    selectedType === "all" ? institutions : institutions.filter((inst) => inst.type === selectedType)

  const handleInstitutionClick = (institution) => {
    if (onInstitutionSelect) {
      onInstitutionSelect(institution)
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
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse"
          >
            <i className="bx bx-list-ul"></i>
            <span>عرض المؤسسات</span>
          </button>

          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">إحصائيات سريعة:</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-semibold text-purple-600">{institutions.length}</div>
                <div>مؤسسة صحية</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-semibold text-green-600">
                  {institutions.filter((i) => i.availability === "متاح").length}
                </div>
                <div>متاح الآن</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Filter Buttons */}
          <div className="flex space-x-1 space-x-reverse">
            {institutionTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex-1 px-2 py-1 rounded text-xs transition-colors ${
                  selectedType === type.id ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <i className={`bx ${type.icon} mr-1`}></i>
                {type.name}
              </button>
            ))}
          </div>

          {/* Institutions List */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredInstitutions.map((institution) => (
              <div
                key={institution.id}
                onClick={() => handleInstitutionClick(institution)}
                className="border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm text-gray-800">{institution.name}</h4>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      institution.availability === "متاح"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {institution.availability}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-gray-600">
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <i className="bx bx-star text-yellow-500"></i>
                    <span>{institution.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <i className="bx bx-map text-gray-400"></i>
                    <span>{institution.distance}</span>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {institution.specialties.slice(0, 2).map((specialty, index) => (
                      <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {specialty}
                      </span>
                    ))}
                    {institution.specialties.length > 2 && (
                      <span className="text-gray-500 text-xs">+{institution.specialties.length - 2}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
