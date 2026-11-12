// pages/EmergencyPage.jsx
import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import {
  ArrowRight, ArrowLeft, Phone, PhoneCall, MapPin, Map,
  Heart, Wind, Droplets, Zap, ShieldX, Flame, Plus,
  Car, Brain,
} from "lucide-react"
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

// lucide-react icon components for emergency types (no boxicons)
const EMERGENCY_TYPE_ICONS = {
  heart:     { Icon: Heart,   color: "text-red-500" },
  accident:  { Icon: Car,     color: "text-orange-500" },
  breathing: { Icon: Wind,    color: "text-blue-500" },
  stroke:    { Icon: Brain,   color: "text-purple-500" },
  bleeding:  { Icon: Droplets,color: "text-red-500" },
  poisoning: { Icon: ShieldX, color: "text-green-500" },
  burns:     { Icon: Flame,   color: "text-orange-500" },
  other:     { Icon: Plus,    color: "text-gray-500" },
}

const EMERGENCY_TIPS = [
  { key: "heart",     Icon: Heart,    color: "text-red-500" },
  { key: "breathing", Icon: Wind,     color: "text-blue-500" },
  { key: "bleeding",  Icon: Droplets, color: "text-red-500" },
]

const EmergencyPage = () => {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const isRtl = lang === "ar"
  const [selectedEmergencyType, setSelectedEmergencyType] = useState("")
  const [userCoords, setUserCoords] = useState(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState("")
  // Commune picker fallback state
  const [showCommunePicker, setShowCommunePicker] = useState(false)
  const [selectedCommuneId, setSelectedCommuneId] = useState("")

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

  // Load communes for the picker
  const { data: communesData } = useQuery({
    queryKey: ["communes"],
    queryFn: () => apiGet("/emergency/communes", lang),
    enabled: showCommunePicker,
    staleTime: Infinity,
  })

  // Load 24h institutions by commune when selected
  const { data: communeInstitutionsData, isLoading: communeLoading } = useQuery({
    queryKey: ["emergency-by-commune", selectedCommuneId],
    queryFn: () => apiGet(`/emergency/by-commune/${selectedCommuneId}`, lang),
    enabled: !!selectedCommuneId,
  })

  const emergencyNumbers = numbersData ?? []
  const nearbyHospitals = nearbyData ?? []
  const communes = communesData ?? []
  const communeInstitutions = communeInstitutionsData ?? []

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
        setShowCommunePicker(false)
      },
      () => {
        setLocationError(t("emergency.geoDenied"))
        setIsLocating(false)
        setShowCommunePicker(true) // show commune picker as fallback
      }
    )
  }

  const emergencyTypeKeys = ["heart", "accident", "breathing", "stroke", "bleeding", "poisoning", "burns", "other"]

  const formatDistance = (km) => {
    if (km == null) return ""
    if (km < 1) return `${Math.round(km * 1000)} m`
    return `${km.toFixed(1)} km`
  }

  const BackIcon = isRtl ? ArrowRight : ArrowLeft

  return (
    <div className="min-h-dvh bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <Link to="/" className="flex items-center gap-2 hover:text-red-200 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none rounded">
              <BackIcon size={20} aria-hidden />
              <span className="text-sm sm:text-base">{t("nav.backHome")}</span>
            </Link>
            <h1 className="text-lg sm:text-2xl font-bold text-center">{t("emergency.pageTitle")}</h1>
            <div aria-hidden className="w-10" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

          {/* Emergency Numbers Column */}
          <div className="space-y-5 sm:space-y-6">
            {/* National numbers — from API */}
            <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Phone size={20} className="text-red-500 shrink-0" aria-hidden />
                {t("emergency.nationalNumbers")}
              </h2>
              <div className="space-y-3">
                {emergencyNumbers.length === 0 ? (
                  // Hardcoded fallback shown immediately (UX: no blank while API loads)
                  [{ number: "14", key: "civil" }, { number: "17", key: "police" },
                   { number: "1055", key: "gendarmerie" }, { number: "115", key: "samu" }].map((n) => (
                    <a key={n.number} href={`tel:${n.number}`}
                      className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors group min-h-[56px] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none">
                      <span className="font-medium text-gray-800 text-sm sm:text-base">{t(`emergency.${n.key}`)}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-red-600 text-base sm:text-lg" dir="ltr">{n.number}</span>
                        <PhoneCall size={18} className="text-red-500 group-hover:scale-110 transition-transform" aria-hidden />
                      </div>
                    </a>
                  ))
                ) : (
                  emergencyNumbers.map((n) => (
                    <a key={n.id} href={`tel:${n.number}`}
                      className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors group min-h-[56px] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none">
                      <span className="font-medium text-gray-800 text-sm sm:text-base">{numberI18nKey(n)}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-red-600 text-base sm:text-lg" dir="ltr">{n.number}</span>
                        <PhoneCall size={18} className="text-red-500 group-hover:scale-110 transition-transform" aria-hidden />
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>

            {/* Emergency type selector */}
            <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">{t("emergency.emergencyTypeTitle")}</h2>
              <p className="text-gray-600 text-sm mb-4">{t("emergency.emergencyTypeHint")}</p>
              <div className="grid grid-cols-2 gap-3">
                {emergencyTypeKeys.map((key) => {
                  const { Icon } = EMERGENCY_TYPE_ICONS[key]
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedEmergencyType(key)}
                      className={`flex items-center gap-2 px-3 sm:px-4 py-3 rounded-lg border-2 transition-colors text-sm font-medium min-h-[48px] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none ${
                        selectedEmergencyType === key
                          ? EMERGENCY_TYPE_STYLES[key]
                          : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <Icon size={18} aria-hidden />
                      <span className="overflow-wrap-anywhere">{t(`emergency.types.${key}`)}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">{t("emergency.tipsTitle")}</h2>
              <div className="space-y-3">
                {EMERGENCY_TIPS.map((tip) => {
                  const TipIcon = tip.Icon
                  return (
                    <div key={tip.key} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <TipIcon size={20} className={`${tip.color} shrink-0 mt-0.5`} aria-hidden />
                      <div>
                        <p className="text-sm font-semibold text-gray-800 mb-0.5">{t(`emergency.tips.${tip.key}.title`)}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{t(`emergency.tips.${tip.key}.desc`)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Nearby Hospitals Column */}
          <div className="space-y-5 sm:space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Map size={20} className="text-blue-500 shrink-0" aria-hidden />
                {t("emergency.nearestHospitals")}
              </h2>

              {!userCoords && !showCommunePicker ? (
                <div className="text-center py-6">
                  <MapPin size={48} className="text-gray-300 mb-3 mx-auto" aria-hidden />
                  <p className="text-gray-600 mb-2 text-sm sm:text-base">{t("emergency.geoHint")}</p>
                  {locationError && <p className="text-red-500 text-sm mb-3">{locationError}</p>}
                  <button
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 min-h-[48px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  >
                    {isLocating ? t("emergency.noLocation") : t("emergency.locationLabel")}
                  </button>
                </div>
              ) : !userCoords && showCommunePicker ? (
                /* Commune picker fallback when geolocation is denied */
                <div className="space-y-4">
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    {t("emergency.geoDenied")}
                  </p>
                  <p className="text-sm text-gray-600">{t("emergency.communePickerHint")}</p>
                  <select
                    value={selectedCommuneId}
                    onChange={(e) => setSelectedCommuneId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]"
                    style={{ fontSize: "16px" }}
                  >
                    <option value="">{t("emergency.selectCommune")}</option>
                    {communes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {lang === "ar" ? c.nameAr : c.nameFr}
                      </option>
                    ))}
                  </select>
                  {selectedCommuneId && (
                    <>
                      {communeLoading ? (
                        <p className="text-gray-500 text-sm text-center">{t("common.loading")}</p>
                      ) : communeInstitutions.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center">{t("emergency.no24hHere")}</p>
                      ) : (
                        <div className="space-y-3">
                          {communeInstitutions.map((hospital) => (
                            <div key={hospital.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base overflow-wrap-anywhere">
                                    {lang === "ar" ? hospital.nameAr : hospital.nameFr}
                                  </h3>
                                  {(lang === "ar" ? hospital.addressAr : hospital.addressFr) && (
                                    <p className="text-sm text-gray-500 overflow-wrap-anywhere">
                                      {lang === "ar" ? hospital.addressAr : hospital.addressFr}
                                    </p>
                                  )}
                                </div>
                                {hospital.phone && (
                                  <a href={`tel:${hospital.phone}`}
                                    className="shrink-0 flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm min-h-[44px] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                                    dir="ltr">
                                    <PhoneCall size={14} aria-hidden />
                                    {hospital.phone}
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {/* Also offer to try geolocation again */}
                  <button
                    onClick={handleGetLocation}
                    className="w-full text-sm text-blue-600 hover:underline py-1"
                  >
                    {t("emergency.tryGeoAgain")}
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
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base overflow-wrap-anywhere">
                            {lang === "ar" ? hospital.nameAr : hospital.nameFr}
                          </h3>
                          {(lang === "ar" ? hospital.addressAr : hospital.addressFr) && (
                            <p className="text-sm text-gray-500 overflow-wrap-anywhere">
                              {lang === "ar" ? hospital.addressAr : hospital.addressFr}
                            </p>
                          )}
                          {hospital.distanceKm != null && (
                            <p className="text-xs text-blue-600 mt-1">{formatDistance(hospital.distanceKm)}</p>
                          )}
                        </div>
                        {hospital.phone && (
                          <a href={`tel:${hospital.phone}`}
                            className="shrink-0 flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm min-h-[44px] focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none"
                            dir="ltr">
                            <PhoneCall size={14} aria-hidden />
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
