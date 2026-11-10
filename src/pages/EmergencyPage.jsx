// pages/EmergencyPage.jsx

import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

// Algerian national emergency numbers — verified against official sources
const EMERGENCY_NUMBERS = [
  { key: "civil", number: "14" },
  { key: "police", number: "17" },
  { key: "gendarmerie", number: "1055" },
  { key: "samu", number: "115" },
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

const EMERGENCY_TYPE_ICONS = {
  heart: "bx-heart",
  accident: "bx-car-crash",
  breathing: "bx-wind",
  stroke: "bx-brain",
  bleeding: "bx-droplet",
  poisoning: "bx-shield-x",
  burns: "bx-fire",
  other: "bx-plus-medical",
}

const EMERGENCY_TIPS = [
  { key: "heart", icon: "bx-heart", color: "text-red-500" },
  { key: "breathing", icon: "bx-wind", color: "text-blue-500" },
  { key: "bleeding", icon: "bx-droplet", color: "text-red-500" },
]

const EmergencyPage = () => {
  const { t } = useTranslation()
  const [selectedEmergencyType, setSelectedEmergencyType] = useState("")
  const [location, setLocation] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState("")
  // nearbyHospitals will be populated from the real API in Phase 5
  const nearbyHospitals = []

  const emergencyTypeKeys = ["heart", "accident", "breathing", "stroke", "bleeding", "poisoning", "burns", "other"]

  const getCurrentLocation = () => {
    setIsLocating(true)
    setLocationError("")
    if (!navigator.geolocation) {
      setLocationError(t("emergency.geoNotSupported"))
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
        setLocationError(t("emergency.geoDenied"))
        setIsLocating(false)
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Emergency Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-white hover:text-red-200 transition-colors"
            >
              <i className="bx bx-arrow-back text-xl"></i>
              <span>{t("nav.backHome")}</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold flex items-center justify-center gap-2">
                <i className="bx bx-first-aid text-2xl"></i>
                <span>{t("emergency.pageTitle")}</span>
              </h1>
              <p className="text-red-200">{t("emergency.nationalNumbers")}</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="tel:14"
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors"
              >
                {t("emergency.call14")}
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
              <strong>{t("emergency.alert")}</strong>{" "}
              {t("emergency.alertText")}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emergency Numbers */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <i className="bx bx-phone text-red-500"></i>
              <span>{t("emergency.nationalNumbers")}</span>
            </h2>
            <div className="space-y-3">
              {EMERGENCY_NUMBERS.map((n) => (
                <div
                  key={n.number}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">{t(`emergency.${n.key}`)}</span>
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
              <span>{t("emergency.nearestHospitals")}</span>
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("emergency.locationLabel")}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("emergency.locationPlaceholder")}
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
                <p className="text-sm">{t("emergency.noLocation")}</p>
                <p className="text-xs mt-1 text-gray-400">{t("emergency.geoHint")}</p>
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
                        <span>{t("emergency.callButton")}</span>
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
            <span>{t("emergency.emergencyTypeTitle")}</span>
          </h2>
          <p className="text-sm text-gray-500 mb-4">{t("emergency.emergencyTypeHint")}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {emergencyTypeKeys.map((typeKey) => (
              <button
                key={typeKey}
                onClick={() => setSelectedEmergencyType(typeKey)}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  selectedEmergencyType === typeKey
                    ? EMERGENCY_TYPE_STYLES[typeKey]
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <i className={`bx ${EMERGENCY_TYPE_ICONS[typeKey]} text-xl`}></i>
                <span className="text-sm font-medium">{t(`emergency.types.${typeKey}`)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Emergency Tips */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <i className="bx bx-info-circle text-blue-500"></i>
            <span>{t("emergency.tipsTitle")}</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EMERGENCY_TIPS.map((tip) => (
              <div key={tip.key} className="text-center p-4">
                <i className={`bx ${tip.icon} text-4xl ${tip.color} mb-3`}></i>
                <h3 className="font-semibold text-gray-800 mb-2">{t(`emergency.tips.${tip.key}.title`)}</h3>
                <p className="text-sm text-gray-600">{t(`emergency.tips.${tip.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyPage
