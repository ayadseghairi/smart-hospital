// pages/EmergencyPage.jsx

import { useState } from "react"
import { Link } from "react-router-dom"

// Algerian national emergency numbers — verified against official sources
const EMERGENCY_NUMBERS = [
  { labelAr: "الحماية المدنية", number: "14" },
  { labelAr: "الشرطة الوطنية", number: "17" },
  { labelAr: "الدرك الوطني", number: "1055" },
  { labelAr: "سامو (الإسعاف الطبي العاجل)", number: "115" },
]

// Static color map — avoids dynamic Tailwind class interpolation that gets purged
const EMERGENCY_TYPE_STYLES = {
  heart: "border-red-500 bg-red-50 text-red-700",
  accident: "border-orange-500 bg-orange-50 text-orange-700",
  breathing: "border-blue-500 bg-blue-50 text-blue-700",
  stroke: "border-purple-500 bg-purple-50 text-purple-700",
  bleeding: "border-red-500 bg-red-50 text-red-700",
  poisoning: "border-green-500 bg-green-50 text-green-700",
  burns: "border-orange-500 bg-orange-50 text-orange-700",
  other: "border-gray-500 bg-gray-50 text-gray-700",
}

const EMERGENCY_TYPES = [
  { id: "heart", name: "حالة قلبية", icon: "bx-heart" },
  { id: "accident", name: "حادث", icon: "bx-car-crash" },
  { id: "breathing", name: "صعوبة تنفس", icon: "bx-wind" },
  { id: "stroke", name: "جلطة دماغية", icon: "bx-brain" },
  { id: "bleeding", name: "نزيف", icon: "bx-droplet" },
  { id: "poisoning", name: "تسمم", icon: "bx-shield-x" },
  { id: "burns", name: "حروق", icon: "bx-fire" },
  { id: "other", name: "أخرى", icon: "bx-plus-medical" },
]

const EmergencyPage = () => {
  const [selectedEmergencyType, setSelectedEmergencyType] = useState("")
  const [location, setLocation] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState("")
  // nearbyHospitals will be populated from the real API in Phase 5
  const nearbyHospitals = []

  const getCurrentLocation = () => {
    setIsLocating(true)
    setLocationError("")
    if (!navigator.geolocation) {
      setLocationError("المتصفح لا يدعم تحديد الموقع الجغرافي.")
      setIsLocating(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(
          `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`
        )
        setIsLocating(false)
        // Phase 5: call /emergency/nearby?lat=&lng= here
      },
      () => {
        setLocationError("تعذّر تحديد موقعك. يرجى السماح للمتصفح بالوصول إلى الموقع.")
        setIsLocating(false)
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100" dir="rtl">
      {/* Emergency Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-white hover:text-red-200 transition-colors"
            >
              <i className="bx bx-arrow-back text-xl"></i>
              <span>العودة للرئيسية</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold flex items-center justify-center gap-2">
                <i className="bx bx-first-aid text-2xl"></i>
                <span>الحالات الطارئة</span>
              </h1>
              <p className="text-red-200">أرقام الطوارئ الوطنية</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="tel:14"
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors"
              >
                اتصال 14
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Emergency Alert */}
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
          <div className="flex items-center gap-2">
            <i className="bx bx-error text-xl"></i>
            <div>
              <strong>تنبيه:</strong> في حالات الطوارئ الحرجة، اتصل فوراً بـ <strong>14 (الحماية المدنية)</strong> أو <strong>115 (سامو)</strong> أو توجه لأقرب مستشفى.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emergency Numbers */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <i className="bx bx-phone text-red-500"></i>
              <span>أرقام الطوارئ الوطنية</span>
            </h2>
            <div className="space-y-3">
              {EMERGENCY_NUMBERS.map((n) => (
                <div
                  key={n.number}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">{n.labelAr}</span>
                  <a
                    href={`tel:${n.number}`}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-bold"
                  >
                    <i className="bx bx-phone-call"></i>
                    <span>{n.number}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Location & nearby hospitals */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <i className="bx bx-hospital text-blue-500"></i>
              <span>أقرب المستشفيات</span>
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">تحديد الموقع:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="أدخل موقعك أو اسمح بتحديد الموقع"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button
                  onClick={getCurrentLocation}
                  disabled={isLocating}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLocating ? (
                    <i className="bx bx-loader-alt animate-spin"></i>
                  ) : (
                    <i className="bx bx-current-location"></i>
                  )}
                </button>
              </div>
              {locationError && (
                <p className="text-sm text-red-600 mt-2">{locationError}</p>
              )}
            </div>

            {nearbyHospitals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="bx bx-map text-4xl mb-2 text-gray-300"></i>
                <p className="text-sm">لا تتوفر بيانات موقع حالياً.</p>
                <p className="text-xs mt-1 text-gray-400">
                  حدّد موقعك لعرض أقرب المؤسسات الصحية.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {nearbyHospitals.map((hospital) => (
                  <div
                    key={hospital.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-gray-800">{hospital.nameAr}</h3>
                    {hospital.phone && (
                      <a
                        href={`tel:${hospital.phone}`}
                        className="mt-2 inline-flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        <i className="bx bx-phone"></i>
                        <span>اتصال</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Emergency Type info */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <i className="bx bx-plus-medical text-red-500"></i>
            <span>نوع الحالة الطارئة</span>
          </h2>
          <p className="text-sm text-gray-500 mb-4">حدد نوع الحالة وأبلغ المسعف عند الاتصال:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EMERGENCY_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedEmergencyType(type.id)}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  selectedEmergencyType === type.id
                    ? EMERGENCY_TYPE_STYLES[type.id]
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <i className={`bx ${type.icon} text-xl`}></i>
                <span className="text-sm font-medium">{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Emergency Tips */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <i className="bx bx-info-circle text-blue-500"></i>
            <span>نصائح الطوارئ</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <i className="bx bx-heart text-4xl text-red-500 mb-3"></i>
              <h3 className="font-semibold text-gray-800 mb-2">النوبة القلبية</h3>
              <p className="text-sm text-gray-600">اتصل بـ 115 أو 14 فوراً. حافظ على هدوء المصاب.</p>
            </div>
            <div className="text-center p-4">
              <i className="bx bx-wind text-4xl text-blue-500 mb-3"></i>
              <h3 className="font-semibold text-gray-800 mb-2">صعوبة التنفس</h3>
              <p className="text-sm text-gray-600">ساعد الشخص على الجلوس، فك الملابس الضيقة.</p>
            </div>
            <div className="text-center p-4">
              <i className="bx bx-droplet text-4xl text-red-500 mb-3"></i>
              <h3 className="font-semibold text-gray-800 mb-2">النزيف</h3>
              <p className="text-sm text-gray-600">اضغط مباشرة على الجرح بقطعة قماش نظيفة.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyPage
