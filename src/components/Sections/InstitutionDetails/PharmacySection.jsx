// components/Sections/InstitutionDetails/PharmacySection.jsx

import { useTranslation } from "react-i18next"

const PharmacySection = () => {
  const { t } = useTranslation()

  // Medications, prescriptions and stats come from the real API (Phase 5).
  // Until then, show an honest empty state.

  const pharmacyServiceKeys = ["consult", "delivery", "renew"]
  const pharmacyServiceIcons = { consult: "bx-receipt", delivery: "bx-home", renew: "bx-refresh" }
  const pharmacyServiceColors = { consult: "text-red-500", delivery: "text-blue-500", renew: "text-green-500" }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <i className="bx bx-plus-medical text-4xl text-red-600"></i>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t("pharmacy.title")}</h1>
            <p className="text-gray-600">{t("pharmacy.subtitle")}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">{t("pharmacy.hint")}</p>
      </div>

      {/* Empty state for medications */}
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <i className="bx bx-capsule text-5xl text-gray-300 mb-4"></i>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("pharmacy.noMeds")}</h3>
        <p className="text-gray-500 text-sm">{t("pharmacy.noMedsHint")}</p>
      </div>

      {/* Empty state for prescriptions */}
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <i className="bx bx-receipt text-5xl text-gray-300 mb-4"></i>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{t("pharmacy.noPrescrip")}</h3>
        <p className="text-gray-500 text-sm">{t("pharmacy.noPrescripHint")}</p>
      </div>

      {/* Services */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">{t("pharmacy.servicesTitle")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pharmacyServiceKeys.map((key) => (
            <div key={key} className="bg-white p-6 rounded-lg shadow text-center">
              <i className={`bx ${pharmacyServiceIcons[key]} text-4xl ${pharmacyServiceColors[key]} mb-3`}></i>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{t(`pharmacy.services.${key}.title`)}</h3>
              <p className="text-gray-600 text-sm">{t(`pharmacy.services.${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PharmacySection
