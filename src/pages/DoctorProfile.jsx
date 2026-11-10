// pages/DoctorProfile.jsx

import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import Avatar from "../components/common/Avatar"

const DoctorProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")

  // Phase 5: replace with real API call: GET /doctors/:id
  // No mock data — show honest not-found state
  const doctor = null
  const loading = false

  const handleBookAppointment = () => {
    navigate(`/appointment/book/${id}`)
  }

  const tabs = [
    { id: "overview", name: "نظرة عامة", icon: "bx-user" },
    { id: "schedule", name: "المواعيد المتاحة", icon: "bx-calendar" },
    { id: "reviews", name: "التقييمات", icon: "bx-star" },
    { id: "contact", name: "التواصل", icon: "bx-phone" },
  ]

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <i className="bx bx-loader-alt animate-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">جاري تحميل بيانات الطبيب...</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <i className="bx bx-error text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">الطبيب غير موجود</h2>
          <p className="text-gray-500 mb-4">لم يتم العثور على ملف هذا الطبيب.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {doctor.bioAr && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">نبذة عن الطبيب</h3>
                <p className="text-gray-600 leading-relaxed">{doctor.bioAr}</p>
              </div>
            )}
          </div>
        )

      case "schedule":
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">المواعيد المتاحة</h3>
            <p className="text-gray-500 text-center py-8">
              <i className="bx bx-calendar text-4xl mb-2 text-gray-300"></i>
              <br />
              لا تتوفر مواعيد حالياً.
            </p>
          </div>
        )

      case "reviews":
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">تقييمات المرضى</h3>
            <p className="text-gray-500 text-center py-8">
              <i className="bx bx-star text-4xl mb-2 text-gray-300"></i>
              <br />
              لا توجد تقييمات بعد.
            </p>
          </div>
        )

      case "contact":
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">معلومات التواصل</h3>
            <p className="text-gray-500">بيانات التواصل غير متوفرة.</p>
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
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <i className="bx bx-arrow-back text-xl"></i>
              <span>العودة للرئيسية</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">ملف الطبيب</h1>
            </div>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Doctor Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar name={doctor.fullName} size="2xl" />
            <div className="flex-1 text-center md:text-start">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{doctor.fullName}</h1>
              {doctor.specialty && (
                <p className="text-xl text-blue-600 mb-2">{doctor.specialty.nameAr}</p>
              )}

              {doctor.consultationFeeDZD && (
                <div className="flex items-center gap-1 text-gray-600">
                  <i className="bx bx-money text-green-500"></i>
                  <span>
                    {new Intl.NumberFormat("ar-DZ").format(doctor.consultationFeeDZD)} دج
                  </span>
                </div>
              )}

              <button
                onClick={handleBookAppointment}
                className="mt-4 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                حجز موعد
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <i className={`bx ${tab.icon}`}></i>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  )
}

export default DoctorProfile
