"use client"

// pages/EmergencyPage.jsx

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const EmergencyPage = () => {
  const [selectedEmergencyType, setSelectedEmergencyType] = useState("")
  const [location, setLocation] = useState("")
  const [userLocation, setUserLocation] = useState(null)
  const [nearbyHospitals, setNearbyHospitals] = useState([])
  const [isLocating, setIsLocating] = useState(false)

  const emergencyTypes = [
    { id: "heart", name: "حالة قلبية", icon: "bx-heart", color: "red" },
    { id: "accident", name: "حادث", icon: "bx-car-crash", color: "orange" },
    { id: "breathing", name: "صعوبة تنفس", icon: "bx-wind", color: "blue" },
    { id: "stroke", name: "جلطة دماغية", icon: "bx-brain", color: "purple" },
    { id: "bleeding", name: "نزيف", icon: "bx-droplet", color: "red" },
    { id: "poisoning", name: "تسمم", icon: "bx-shield-x", color: "green" },
    { id: "burns", name: "حروق", icon: "bx-fire", color: "orange" },
    { id: "other", name: "أخرى", icon: "bx-plus-medical", color: "gray" },
  ]

  const mockHospitals = [
    {
      id: 1,
      name: "مستشفى الملك فهد التخصصي",
      distance: "2.5 كم",
      estimatedTime: "8 دقائق",
      availability: "متاح",
      emergencyLevel: "مستوى 1",
      phone: "+966 11 123 4567",
      specialties: ["قلب", "أعصاب", "طوارئ عامة"],
    },
    {
      id: 2,
      name: "مستشفى الأمل الخاص",
      distance: "3.1 كم",
      estimatedTime: "12 دقيقة",
      availability: "مزدحم",
      emergencyLevel: "مستوى 2",
      phone: "+966 11 234 5678",
      specialties: ["جراحة", "عظام", "طوارئ"],
    },
    {
      id: 3,
      name: "مركز النور الطبي",
      distance: "1.8 كم",
      estimatedTime: "6 دقائق",
      availability: "متاح",
      emergencyLevel: "مستوى 1",
      phone: "+966 11 345 6789",
      specialties: ["طوارئ عامة", "أطفال"],
    },
  ]

  useEffect(() => {
    setNearbyHospitals(mockHospitals)
  }, [])

  const getCurrentLocation = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setLocation("الموقع الحالي")
          setIsLocating(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsLocating(false)
          alert("لا يمكن تحديد موقعك الحالي")
        },
      )
    } else {
      setIsLocating(false)
      alert("المتصفح لا يدعم تحديد الموقع")
    }
  }

  const handleEmergencyCall = () => {
    if (!selectedEmergencyType) {
      alert("يرجى اختيار نوع الحالة الطارئة")
      return
    }

    // In a real app, this would send the emergency request to the backend
    alert("تم إرسال طلب الطوارئ! سيتم التواصل معك خلال دقائق.")
  }

  const callHospital = (phone) => {
    window.location.href = `tel:${phone}`
  }

  const getDirections = (hospitalName) => {
    // In a real app, this would open maps with directions
    alert(`فتح الخريطة للوصول إلى ${hospitalName}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100" dir="rtl">
      {/* Emergency Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center space-x-2 space-x-reverse text-white hover:text-red-200 transition-colors"
            >
              <i className="bx bx-arrow-back text-xl"></i>
              <span>العودة للرئيسية</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold flex items-center justify-center space-x-2 space-x-reverse">
                <i className="bx bx-first-aid text-2xl"></i>
                <span>الحالات الطارئة</span>
              </h1>
              <p className="text-red-200">خدمة الطوارئ على مدار الساعة</p>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <a
                href="tel:997"
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors"
              >
                اتصال 997
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Emergency Alert */}
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
          <div className="flex items-center space-x-2 space-x-reverse">
            <i className="bx bx-error text-xl"></i>
            <div>
              <strong>تنبيه:</strong> في حالات الطوارئ الحرجة، اتصل فوراً بالرقم 997 أو توجه لأقرب مستشفى
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emergency Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2 space-x-reverse">
              <i className="bx bx-plus-medical text-red-500"></i>
              <span>طلب طوارئ</span>
            </h2>

            <div className="space-y-6">
              {/* Emergency Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">نوع الحالة الطارئة:</label>
                <div className="grid grid-cols-2 gap-3">
                  {emergencyTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedEmergencyType(type.id)}
                      className={`flex items-center space-x-2 space-x-reverse p-3 rounded-lg border-2 transition-colors ${
                        selectedEmergencyType === type.id
                          ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-700`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <i className={`bx ${type.icon} text-xl`}></i>
                      <span className="text-sm font-medium">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الموقع:</label>
                <div className="flex space-x-2 space-x-reverse">
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
              </div>

              {/* Additional Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">معلومات إضافية:</label>
                <textarea
                  rows={3}
                  placeholder="اشرح الحالة بإيجاز..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Emergency Button */}
              <button
                onClick={handleEmergencyCall}
                className="w-full bg-red-600 text-white py-4 rounded-lg hover:bg-red-700 transition-colors font-bold text-lg flex items-center justify-center space-x-2 space-x-reverse"
              >
                <i className="bx bx-phone-call text-xl"></i>
                <span>إرسال طلب طوارئ</span>
              </button>
            </div>
          </div>

          {/* Nearby Hospitals */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2 space-x-reverse">
              <i className="bx bx-hospital text-blue-500"></i>
              <span>أقرب المستشفيات</span>
            </h2>

            <div className="space-y-4">
              {nearbyHospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{hospital.name}</h3>
                      <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600 mt-1">
                        <span className="flex items-center space-x-1 space-x-reverse">
                          <i className="bx bx-map"></i>
                          <span>{hospital.distance}</span>
                        </span>
                        <span className="flex items-center space-x-1 space-x-reverse">
                          <i className="bx bx-time"></i>
                          <span>{hospital.estimatedTime}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          hospital.availability === "متاح"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {hospital.availability}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">{hospital.emergencyLevel}</div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {hospital.specialties.map((specialty, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2 space-x-reverse">
                    <button
                      onClick={() => callHospital(hospital.phone)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-1 space-x-reverse"
                    >
                      <i className="bx bx-phone"></i>
                      <span>اتصال</span>
                    </button>
                    <button
                      onClick={() => getDirections(hospital.name)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-1 space-x-reverse"
                    >
                      <i className="bx bx-directions"></i>
                      <span>الاتجاهات</span>
                    </button>
                    <Link
                      to={`/institution/${hospital.id}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center"
                    >
                      <i className="bx bx-info-circle"></i>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Tips */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2 space-x-reverse">
            <i className="bx bx-info-circle text-blue-500"></i>
            <span>نصائح الطوارئ</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <i className="bx bx-heart text-4xl text-red-500 mb-3"></i>
              <h3 className="font-semibold text-gray-800 mb-2">النوبة القلبية</h3>
              <p className="text-sm text-gray-600">اتصل بـ 997 فوراً، أعط الشخص أسبرين إذا كان متاحاً</p>
            </div>
            <div className="text-center p-4">
              <i className="bx bx-wind text-4xl text-blue-500 mb-3"></i>
              <h3 className="font-semibold text-gray-800 mb-2">صعوبة التنفس</h3>
              <p className="text-sm text-gray-600">ساعد الشخص على الجلوس، فك الملابس الضيقة</p>
            </div>
            <div className="text-center p-4">
              <i className="bx bx-droplet text-4xl text-red-500 mb-3"></i>
              <h3 className="font-semibold text-gray-800 mb-2">النزيف</h3>
              <p className="text-sm text-gray-600">اضغط مباشرة على الجرح بقطعة قماش نظيفة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyPage
