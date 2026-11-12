// pages/InstitutionPage.jsx
import "./InstitutionPage.css"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowLeft, ArrowRight, Home as HomeIcon, Settings, UserPlus, Camera,
  Plus, TestTube, Heart, Phone, MapPin, Building2, Loader2, AlertCircle,
} from "lucide-react"
import { apiGet } from "../api/client"
import AdminPanel from "../components/Sections/InstitutionDetails/AdminPanel"
import DoctorsSection from "../components/Sections/InstitutionDetails/DoctorsSection"
import ImagingSection from "../components/Sections/InstitutionDetails/ImagingSection"
import PharmacySection from "../components/Sections/InstitutionDetails/PharmacySection"
import LabSection from "../components/Sections/InstitutionDetails/LabSection"
import NursesSection from "../components/Sections/InstitutionDetails/NursesSection"

// Static color map for tab active states — avoids purged dynamic Tailwind classes
const SECTION_ACTIVE_STYLES = {
  blue:   "border-blue-500 text-blue-600 bg-blue-50",
  gray:   "border-gray-500 text-gray-600 bg-gray-50",
  green:  "border-green-500 text-green-600 bg-green-50",
  purple: "border-purple-500 text-purple-600 bg-purple-50",
  red:    "border-red-500 text-red-600 bg-red-50",
  yellow: "border-yellow-500 text-yellow-600 bg-yellow-50",
  pink:   "border-pink-500 text-pink-600 bg-pink-50",
}

const SECTIONS = [
  { id: "overview", color: "blue",   Icon: HomeIcon  },
  { id: "admin",    color: "gray",   Icon: Settings  },
  { id: "doctors",  color: "green",  Icon: UserPlus  },
  { id: "imaging",  color: "purple", Icon: Camera    },
  { id: "pharmacy", color: "red",    Icon: Plus      },
  { id: "lab",      color: "yellow", Icon: TestTube  },
  { id: "nurses",   color: "pink",   Icon: Heart     },
]

const InstitutionPage = () => {
  const { id, section } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const [activeSection, setActiveSection] = useState(section || "overview")

  const { data: institution, isLoading, error } = useQuery({
    queryKey: ["institution", id],
    queryFn: () => apiGet(`/institutions/${id}`, lang),
  })

  useEffect(() => {
    if (section) setActiveSection(section)
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
                <Building2 size={64} className="text-blue-500 mb-4 mx-auto" aria-hidden />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {lang === "ar" ? institution?.nameAr : institution?.nameFr}
              </h2>
              <p className="text-gray-600">
                {lang === "ar" ? institution?.commune?.nameAr : institution?.commune?.nameFr}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {institution?.phone && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Phone size={32} className="text-green-500 mb-2 mx-auto" aria-hidden />
                  <h3 className="font-semibold text-gray-800">{t("institutions.phone")}</h3>
                  <a href={`tel:${institution.phone}`} className="text-gray-600 hover:underline" dir="ltr">
                    {institution.phone}
                  </a>
                </div>
              )}
              {(lang === "ar" ? institution?.addressAr : institution?.addressFr) && (
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <MapPin size={32} className="text-purple-500 mb-2 mx-auto" aria-hidden />
                  <h3 className="font-semibold text-gray-800">{t("institutions.address")}</h3>
                  <p className="text-gray-600">
                    {lang === "ar" ? institution.addressAr : institution.addressFr}
                  </p>
                </div>
              )}
              {institution?.hasEmergency24h && (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <Heart size={32} className="text-red-500 mb-2 mx-auto" aria-hidden />
                  <h3 className="font-semibold text-gray-800">{t("emergency.open24h")}</h3>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{t("institutions.quickServices")}</h3>
              <Link
                to={`/institution/${id}/doctors`}
                className="block w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-center mb-3"
              >
                {t("institutions.bookAppointment")}
              </Link>
              {/* Report an error in this information */}
              <Link
                to={`/contact?type=REPORT_ERROR&ref=${encodeURIComponent(id)}&name=${encodeURIComponent(lang === "ar" ? institution?.nameAr ?? "" : institution?.nameFr ?? "")}`}
                className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 underline py-1"
              >
                {t("institutions.reportError")}
              </Link>
            </div>
          </div>
        )
    }
  }

  const isRtl = lang === "ar"
  const BackIcon = isRtl ? ArrowRight : ArrowLeft

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-blue-600 mb-4 mx-auto" aria-hidden />
          <p className="text-gray-600">{t("institutions.loading")}</p>
        </div>
      </div>
    )
  }

  if (error || !institution) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle size={64} className="text-gray-400 mb-4 mx-auto" aria-hidden />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("institutions.notFound")}</h2>
          <p className="text-gray-500 mb-4">{t("institutions.notFoundDesc")}</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">{t("nav.backHome")}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded shrink-0">
              <BackIcon size={20} aria-hidden />
              <span className="text-sm sm:text-base">{t("nav.backHome")}</span>
            </Link>
            <div className="text-center min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-gray-800 truncate">
                {lang === "ar" ? institution.nameAr : institution.nameFr}
              </h1>
              <p className="text-gray-600 text-sm">{t("institutions.digitalPlatform")}</p>
            </div>
            <div aria-hidden className="w-10 shrink-0" />
          </div>
        </div>
      </header>

      <nav className="bg-white border-b" aria-label={t("nav.mainNav")}>
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto" role="tablist">
            {SECTIONS.map((sectionItem) => {
              const SectionIcon = sectionItem.Icon
              return (
                <button
                  key={sectionItem.id}
                  role="tab"
                  aria-selected={activeSection === sectionItem.id}
                  onClick={() => handleSectionChange(sectionItem.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-4 border-b-2 transition-colors whitespace-nowrap text-sm min-h-[48px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                    activeSection === sectionItem.id
                      ? SECTION_ACTIVE_STYLES[sectionItem.color]
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <SectionIcon size={16} aria-hidden />
                  <span>{t(`institutions.sections.${sectionItem.id}`)}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 sm:py-8">{renderActiveSection()}</main>
    </div>
  )
}

export default InstitutionPage
