// components/Sections/InstitutionDetails/NursesSection.jsx

import { useState } from "react"
import { useTranslation } from "react-i18next"
import Avatar from "../../common/Avatar"

const NursesSection = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("services")
  const [selectedService, setSelectedService] = useState(null)
  const [showBooking, setShowBooking] = useState(false)

  const nursingServiceKeys = ["homecare", "wounds", "injections", "vitals", "physio", "elderly"]
  const nursingServiceIcons = {
    homecare: "bx-home-heart", wounds: "bx-band-aid", injections: "bx-injection",
    vitals: "bx-pulse", physio: "bx-dumbbell", elderly: "bx-user-check",
  }
  const nursingServiceIncludes = {
    homecare: ["قياس العلامات الحيوية", "إعطاء الأدوية", "العناية بالجروح", "المتابعة الطبية"],
    wounds: ["تنظيف الجرح", "تطبيق المطهرات", "تغيير الضمادات", "متابعة الشفاء"],
    injections: ["حقن عضلية", "حقن وريدية", "حقن تحت الجلد", "متابعة الآثار الجانبية"],
    vitals: ["قياس الضغط", "قياس الحرارة", "قياس النبض", "قياس التنفس"],
    physio: ["تمارين حركية", "تدليك علاجي", "تقوية العضلات", "تحسين المرونة"],
    elderly: ["مساعدة في الأنشطة اليومية", "إعطاء الأدوية", "المراقبة الصحية", "الدعم النفسي"],
  }

  const nursingServices = nursingServiceKeys.map((key, idx) => ({
    id: idx + 1,
    key,
    name: t(`nurses.services.${key}.name`),
    description: t(`nurses.services.${key}.desc`),
    price: null,
    duration: t(`nurses.services.${key}.duration`),
    includes: nursingServiceIncludes[key],
    icon: nursingServiceIcons[key],
    available: true,
  }))

  // No mock data — nurses and appointments load from the real API (Phase 5)
  const nurses = []
  const appointments = []

  const tabKeys = ["services", "nurses", "appointments"]
  const tabIcons = { services: "bx-heart", nurses: "bx-user-plus", appointments: "bx-calendar" }

  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setShowBooking(true)
  }

  const renderServicesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nursingServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-s-4 border-pink-500"
          >
            <div className="p-6">
              <div className="text-center mb-4">
                <i className={`bx ${service.icon} text-4xl text-pink-500 mb-2`}></i>
                <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
              </div>

              <p className="text-gray-600 text-sm mb-4">{service.description}</p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("nurses.price")}</span>
                  <span className="font-semibold text-pink-600">
                    {service.price != null
                      ? new Intl.NumberFormat("ar-DZ").format(service.price) + " " + t("common.currency")
                      : t("nurses.priceUnknown")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("nurses.duration")}</span>
                  <span className="font-medium">{service.duration}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">{t("nurses.includes")}</p>
                <div className="space-y-1">
                  {service.includes.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="bx bx-check text-green-500"></i>
                      <span>{item}</span>
                    </div>
                  ))}
                  {service.includes.length > 2 && (
                    <span className="text-xs text-gray-500">
                      {t("nurses.more", { count: service.includes.length - 2 })}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleServiceSelect(service)}
                className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                {t("nurses.requestService")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderNursesTab = () => (
    <div className="space-y-6">
      {nurses.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <i className="bx bx-user-plus text-6xl mb-4 text-gray-300"></i>
          <p className="text-lg">{t("nurses.noNurses")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nurses.map((nurse) => (
            <div key={nurse.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="text-center mb-4">
                  <Avatar name={nurse.name} size="xl" className="mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-800">{nurse.name}</h3>
                  <p className="text-gray-600 text-sm">{nurse.specialty}</p>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("nurses.experience")}</span>
                    <span className="font-medium">{nurse.experience}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">{t("nurses.certifications")}</p>
                  <div className="flex flex-wrap gap-1">
                    {nurse.certifications.slice(0, 2).map((cert, index) => (
                      <span key={index} className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors text-sm">
                    {t("nurses.requestServiceBtn")}
                  </button>
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    {t("nurses.profileBtn")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderAppointmentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{t("nurses.appointmentsTitle")}</h3>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="bx bx-calendar text-4xl mb-2 text-gray-300"></i>
            <p>{t("nurses.noAppointments")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{appointment.patientName}</h4>
                    <p className="text-sm text-gray-600">{appointment.service}</p>
                  </div>
                  <div className="text-end">
                    <p className="text-xs text-gray-500">{appointment.date} - {appointment.time}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    {t("nurses.detailsBtn")}
                  </button>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                    {t("nurses.cancelBtn")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Nurses Section Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <i className="bx bx-heart text-4xl text-pink-600"></i>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t("nurses.title")}</h1>
            <p className="text-gray-600">{t("nurses.subtitle")}</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b mt-6">
          {tabKeys.map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tabKey
                  ? "border-pink-500 text-pink-600 bg-pink-50"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <i className={`bx ${tabIcons[tabKey]}`}></i>
              <span>{t(`nurses.tabs.${tabKey}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "services" && renderServicesTab()}
      {activeTab === "nurses" && renderNursesTab()}
      {activeTab === "appointments" && renderAppointmentsTab()}

      {/* Booking Modal */}
      {showBooking && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">{t("nurses.requestModal")} - {selectedService.name}</h3>
              <button onClick={() => setShowBooking(false)} className="text-gray-500 hover:text-gray-700">
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-pink-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-semibold">{t("nurses.serviceLabel")}</span>
                  <span>{selectedService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t("nurses.priceLabel")}</span>
                  <span className="text-pink-600 font-bold">
                    {selectedService.price != null
                      ? new Intl.NumberFormat("ar-DZ").format(selectedService.price) + " " + t("common.currency")
                      : t("nurses.priceUnknown")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t("nurses.durationLabel")}</span>
                  <span>{selectedService.duration}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">{t("nurses.serviceIncludes")}</p>
                <div className="space-y-1">
                  {selectedService.includes.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="bx bx-check text-green-500"></i>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("nurses.fullName")}</label>
                <input type="text" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder={t("nurses.fullNamePlaceholder")} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("nurses.phone")}</label>
                <input type="tel" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder={t("nurses.phonePlaceholder")} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("nurses.addressLabel")}</label>
                <textarea rows={2} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder={t("nurses.addressPlaceholder")} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("nurses.preferredDatetime")}</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    min={new Date().toISOString().split("T")[0]} />
                  <input type="time" className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("nurses.notes")}</label>
                <textarea rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder={t("nurses.notesPlaceholder")} />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowBooking(false) }}
                  className="flex-1 bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  {t("nurses.confirm")}
                </button>
                <button
                  onClick={() => setShowBooking(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("nurses.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NursesSection
