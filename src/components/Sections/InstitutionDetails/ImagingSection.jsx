// components/Sections/InstitutionDetails/ImagingSection.jsx

import { useState } from "react"
import { useTranslation } from "react-i18next"

const ImagingSection = () => {
  const { t } = useTranslation()
  const [selectedService, setSelectedService] = useState(null)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingData, setBookingData] = useState({
    service: "",
    date: "",
    time: "",
    patientInfo: { name: "", phone: "", nationalId: "" },
    notes: "",
  })

  const imagingServiceKeys = ["xray", "ct", "mri", "ultrasound", "mammography", "nuclear"]
  const imagingServiceIcons = {
    xray: "bx-x-ray", ct: "bx-scan", mri: "bx-brain",
    ultrasound: "bx-pulse", mammography: "bx-health", nuclear: "bx-atom",
  }
  const imagingServices = imagingServiceKeys.map((key) => ({
    id: key,
    name: t(`imaging.services.${key}.name`),
    description: t(`imaging.services.${key}.desc`),
    price: null,
    duration: t(`imaging.services.${key}.duration`),
    preparation: t(`imaging.services.${key}.prep`),
    icon: imagingServiceIcons[key],
    available: key !== "nuclear",
  }))

  // Phase 5: available slots come from the real API
  const availableSlots = []

  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setBookingData({ ...bookingData, service: service.id })
  }

  const handleBooking = () => {
    setShowBooking(true)
  }

  const handleConfirmBooking = () => {
    // Phase 5: send to real API
    setShowBooking(false)
    setSelectedService(null)
  }

  const equipmentItems = ["modern", "safety", "staff", "fast", "digital", "consult"]
  const equipmentIcons = {
    modern: { icon: "bx-check-circle", color: "text-green-500" },
    safety: { icon: "bx-shield-check", color: "text-blue-500" },
    staff: { icon: "bx-user-check", color: "text-purple-500" },
    fast: { icon: "bx-time-five", color: "text-orange-500" },
    digital: { icon: "bx-cloud", color: "text-indigo-500" },
    consult: { icon: "bx-phone", color: "text-green-500" },
  }

  return (
    <div className="space-y-6">
      {/* Imaging Section Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <i className="bx bx-camera text-4xl text-purple-600"></i>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t("imaging.title")}</h1>
            <p className="text-gray-600">{t("imaging.subtitle")}</p>
          </div>
        </div>
        {/* Section summary — real numbers from API in Phase 5 */}
      </div>

      {/* Imaging Services */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{t("imaging.servicesTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imagingServices.map((service) => (
            <div
              key={service.id}
              className={`border-2 rounded-lg p-6 transition-all cursor-pointer ${
                service.available
                  ? selectedService?.id === service.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300 hover:shadow-md"
                  : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
              }`}
              onClick={() => service.available && handleServiceSelect(service)}
            >
              <div className="text-center mb-4">
                <i className={`bx ${service.icon} text-4xl text-purple-500 mb-2`}></i>
                <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-600">{service.description}</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("imaging.price")}</span>
                  <span className="font-semibold text-purple-600">
                    {service.price != null
                      ? new Intl.NumberFormat("ar-DZ").format(service.price) + " " + t("common.currency")
                      : t("imaging.priceUnknown")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("imaging.duration")}</span>
                  <span className="font-medium">{service.duration}</span>
                </div>
                <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
                  <strong>{t("imaging.preparation")}</strong> {service.preparation}
                </div>
              </div>

              {service.available ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleServiceSelect(service)
                    handleBooking()
                  }}
                  className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {t("imaging.bookBtn")}
                </button>
              ) : (
                <div className="w-full mt-4 bg-gray-400 text-white py-2 rounded-lg text-center">
                  {t("imaging.unavailable")}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Information */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">{t("imaging.equipmentTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {equipmentItems.slice(0, 3).map((key) => (
              <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <i className={`bx ${equipmentIcons[key].icon} ${equipmentIcons[key].color} text-xl`}></i>
                <div>
                  <div className="font-semibold">{t(`imaging.equipment.${key}.title`)}</div>
                  <div className="text-sm text-gray-600">{t(`imaging.equipment.${key}.desc`)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            {equipmentItems.slice(3).map((key) => (
              <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <i className={`bx ${equipmentIcons[key].icon} ${equipmentIcons[key].color} text-xl`}></i>
                <div>
                  <div className="font-semibold">{t(`imaging.equipment.${key}.title`)}</div>
                  <div className="text-sm text-gray-600">{t(`imaging.equipment.${key}.desc`)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">{t("imaging.modalTitle")} - {selectedService.name}</h3>
              <button onClick={() => setShowBooking(false)} className="text-gray-500 hover:text-gray-700">
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{t("imaging.service")}</span>
                  <span>{selectedService.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{t("imaging.price")}</span>
                  <span className="text-purple-600 font-bold">
                    {selectedService.price != null
                      ? new Intl.NumberFormat("ar-DZ").format(selectedService.price) + " " + t("common.currency")
                      : t("imaging.priceUnknown")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{t("imaging.duration")}</span>
                  <span>{selectedService.duration}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("imaging.fullName")}</label>
                <input
                  type="text"
                  value={bookingData.patientInfo.name}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      patientInfo: { ...bookingData.patientInfo, name: e.target.value },
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder={t("imaging.fullNamePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("imaging.phone")}</label>
                <input
                  type="tel"
                  value={bookingData.patientInfo.phone}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      patientInfo: { ...bookingData.patientInfo, phone: e.target.value },
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder={t("imaging.phonePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("imaging.preferredDate")}</label>
                <select
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">{t("imaging.chooseDate")}</option>
                  {availableSlots
                    .filter((slot) => slot.available)
                    .map((slot, index) => (
                      <option key={index} value={`${slot.date}-${slot.time}`}>
                        {new Date(slot.date).toLocaleDateString("ar-DZ")} - {slot.time}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("imaging.notes")}</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder={t("imaging.notesPlaceholder")}
                />
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                <strong>{t("imaging.prepInstructions")}</strong> {selectedService.preparation}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {t("imaging.confirm")}
                </button>
                <button
                  onClick={() => setShowBooking(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("imaging.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImagingSection
