"use client"

// components/Sections/EmergencyAccess.jsx

import { useNavigate } from "react-router-dom"
import "./EmergencyAccess.css"

const EmergencyAccess = ({ onEmergencyAccess }) => {
  const navigate = useNavigate()

  const nearbyHospitals = [
    { name: "مستشفى الملك فهد", distance: "2.5 كم", availability: "متاح" },
    { name: "مستشفى الأمل", distance: "3.1 كم", availability: "مزدحم" },
    { name: "مستشفى النور", distance: "4.2 كم", availability: "متاح" },
  ]

  const handleEmergencyClick = () => {
    if (onEmergencyAccess) {
      onEmergencyAccess()
    } else {
      navigate("/emergency")
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-red-500">
      <div className="text-center mb-4">
        <i className="bx bx-first-aid text-5xl text-red-500 mb-3"></i>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">الحالات الاستعجالية</h2>
        <p className="text-gray-600 text-sm">الوصول السريع إلى الخدمات الاستعجالية دون حجز مسبق</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleEmergencyClick}
          className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 space-x-reverse font-semibold"
        >
          <i className="bx bx-phone-call"></i>
          <span>طلب طوارئ</span>
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">أقرب المستشفيات:</p>
          <div className="space-y-1">
            {nearbyHospitals.slice(0, 2).map((hospital, index) => (
              <div key={index} className="flex justify-between items-center text-xs bg-gray-50 px-2 py-1 rounded">
                <span className="font-medium">{hospital.name}</span>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hospital.availability === "متاح" ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  ></span>
                  <span>{hospital.distance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>⚠️ في حالات الطوارئ الحرجة، اتصل بـ 997</p>
        </div>
      </div>
    </div>
  )
}

export default EmergencyAccess
