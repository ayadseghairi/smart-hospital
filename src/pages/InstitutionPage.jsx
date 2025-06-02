"use client"

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

const InstitutionPage = () => {
  const { id, section } = useParams()
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState(section || "overview")
  const [institution, setInstitution] = useState(null)

  // Mock data - in real app, fetch from API based on id
  const institutions = {
    1: {
      id: 1,
      name: "مستشفى الملك فهد التخصصي",
      type: "government",
      specialties: ["قلب", "أعصاب", "عظام"],
      rating: 4.8,
      distance: "2.5 كم",
      availability: "متاح",
    },
    2: {
      id: 2,
      name: "مستشفى الأمل الخاص",
      type: "private",
      specialties: ["نساء وولادة", "أطفال", "جراحة"],
      rating: 4.6,
      distance: "3.1 كم",
      availability: "مزدحم",
    },
    3: {
      id: 3,
      name: "مركز النور الطبي",
      type: "private",
      specialties: ["عيون", "أسنان", "جلدية"],
      rating: 4.7,
      distance: "1.8 كم",
      availability: "متاح",
    },
  }

  useEffect(() => {
    const institutionData = institutions[id]
    if (institutionData) {
      setInstitution(institutionData)
    }
  }, [id])

  useEffect(() => {
    if (section) {
      setActiveSection(section)
    }
  }, [section])

  const sections = [
    { id: "overview", name: "نظرة عامة", icon: "bx-home", color: "blue" },
    { id: "admin", name: "الإدارة العامة", icon: "bx-cog", color: "gray" },
    { id: "doctors", name: "الأطباء", icon: "bx-user-plus", color: "green" },
    { id: "imaging", name: "التصوير الطبي", icon: "bx-camera", color: "purple" },
    { id: "pharmacy", name: "الصيدلية", icon: "bx-plus-medical", color: "red" },
    { id: "lab", name: "المخبر", icon: "bx-test-tube", color: "yellow" },
    { id: "nurses", name: "التمريض", icon: "bx-heart", color: "pink" },
  ]

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
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {institution?.name || "مستشفى الملك فهد التخصصي"}
              </h2>
              <p className="text-gray-600">مرحباً بكم في منصة المستشفى الرقمية</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <i className="bx bx-time text-3xl text-blue-500 mb-2"></i>
                <h3 className="font-semibold text-gray-800">ساعات العمل</h3>
                <p className="text-gray-600">24/7</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <i className="bx bx-phone text-3xl text-green-500 mb-2"></i>
                <h3 className="font-semibold text-gray-800">الهاتف</h3>
                <p className="text-gray-600">+966 11 123 4567</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <i className="bx bx-map text-3xl text-purple-500 mb-2"></i>
                <h3 className="font-semibold text-gray-800">الموقع</h3>
                <p className="text-gray-600">الرياض، المملكة العربية السعودية</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">التخصصات المتاحة</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["قلب وأوعية دموية", "أعصاب", "عظام", "نساء وولادة", "أطفال", "جراحة عامة"].map(
                    (specialty, index) => (
                      <div key={index} className="flex items-center space-x-2 space-x-reverse">
                        <i className="bx bx-check text-green-500"></i>
                        <span className="text-gray-700">{specialty}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">الخدمات السريعة</h3>
                <div className="space-y-3">
                  <Link
                    to={`/institution/${id}/doctors`}
                    className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    حجز موعد
                  </Link>
                  <Link
                    to={`/institution/${id}/lab`}
                    className="block w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
                  >
                    استعلام عن نتائج
                  </Link>
                  <Link
                    to={`/institution/${id}/doctors`}
                    className="block w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors text-center"
                  >
                    تواصل مع الطبيب
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  if (!institution) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <i className="bx bx-loader-alt animate-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">جاري تحميل بيانات المستشفى...</p>
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
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                to="/"
                className="flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-800 transition-colors"
              >
                <i className="bx bx-arrow-back text-xl"></i>
                <span>العودة للرئيسية</span>
              </Link>
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">{institution.name}</h1>
              <p className="text-gray-600">المنصة الرقمية</p>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  institution.availability === "متاح" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {institution.availability}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-0 space-x-reverse overflow-x-auto">
            {sections.map((sectionItem) => (
              <button
                key={sectionItem.id}
                onClick={() => handleSectionChange(sectionItem.id)}
                className={`flex items-center space-x-2 space-x-reverse px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeSection === sectionItem.id
                    ? `border-${sectionItem.color}-500 text-${sectionItem.color}-600 bg-${sectionItem.color}-50`
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
