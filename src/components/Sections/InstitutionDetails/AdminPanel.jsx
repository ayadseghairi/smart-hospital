"use client"

// components/Sections/InstitutionDetails/AdminPanel.jsx

import { useState } from "react"

const AdminPanel = ({ institution }) => {
  const [activeTab, setActiveTab] = useState("marketing")

  const adminSections = [
    { id: "marketing", name: "التسويق الصحي", icon: "bx-trending-up", color: "blue" },
    { id: "general", name: "الإدارة العامة", icon: "bx-cog", color: "gray" },
    { id: "accounting", name: "المحاسبة والمالية", icon: "bx-calculator", color: "green" },
    { id: "hr", name: "الموارد البشرية", icon: "bx-group", color: "purple" },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "marketing":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <i className="bx bx-line-chart text-3xl text-blue-500 mb-3"></i>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">إحصائيات المرضى</h3>
                <p className="text-gray-600 mb-4">تتبع أعداد المرضى والزيارات</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>زيارات اليوم:</span>
                    <span className="font-semibold">245</span>
                  </div>
                  <div className="flex justify-between">
                    <span>هذا الشهر:</span>
                    <span className="font-semibold">7,892</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <i className="bx bx-bullhorn text-3xl text-green-500 mb-3"></i>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">الحملات التسويقية</h3>
                <p className="text-gray-600 mb-4">إدارة الحملات الإعلانية</p>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                  إنشاء حملة جديدة
                </button>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <i className="bx bx-star text-3xl text-purple-500 mb-3"></i>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">تقييمات المرضى</h3>
                <p className="text-gray-600 mb-4">متابعة رضا المرضى</p>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="text-2xl font-bold text-purple-600">4.8</span>
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <i key={i} className="bx bxs-star"></i>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">التقارير التسويقية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">مصادر المرضى</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>إحالات طبية:</span>
                      <span>45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>مواقع التواصل:</span>
                      <span>30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>البحث الإلكتروني:</span>
                      <span>25%</span>
                    </div>
                  </div>
                </div>
                <div className="border border-gray-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">أداء الخدمات</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>العيادات الخارجية:</span>
                      <span className="text-green-600">↑ 12%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الطوارئ:</span>
                      <span className="text-blue-600">↑ 8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>العمليات:</span>
                      <span className="text-purple-600">↑ 15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "general":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">إدارة المرافق</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>غرف العمليات</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">8/10 متاحة</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>أسرة العناية المركزة</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">15/20 متاحة</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span>العيادات الخارجية</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">25/30 متاحة</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">إدارة المواعيد</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>مواعيد اليوم:</span>
                    <span className="font-semibold">156</span>
                  </div>
                  <div className="flex justify-between">
                    <span>قائمة الانتظار:</span>
                    <span className="font-semibold">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الإلغاءات:</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors mt-4">
                    إدارة المواعيد
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">التقارير الإدارية</h3>
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
          </div>
        )

      case "accounting":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 p-6 rounded-lg">
                <i className="bx bx-dollar text-3xl text-green-500 mb-3"></i>
                <h3 className="text-lg font-semibold text-gray-800">الإيرادات</h3>
                <p className="text-2xl font-bold text-green-600">2,450,000 ريال</p>
                <p className="text-sm text-gray-600">هذا الشهر</p>
              </div>
              <div className="bg-red-50 p-6 rounded-lg">
                <i className="bx bx-credit-card text-3xl text-red-500 mb-3"></i>
                <h3 className="text-lg font-semibold text-gray-800">المصروفات</h3>
                <p className="text-2xl font-bold text-red-600">1,890,000 ريال</p>
                <p className="text-sm text-gray-600">هذا الشهر</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg">
                <i className="bx bx-trending-up text-3xl text-blue-500 mb-3"></i>
                <h3 className="text-lg font-semibold text-gray-800">صافي الربح</h3>
                <p className="text-2xl font-bold text-blue-600">560,000 ريال</p>
                <p className="text-sm text-gray-600">هذا الشهر</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">إدارة الفواتير</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">فواتير معلقة</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-yellow-50 rounded">
                      <span>فاتورة #1234</span>
                      <span>15,000 ريال</span>
                    </div>
                    <div className="flex justify-between p-2 bg-yellow-50 rounded">
                      <span>فاتورة #1235</span>
                      <span>8,500 ريال</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">فواتير مدفوعة</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-green-50 rounded">
                      <span>فاتورة #1232</span>
                      <span>25,000 ريال</span>
                    </div>
                    <div className="flex justify-between p-2 bg-green-50 rounded">
                      <span>فاتورة #1233</span>
                      <span>12,000 ريال</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "hr":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <i className="bx bx-user text-3xl text-blue-500 mb-2"></i>
                <h3 className="text-lg font-semibold text-gray-800">إجمالي الموظفين</h3>
                <p className="text-2xl font-bold text-blue-600">342</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <i className="bx bx-user-plus text-3xl text-green-500 mb-2"></i>
                <h3 className="text-lg font-semibold text-gray-800">موظفين جدد</h3>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg text-center">
                <i className="bx bx-time text-3xl text-yellow-500 mb-2"></i>
                <h3 className="text-lg font-semibold text-gray-800">في إجازة</h3>
                <p className="text-2xl font-bold text-yellow-600">28</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <i className="bx bx-briefcase text-3xl text-purple-500 mb-2"></i>
                <h3 className="text-lg font-semibold text-gray-800">وظائف شاغرة</h3>
                <p className="text-2xl font-bold text-purple-600">8</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">إدارة الحضور</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>حاضر اليوم:</span>
                    <span className="font-semibold text-green-600">298</span>
                  </div>
                  <div className="flex justify-between">
                    <span>متأخر:</span>
                    <span className="font-semibold text-yellow-600">16</span>
                  </div>
                  <div className="flex justify-between">
                    <span>غائب:</span>
                    <span className="font-semibold text-red-600">28</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">طلبات الإجازات</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>طلبات معلقة:</span>
                    <span className="font-semibold text-yellow-600">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>طلبات موافق عليها:</span>
                    <span className="font-semibold text-green-600">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span>طلبات مرفوضة:</span>
                    <span className="font-semibold text-red-600">2</span>
                  </div>
                </div>
              </div>
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
        <div className="flex items-center space-x-4 space-x-reverse mb-6">
          <i className="bx bx-cog text-4xl text-gray-600"></i>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">لوحة الإدارة العامة</h1>
            <p className="text-gray-600">إدارة شاملة لجميع أقسام المستشفى</p>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex space-x-0 space-x-reverse border-b">
          {adminSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveTab(section.id)}
              className={`flex items-center space-x-2 space-x-reverse px-6 py-3 border-b-2 transition-colors ${
                activeTab === section.id
                  ? `border-${section.color}-500 text-${section.color}-600 bg-${section.color}-50`
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
