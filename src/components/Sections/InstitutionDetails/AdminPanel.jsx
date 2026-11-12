// components/Sections/InstitutionDetails/AdminPanel.jsx

import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Settings, Calendar, BarChart2, FileText, Info } from "lucide-react"

// Static color map for admin tab active states — avoids purged dynamic Tailwind classes
const ADMIN_ACTIVE_STYLES = {
  blue: "border-blue-500 text-blue-600 bg-blue-50",
  gray: "border-gray-500 text-gray-600 bg-gray-50",
  green: "border-green-500 text-green-600 bg-green-50",
  purple: "border-purple-500 text-purple-600 bg-purple-50",
}

const ADMIN_SECTION_KEYS = [
  { id: "overview", color: "blue", Icon: Calendar },
  { id: "general",  color: "gray", Icon: Settings },
]

const AdminPanel = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("overview")

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{t("admin.appointmentsStats")}</h3>
              <div className="text-gray-500 text-center py-8">
                <BarChart2 size={40} className="mb-2 text-gray-300 mx-auto" aria-hidden />
                <p>{t("admin.statsPlaceholder")}</p>
              </div>
            </div>
          </div>
        )

      case "general":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{t("admin.appointmentsManage")}</h3>
              <div className="text-gray-500 text-center py-8">
                <Calendar size={40} className="mb-2 text-gray-300 mx-auto" aria-hidden />
                <p>{t("admin.appointmentsPlaceholder")}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{t("admin.reports")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center min-h-[80px] flex flex-col items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
                  <FileText size={24} className="text-blue-500 mb-2" aria-hidden />
                  <div className="font-semibold text-sm">{t("admin.dailyReport")}</div>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center min-h-[80px] flex flex-col items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
                  <Calendar size={24} className="text-green-500 mb-2" aria-hidden />
                  <div className="font-semibold text-sm">{t("admin.monthlyReport")}</div>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center min-h-[80px] flex flex-col items-center justify-center focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none">
                  <BarChart2 size={24} className="text-purple-500 mb-2" aria-hidden />
                  <div className="font-semibold text-sm">{t("admin.annualReport")}</div>
                </button>
              </div>
            </div>

            {/* Accounting and HR: out of scope for current phase */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800 flex items-start gap-2">
              <Info size={16} className="shrink-0 mt-0.5" aria-hidden />
              {t("admin.comingSoon")}
            </div>
          </div>
        )

      default:
        return <div>{t("admin.defaultSection")}</div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Admin Section Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <Settings size={40} className="text-gray-600 shrink-0" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t("admin.title")}</h1>
            <p className="text-gray-600">{t("admin.subtitle")}</p>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b" role="tablist">
          {ADMIN_SECTION_KEYS.map((section) => {
            const SectionIcon = section.Icon
            return (
              <button
                key={section.id}
                role="tab"
                aria-selected={activeTab === section.id}
                onClick={() => setActiveTab(section.id)}
                className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors text-sm min-h-[48px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none ${
                  activeTab === section.id
                    ? ADMIN_ACTIVE_STYLES[section.color]
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <SectionIcon size={16} aria-hidden />
                <span>{t(`admin.tabs.${section.id}`)}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  )
}

export default AdminPanel
