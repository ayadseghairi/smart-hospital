// components/Sections/EmergencyAccess.jsx

import { useNavigate } from "react-router-dom"
import "./EmergencyAccess.css"

const EmergencyAccess = ({ onEmergencyAccess }) => {
  const navigate = useNavigate()

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
          className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-semibold"
        >
          <i className="bx bx-phone-call"></i>
          <span>الوصول إلى خدمات الطوارئ</span>
        </button>

        {/* Algerian emergency numbers — verified against official sources */}
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between bg-gray-50 px-2 py-1 rounded">
            <span>الحماية المدنية</span>
            <a href="tel:14" className="font-bold text-red-600 hover:underline">14</a>
          </div>
          <div className="flex justify-between bg-gray-50 px-2 py-1 rounded">
            <span>الشرطة</span>
            <a href="tel:17" className="font-bold text-red-600 hover:underline">17</a>
          </div>
          <div className="flex justify-between bg-gray-50 px-2 py-1 rounded">
            <span>سامو (إسعاف طبي)</span>
            <a href="tel:115" className="font-bold text-red-600 hover:underline">115</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyAccess
