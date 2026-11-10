// pages/DoctorProfile.jsx
import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { apiGet } from "../api/client"
import Avatar from "../components/common/Avatar"

const DoctorProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const [activeTab, setActiveTab] = useState("overview")

  const { data: doctor, isLoading, error } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => apiGet(`/doctors/${id}`, lang),
  })

  const tabKeys = ["overview", "schedule", "reviews", "contact"]
  const tabIcons = { overview: "bx-user", schedule: "bx-calendar", reviews: "bx-star", contact: "bx-phone" }

  const formatFee = (fee) => {
    if (fee == null) return t("doctors.feeOnRequest")
    return new Intl.NumberFormat(lang === "ar" ? "ar-DZ" : "fr-DZ").format(fee) + " " + t("common.currency")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <i className="bx bx-loader-alt animate-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">{t("doctors.loading")}</p>
        </div>
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <i className="bx bx-error text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("doctors.notFound")}</h2>
          <p className="text-gray-500 mb-4">{t("doctors.notFoundDesc")}</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">{t("nav.backHome")}</Link>
        </div>
      </div>
    )
  }

  const bio = lang === "ar" ? doctor.bioAr : doctor.bioFr
  const specialty = lang === "ar" ? doctor.specialty?.nameAr : doctor.specialty?.nameFr

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors">
              <i className="bx bx-arrow-back text-xl"></i>
              <span>{t("nav.backHome")}</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">{t("doctors.profile")}</h1>
            <div></div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Doctor Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start gap-6 flex-wrap">
            <Avatar name={doctor.user?.fullName ?? "?"} size="xl" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{doctor.user?.fullName}</h2>
              {specialty && (
                <p className="text-blue-600 font-medium">{specialty}</p>
              )}
              {doctor.yearsExperience && (
                <p className="text-gray-500 text-sm mt-1">
                  {doctor.yearsExperience} {t("doctors.yearsExperience")}
                </p>
              )}
              <p className="text-gray-700 font-semibold mt-2">{formatFee(doctor.consultationFeeDZD)}</p>
            </div>
            <button
              onClick={() => navigate(`/appointment/book/${id}`)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              {t("doctors.bookAppointment")}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {tabKeys.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-6 py-4 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <i className={`bx ${tabIcons[tab]}`}></i>
                {t(`doctors.tabs.${tab}`)}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div>
                {bio ? (
                  <p className="text-gray-700 leading-relaxed">{bio}</p>
                ) : (
                  <p className="text-gray-400 italic">{t("doctors.noBio")}</p>
                )}
                {doctor.institutionLinks?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-800 mb-2">{t("doctors.workingAt")}</h3>
                    <ul className="space-y-1">
                      {doctor.institutionLinks.map((link, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                          <i className="bx bx-hospital text-blue-400"></i>
                          <Link to={`/institution/${link.institution.id}`} className="hover:underline text-blue-600">
                            {lang === "ar" ? link.institution.nameAr : link.institution.nameFr}
                          </Link>
                          {link.isPrimary && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{t("doctors.primary")}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            {activeTab === "schedule" && (
              <p className="text-gray-500 text-center py-4">{t("doctors.slotsHint")}</p>
            )}
            {activeTab === "reviews" && (
              <p className="text-gray-400 italic text-center py-4">{t("doctors.noReviews")}</p>
            )}
            {activeTab === "contact" && (
              <div className="space-y-3">
                {doctor.institutionLinks?.map((link, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-600">
                    <i className="bx bx-hospital text-blue-400 text-xl"></i>
                    <Link to={`/institution/${link.institution.id}`} className="hover:underline text-blue-600">
                      {lang === "ar" ? link.institution.nameAr : link.institution.nameFr}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default DoctorProfile
