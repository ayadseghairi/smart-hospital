// components/Sections/InstitutionDetails/LabSection.jsx

import { useState } from "react"
import { useTranslation } from "react-i18next"

const LabSection = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("tests")
  const [selectedTest, setSelectedTest] = useState(null)
  const [showBooking, setShowBooking] = useState(false)

  const labTestKeys = ["blood", "kidney", "liver", "diabetes", "lipids", "hormones"]
  const labTests = labTestKeys.map((key, idx) => ({
    id: idx + 1,
    key,
    name: t(`lab.tests.${key}.name`),
    description: t(`lab.tests.${key}.desc`),
    price: null,
    duration: t(`lab.tests.${key}.duration`),
    preparation: t(`lab.tests.${key}.prep`),
    includes: {
      blood: ["كريات الدم الحمراء", "كريات الدم البيضاء", "الصفائح الدموية", "الهيموجلوبين"],
      kidney: ["الكرياتينين", "اليوريا", "حمض اليوريك"],
      liver: ["ALT", "AST", "البيليروبين", "الألبومين"],
      diabetes: ["HbA1c"],
      lipids: ["الكوليسترول الكلي", "HDL", "LDL", "الدهون الثلاثية"],
      hormones: ["TSH", "T3", "T4"],
    }[key],
  }))

  const categoryKeys = ["all", "blood", "kidney", "liver", "diabetes", "lipids", "hormones"]
  const categoryIcons = {
    all: "bx-test-tube", blood: "bx-droplet", kidney: "bx-shape-circle",
    liver: "bx-shape-square", diabetes: "bx-injection", lipids: "bx-heart", hormones: "bx-dna",
  }

  // No mock data — test results come from the real API (Phase 5)
  const testResults = []

  const tabKeys = ["tests", "results", "services"]
  const tabIcons = { tests: "bx-test-tube", results: "bx-file", services: "bx-cog" }

  const handleTestSelect = (test) => {
    setSelectedTest(test)
    setShowBooking(true)
  }

  const labServices = [
    { key: "homeVisit", icon: "bx-home", color: "text-blue-500", btnColor: "bg-blue-600 hover:bg-blue-700" },
    { key: "fastResults", icon: "bx-time", color: "text-green-500", btnColor: "bg-green-600 hover:bg-green-700" },
    { key: "consult", icon: "bx-phone", color: "text-purple-500", btnColor: "bg-purple-600 hover:bg-purple-700" },
  ]

  const renderTestsTab = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          {categoryKeys.map((catKey) => (
            <button
              key={catKey}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700 transition-colors"
            >
              <i className={`bx ${categoryIcons[catKey]}`}></i>
              <span className="text-sm">{t(`lab.categories.${catKey}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {labTests.map((test) => (
          <div key={test.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{test.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{test.description}</p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("lab.price")}</span>
                  <span className="font-semibold text-yellow-600">
                    {test.price != null
                      ? new Intl.NumberFormat("ar-DZ").format(test.price) + " " + t("common.currency")
                      : t("lab.priceUnknown")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("lab.resultDuration")}</span>
                  <span className="font-medium">{test.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t("lab.preparation")}</span>
                  <span className="font-medium text-orange-600">{test.preparation}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">{t("lab.includes")}</p>
                <div className="space-y-1">
                  {test.includes.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <i className="bx bx-check text-green-500"></i>
                      <span>{item}</span>
                    </div>
                  ))}
                  {test.includes.length > 2 && (
                    <span className="text-xs text-gray-500">
                      {t("lab.more", { count: test.includes.length - 2 })}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleTestSelect(test)}
                className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                {t("lab.bookBtn")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderResultsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{t("lab.resultsTitle")}</h3>
        {testResults.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <i className="bx bx-file text-4xl mb-2 text-gray-300"></i>
            <p>{t("lab.noResults")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {testResults.map((result) => (
              <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800">{result.testName}</h4>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderServicesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {labServices.map((svc) => (
          <div key={svc.key} className="bg-white p-6 rounded-lg shadow text-center">
            <i className={`bx ${svc.icon} text-4xl ${svc.color} mb-3`}></i>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{t(`lab.services.${svc.key}.title`)}</h3>
            <p className="text-gray-600 text-sm mb-4">{t(`lab.services.${svc.key}.desc`)}</p>
            <button className={`w-full ${svc.btnColor} text-white py-2 rounded-lg transition-colors`}>
              {t(`lab.services.${svc.key}.btn`)}
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Lab Section Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <i className="bx bx-test-tube text-4xl text-yellow-600"></i>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t("lab.title")}</h1>
            <p className="text-gray-600">{t("lab.subtitle")}</p>
          </div>
        </div>

        {/* Section summary — real numbers from API in Phase 5 */}

        {/* Tabs Navigation */}
        <div className="flex border-b mt-6">
          {tabKeys.map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tabKey
                  ? "border-yellow-500 text-yellow-600 bg-yellow-50"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <i className={`bx ${tabIcons[tabKey]}`}></i>
              <span>{t(`lab.tabs.${tabKey}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "tests" && renderTestsTab()}
      {activeTab === "results" && renderResultsTab()}
      {activeTab === "services" && renderServicesTab()}

      {/* Booking Modal */}
      {showBooking && selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">{t("lab.modalTitle")} - {selectedTest.name}</h3>
              <button onClick={() => setShowBooking(false)} className="text-gray-500 hover:text-gray-700">
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-semibold">{t("lab.test")}</span>
                  <span>{selectedTest.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t("lab.price")}</span>
                  <span className="text-yellow-600 font-bold">
                    {selectedTest.price != null
                      ? new Intl.NumberFormat("ar-DZ").format(selectedTest.price) + " " + t("common.currency")
                      : t("lab.priceUnknown")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">{t("lab.resultDuration")}</span>
                  <span>{selectedTest.duration}</span>
                </div>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg text-sm">
                <strong>{t("lab.prepInstructions")}</strong> {selectedTest.preparation}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("lab.fullName")}</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder={t("lab.fullNamePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("lab.phone")}</label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder={t("lab.phonePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("lab.preferredDate")}</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowBooking(false) }}
                  className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  {t("lab.confirm")}
                </button>
                <button
                  onClick={() => setShowBooking(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("lab.cancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LabSection
