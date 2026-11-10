// pages/EmergencyPage.jsx
import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { apiGet } from "../api/client"

// Static color map — avoids dynamic Tailwind class interpolation that gets purged
const EMERGENCY_TYPE_STYLES = {
  heart:     "border-red-500 bg-red-50 text-red-700",
  accident:  "border-orange-500 bg-orange-50 text-orange-700",
  breathing: "border-blue-500 bg-blue-50 text-blue-700",
  stroke:    "border-purple-500 bg-purple-50 text-purple-700",
  bleeding:  "border-red-500 bg-red-50 text-red-700",
  poisoning: "border-green-500 bg-green-50 text-green-700",
  burns:     "border-orange-500 bg-orange-50 text-orange-700",
  other:     "border-gray-500 bg-gray-50 text-gray-700",
}

const EMERGENCY_TYPE_ICONS = {
  heart: "bx-heart", accident: "bx-car-crash", breathing: "bx-wind",
  stroke: "bx-brain", bleeding: "bx-droplet", poisoning: "bx-shield-x",
  burns: "bx-fire", other: "bx-plus-medical",
}

const EMERGENCY_TIPS = [
  { key: "heart",     icon: "bx-heart",   color: "text-red-500" },
  { key: "breathing", icon: "bx-wind",    color: "text-blue-500" },
  { key: "bleeding",  icon: "bx-droplet", color: "text-red-500" },
]

const EmergencyPage = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const [selectedEmergencyType, setSelectedEmergencyType] = useState("")
  const [userCoords, setUserCoords] = useState(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState("")

  // Load national emergency numbers from the API
  const { data: numbersData } = useQuery({
    queryKey: ["emergency-numbers"],
    queryFn: () => apiGet("/emergency/numbers", lang),
  })

  // Load nearby hospitals when we have coordinates
  const { data: nearbyData, isLoading: nearbyLoading } = useQuery({
    queryKey: ["emergency-nearby", userCoords?.lat, userCoords?.lng],
    queryFn: () => apiGet(`/emergency/nearby?lat=${userCoords.lat}&lng=${userCoords.lng}`, lang),
    enabled: !!userCoords,
  })

  const emergencyNumbers = numbersData ?? []
  const nearbyHospitals = nearbyData ?? []

  // Map DB number labels to i18n keys (fallback to labelAr/labelFr)
  const numberI18nKey = (num) => {
    if (num.number === "14")   return t("emergency.civil")
    if (num.number === "17")   return t("emergency.police")
    if (num.number === "1055") return t("emergency.gendarmerie")
    if (num.number === "115")  return t("emergency.samu")
    return lang === "ar" ? num.labelAr : num.labelFr
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t("emergency.geoNotSupported"))
      return
    }
    setIsLocating(true)
    setLocationError("")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setIsLocating(false)
      },
      () => {
        setLocationError(t("emergency.geoDenied"))
        setIsLocating(false)
      }
    )
  }

  const emergencyTypeKeys = ["heart", "accident", "breathing", "stroke", "bleeding", "poisoning", "burns", "other"]

  const formatDistance = (km) => {
    if (km == null) return ""
    if (km < 1) return `${Math.round(km * 1000)} m`
    return `${km.toFixed(1)} km`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:text-red-200 transition-colors">
              <i className="bx bx-arrow-back text-xl"></i>
              <span>{t("nav.backHome")}</span>
            </Link>
            <h1 className="text-2xl font-bold">{t("emergency.pageTitle")}</h1>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Emergency Numbers Column */}
          <div className="space-y-6">
            {/* National numbers — from API */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="bx bx-phone text-red-500"></i>
                {t("emergency.nationalNumbers")}
              </h2>
              <div className="space-y-3">
                {emergencyNumbers.length === 0 ? (
                  // Hardcoded fallback shown immediately (UX: no blank while API loads)
                  [{ number: "14", key: "civil" }, { number: "17", key: "police" },
                   { number: "1055", key: "gendarmerie" }, { number: "115", key: "samu" }].map((n) => (
                    <a key={n.number} href={`tel:${n.number}`}
                      className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors group">
                      <span className="font-medium text-gray-800">{t(`emergency.${n.key}`)}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-600 text-lg" dir="ltr">{n.number}</span>
                        <i className="bx bx-phone-call text-red-500 group-hover:scale-110 transition-transform"></i>
                      </div>
                    </a>
                  ))
                ) : (
                  emergencyNumbers.map((n) => (
                    <a key={n.id} href={`tel:${n.number}`}
                      className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors group">
                      <span className="font-medium text-gray-800">{numberI18nKey(n)}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-600 text-lg" dir="ltr">{n.number}</span>
                        <i className="bx bx-phone-call text-red-500 group-hover:scale-110 transition-transform"></i>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>

            {/* Emergency type selector */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{t("emergency.emergencyTypeTitle")}</h2>
              <p className="text-gray-600 text-sm mb-4">{t("emergency.emergencyTypeHint")}</p>
              <div className="grid grid-cols-2 gap-3">
                {emergencyTypeKeys.map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedEmergencyType(key)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors text-sm font-medium ${
                      selectedEmergencyType === key
                        ? EMERGENCY_TYPE_STYLES[key]
                        : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <i className={`bx ${EMERGENCY_TYPE_ICONS[key]} text-lg`}></i>
                    {t(`emergency.types.${key}`)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">{t("emergency.tipsTitle")}</h2>
              <div className="space-y-3">
                {EMERGENCY_TIPS.map(({ key, icon, color }) => (
                  <div key={key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <i className={`bx ${icon} text-xl ${color}`}></i>
                    <p className="text-sm text-gray-700">{t(`emergency.tips.${key}`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Nearby Hospitals Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="bx bx-map text-blue-500"></i>
                {t("emergency.nearestHospitals")}
              </h2>

              {!userCoords ? (
                <div className="text-center py-6">
                  <i className="bx bx-map-pin text-4xl text-gray-300 mb-3"></i>
                  <p className="text-gray-600 mb-2">{t("emergency.geoHint")}</p>
                  {locationError && <p className="text-red-500 text-sm mb-3">{locationError}</p>}
                  <button
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLocating ? t("emergency.noLocation") : t("emergency.locationLabel")}
                  </button>
                </div>
              ) : nearbyLoading ? (
                <p className="text-gray-500 text-center py-4">{t("common.loading")}</p>
              ) : nearbyHospitals.length === 0 ? (
                <p className="text-gray-500 text-center py-4">{t("institutions.empty")}</p>
              ) : (
                <div className="space-y-3">
                  {nearbyHospitals.map((hospital) => (
                    <div key={hospital.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {lang === "ar" ? hospital.nameAr : hospital.nameFr}
                          </h3>
                          {(lang === "ar" ? hospital.addressAr : hospital.addressFr) && (
                            <p className="text-sm text-gray-500">
                              {lang === "ar" ? hospital.addressAr : hospital.addressFr}
                            </p>
                          )}
                          {hospital.distanceKm != null && (
                            <p className="text-xs text-blue-600 mt-1">{formatDistance(hospital.distanceKm)}</p>
                          )}
                        </div>
                        {hospital.phone && (
                          <a href={`tel:${hospital.phone}`}
                            className="flex-shrink-0 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm"
                            dir="ltr">
                            <i className="bx bx-phone-call me-1"></i>
                            {hospital.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmergencyPage
