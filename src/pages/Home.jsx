// pages/Home.jsx

import "./Home.css"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import SearchBox from "../components/Sections/SearchBox"
import SmartAssistant from "../components/Sections/SmartAssistant"
import EmergencyAccess from "../components/Sections/EmergencyAccess"
import HealthInstitutions from "../components/Sections/HealthInstitutions"

const Home = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

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

  const features = [
    { key: "security", icon: "bx-shield-check", color: "text-green-500" },
    { key: "availability", icon: "bx-time", color: "text-blue-500" },
    { key: "mobile", icon: "bx-mobile-alt", color: "text-purple-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/logo.jpg"
                alt={t("brand.logoAlt")}
                className="w-12 h-12 rounded-full object-cover shadow-md"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{t("brand.nameAr")}</h1>
                <p className="text-gray-600">{t("brand.name")}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => navigate("/login")}
              >
                {t("nav.login")}
              </button>
              <button
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => navigate("/register")}
              >
                {t("nav.register")}
              </button>
              {/* Language switcher */}
              <button
                onClick={() => i18n.changeLanguage(i18n.language === "ar" ? "fr" : "ar")}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors border border-gray-300 px-3 py-2 rounded-lg"
              >
                {t("langSwitch.label")}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10">
        {/* Introduction Section */}
        <section className="mb-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/logo.jpg"
              alt={t("brand.logoAlt")}
              className="w-16 h-16 rounded-full object-cover shadow-lg me-4"
            />
            <h2 className="text-4xl font-bold text-gray-800">
              {t("home.journeyTitle")}
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-8">
            {t("home.journeySubtitle")}
          </p>

          {/* User Journey Steps */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-start">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">{t("home.journeyStepsTitle")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {stepsLeft.map((step, i) => (
                  <div key={step.key} className="flex items-start gap-4">
                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{t(`home.steps.${step.key}.label`)}</h4>
                      <p className="text-gray-600">{t(`home.steps.${step.key}.sub`)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {stepsRight.map((step, i) => (
                  <div key={step.key} className="flex items-start gap-4">
                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                      {i + 5}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{t(`home.steps.${step.key}.label`)}</h4>
                      <p className="text-gray-600">{t(`home.steps.${step.key}.sub`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Service Cards */}
        <section className="mb-12">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">{t("home.mainServicesTitle")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SearchBox onSearch={handleSearch} />
            <SmartAssistant />
            <EmergencyAccess onEmergencyAccess={handleEmergencyAccess} />
            <HealthInstitutions onInstitutionSelect={handleInstitutionSelect} />
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">{t("home.featuresTitle")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.key} className="text-center">
                <i className={`bx ${f.icon} text-5xl ${f.color} mb-4`}></i>
                <h4 className="text-xl font-semibold mb-2">{t(`home.features.${f.key}.title`)}</h4>
                <p className="text-gray-600">{t(`home.features.${f.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <img src="/logo.jpg" alt={t("brand.logoAlt")} className="w-8 h-8 rounded-full object-cover me-2" />
            <span className="font-semibold">{t("brand.nameAr")}</span>
          </div>
          <p>
            &copy; {new Date().getFullYear()} {t("brand.nameAr")}. {t("footer.rights")}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
