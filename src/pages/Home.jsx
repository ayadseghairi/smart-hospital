// pages/Home.jsx
import "./Home.css"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ShieldCheck, Clock, Smartphone } from "lucide-react"
import SearchBox from "../components/Sections/SearchBox"
import SmartAssistant from "../components/Sections/SmartAssistant"
import EmergencyAccess from "../components/Sections/EmergencyAccess"
import HealthInstitutions from "../components/Sections/HealthInstitutions"
import InstallBanner from "../components/InstallApp/InstallBanner"
import Layout from "../components/Layout"

// lucide-react icon map — tree-shaken, no boxicons
const FEATURE_ICONS = {
  security:     { Icon: ShieldCheck, color: "text-green-500" },
  availability: { Icon: Clock,        color: "text-blue-500" },
  mobile:       { Icon: Smartphone,   color: "text-purple-500" },
}

const Home = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleInstitutionSelect = (institution) => {
    navigate(`/institution/${institution.id}`)
  }

  const handleEmergencyAccess = () => {
    navigate("/emergency")
  }

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  const stepsLeft = [
    { key: "platform" },
    { key: "browse" },
    { key: "admin" },
    { key: "doctors" },
  ]
  const stepsRight = [
    { key: "imaging" },
    { key: "pharmacy" },
    { key: "lab" },
    { key: "nurses" },
  ]

  const featureKeys = ["security", "availability", "mobile"]

  return (
    <Layout>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8 sm:py-10">

          {/* Install banner — only shown when installable, above the fold on phones */}
          <div className="mb-6">
            <InstallBanner />
          </div>

          {/* Introduction Section */}
          <section className="mb-10 sm:mb-12 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-5 sm:mb-6">
              <img
                src="/logo.jpg"
                alt={t("brand.logoAlt")}
                width={64}
                height={64}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shadow-lg shrink-0"
                loading="eager"
              />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 leading-snug">
                {t("home.journeyTitle")}
              </h2>
            </div>
            <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
              {t("home.journeySubtitle")}
            </p>

            {/* User Journey Steps */}
            <div className="bg-white rounded-xl shadow-lg p-5 sm:p-8 text-start">
              <h3 className="text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 text-gray-800">{t("home.journeyStepsTitle")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                <div className="space-y-4">
                  {stepsLeft.map((step, i) => (
                    <div key={step.key} className="flex items-start gap-3 sm:gap-4">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0 text-sm">
                        {i + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{t(`home.steps.${step.key}.label`)}</h4>
                        <p className="text-gray-600 text-sm overflow-wrap-anywhere">{t(`home.steps.${step.key}.sub`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {stepsRight.map((step, i) => (
                    <div key={step.key} className="flex items-start gap-3 sm:gap-4">
                      <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0 text-sm">
                        {i + 5}
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{t(`home.steps.${step.key}.label`)}</h4>
                        <p className="text-gray-600 text-sm overflow-wrap-anywhere">{t(`home.steps.${step.key}.sub`)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Main Service Cards */}
          <section className="mb-10 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">{t("home.mainServicesTitle")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              <SearchBox onSearch={handleSearch} />
              <SmartAssistant />
              <EmergencyAccess onEmergencyAccess={handleEmergencyAccess} />
              <HealthInstitutions onInstitutionSelect={handleInstitutionSelect} />
            </div>
          </section>

          {/* Features Section */}
          <section className="bg-white rounded-xl shadow-lg p-5 sm:p-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-6 sm:mb-8">{t("home.featuresTitle")}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              {featureKeys.map((key) => {
                const { Icon, color } = FEATURE_ICONS[key]
                return (
                  <div key={key} className="text-center px-2">
                    <Icon size={48} className={`${color} mb-4 mx-auto`} aria-hidden />
                    <h4 className="text-lg sm:text-xl font-semibold mb-2">{t(`home.features.${key}.title`)}</h4>
                    <p className="text-gray-600 text-sm sm:text-base">{t(`home.features.${key}.desc`)}</p>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  )
}

export default Home
