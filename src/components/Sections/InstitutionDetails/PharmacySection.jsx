// components/Sections/InstitutionDetails/PharmacySection.jsx

import { useTranslation } from "react-i18next"
import { Cross, Pill, Receipt, RefreshCw, Home } from "lucide-react"

const serviceIconMap = {
  consult: { Icon: Receipt, color: "text-red-500" },
  delivery: { Icon: Home, color: "text-blue-500" },
  renew: { Icon: RefreshCw, color: "text-green-500" },
}

const PharmacySection = () => {
  const { t } = useTranslation()

  // Medications, prescriptions and stats come from the real API (Phase 5).
  // Until then, show an honest empty state.

  const pharmacyServiceKeys = ["consult", "delivery", "renew"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <Cross className="w-10 h-10 text-red-600 shrink-0" aria-hidden="true" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t("pharmacy.title")}</h1>
            <p className="text-gray-600">{t("pharmacy.subtitle")}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">{t("pharmacy.hint")}</p>
      </div>

      {/* Empty state for medications */}
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <Pill className="w-16 h-16 mx-auto mb-4 text-gray-300" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("pharmacy.noMeds")}</h3>
        <p className="text-gray-500 text-sm">{t("pharmacy.noMedsHint")}</p>
      </div>

      {/* Empty state for prescriptions */}
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("pharmacy.noPrescrip")}</h3>
        <p className="text-gray-500 text-sm">{t("pharmacy.noPrescripHint")}</p>
      </div>

      {/* Services */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t("pharmacy.servicesTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pharmacyServiceKeys.map((key) => {
            const { Icon, color } = serviceIconMap[key]
            return (
              <div key={key} className="bg-white p-6 rounded-lg shadow text-center">
                <Icon className={`w-10 h-10 mx-auto mb-3 ${color}`} aria-hidden="true" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{t(`pharmacy.services.${key}.title`)}</h3>
                <p className="text-gray-600 text-sm">{t(`pharmacy.services.${key}.desc`)}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default PharmacySection
