// components/Sections/InstitutionDetails/AdminPanel.jsx

import { useState } from "react"

// Static color map for admin tab active states — avoids purged dynamic Tailwind classes
const ADMIN_ACTIVE_STYLES = {
  blue: "border-blue-500 text-blue-600 bg-blue-50",
  gray: "border-gray-500 text-gray-600 bg-gray-50",
  green: "border-green-500 text-green-600 bg-green-50",
  purple: "border-purple-500 text-purple-600 bg-purple-50",
}

const ADMIN_SECTIONS = [
  { id: "overview", name: "نظرة عامة على المواعيد", icon: "bx-calendar", color: "blue" },
  { id: "general", name: "الإدارة العامة", icon: "bx-cog", color: "gray" },
]

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("overview")

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">إحصائيات المواعيد</h3>
              <p className="text-gray-500 text-center py-8">
                <i className="bx bx-bar-chart text-4xl mb-2 text-gray-300"></i>
                <br />
                إحصائيات المواعيد ستظهر هنا من قاعدة البيانات الحقيقية.
              </p>
            </div>
          </div>
        )

      case "general":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">إدارة المواعيد</h3>
              <p className="text-gray-500 text-center py-8">
                <i className="bx bx-calendar text-4xl mb-2 text-gray-300"></i>
                <br />
                قائمة المواعيد ستظهر هنا.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">التقارير</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <i className="bx bx-file text-2xl text-blue-500 mb-2"></i>
                  <div className="font-semibold">تقرير يومي</div>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <i className="bx bx-calendar text-2xl text-green-500 mb-2"></i>
                  <div className="font-semibold">تقرير شهري</div>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <i className="bx bx-bar-chart text-2xl text-purple-500 mb-2"></i>
                  <div className="font-semibold">تقرير سنوي</div>
                </button>
              </div>
            </div>

            {/* Accounting and HR: out of scope for current phase */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800">
              <i className="bx bx-info-circle me-2"></i>
              وحدات المحاسبة والموارد البشرية قيد التطوير وستُتاح في مرحلة لاحقة.
            </div>
          </div>
        )

      default:
        return <div>اختر قسماً من الأعلى</div>
    }
  }

  return (
    <div className="space-y-6">
      {/* Admin Section Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <i className="bx bx-cog text-4xl text-gray-600"></i>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">لوحة الإدارة</h1>
            <p className="text-gray-600">إدارة المواعيد وخدمات المؤسسة</p>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex border-b">
          {ADMIN_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === section.id
                  ? ADMIN_ACTIVE_STYLES[section.color]
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <i className={`bx ${section.icon}`}></i>
              <span>{section.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  )
}

export default AdminPanel
