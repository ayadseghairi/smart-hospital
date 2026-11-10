// pages/InstitutionPage.jsx
import "./InstitutionPage.css"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import AdminPanel from "../components/Sections/InstitutionDetails/AdminPanel"
import DoctorsSection from "../components/Sections/InstitutionDetails/DoctorsSection"
import ImagingSection from "../components/Sections/InstitutionDetails/ImagingSection"
import PharmacySection from "../components/Sections/InstitutionDetails/PharmacySection"
import LabSection from "../components/Sections/InstitutionDetails/LabSection"
import NursesSection from "../components/Sections/InstitutionDetails/NursesSection"

// Static color map for tab active states — avoids purged dynamic Tailwind classes
const SECTION_ACTIVE_STYLES = {
  blue: "border-blue-500 text-blue-600 bg-blue-50",
  gray: "border-gray-500 text-gray-600 bg-gray-50",
  green: "border-green-500 text-green-600 bg-green-50",
  purple: "border-purple-500 text-purple-600 bg-purple-50",
  red: "border-red-500 text-red-600 bg-red-50",
  yellow: "border-yellow-500 text-yellow-600 bg-yellow-50",
  pink: "border-pink-500 text-pink-600 bg-pink-50",
}

const SECTIONS = [
  { id: "overview", name: "نظرة عامة", icon: "bx-home", color: "blue" },
  { id: "admin", name: "الإدارة العامة", icon: "bx-cog", color: "gray" },
  { id: "doctors", name: "الأطباء", icon: "bx-user-plus", color: "green" },
  { id: "imaging", name: "التصوير الطبي", icon: "bx-camera", color: "purple" },
  { id: "pharmacy", name: "الصيدلية", icon: "bx-plus-medical", color: "red" },
  { id: "lab", name: "المخبر", icon: "bx-test-tube", color: "yellow" },
  { id: "nurses", name: "التمريض", icon: "bx-heart", color: "pink" },
]

const InstitutionPage = () => {
  const { id, section } = useParams()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState(section || "overview")
  const [institution] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // Phase 5: replace with real API call: GET /institutions/:id
    // Until the API is ready, show a "not found" state instead of mock data.
    setNotFound(true)
  }, [id])

  useEffect(() => {
    if (section) {
      setActiveSection(section)
    }
  }, [section])

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId)
    navigate(`/institution/${id}/${sectionId}`)
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case "admin":
        return <AdminPanel institution={institution} />
      case "doctors":
        return <DoctorsSection institution={institution} />
      case "imaging":
        return <ImagingSection institution={institution} />
      case "pharmacy":
        return <PharmacySection institution={institution} />
      case "lab":
        return <LabSection institution={institution} />
      case "nurses":
        return <NursesSection institution={institution} />
      default:
        return (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <i className="bx bx-hospital text-6xl text-blue-500 mb-4"></i>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{institution?.nameAr}</h2>
              <p className="text-gray-600">مرحباً بكم في صفحة المؤسسة الصحية</p>
            </div>

            {institution?.phone && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <i className="bx bx-phone text-3xl text-green-500 mb-2"></i>
                  <h3 className="font-semibold text-gray-800">الهاتف</h3>
                  <p className="text-gray-600">{institution.phone}</p>
                </div>
                {institution.addressAr && (
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <i className="bx bx-map text-3xl text-purple-500 mb-2"></i>
                    <h3 className="font-semibold text-gray-800">العنوان</h3>
                    <p className="text-gray-600">{institution.addressAr}</p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">الخدمات السريعة</h3>
              <div className="space-y-3">
                <Link
                  to={`/institution/${id}/doctors`}
                  className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  حجز موعد
                </Link>
              </div>
            </div>
          </div>
        )
    }
  }

  if (notFound && !institution) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <i className="bx bx-error text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">المؤسسة غير موجودة</h2>
          <p className="text-gray-500 mb-4">لم يتم العثور على هذه المؤسسة الصحية.</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    )
  }

  if (!institution) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <i className="bx bx-loader-alt animate-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">جاري تحميل بيانات المؤسسة...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <i className="bx bx-arrow-back text-xl"></i>
                <span>العودة للرئيسية</span>
              </Link>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">{institution.nameAr}</h1>
              <p className="text-gray-600">المنصة الرقمية</p>
            </div>
            <div></div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {SECTIONS.map((sectionItem) => (
              <button
                key={sectionItem.id}
                onClick={() => handleSectionChange(sectionItem.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === sectionItem.id
                    ? SECTION_ACTIVE_STYLES[sectionItem.color]
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <i className={`bx ${sectionItem.icon}`}></i>
                <span>{sectionItem.name}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{renderActiveSection()}</main>
    </div>
  )
}

export default InstitutionPage
