"use client"

// components/Sections/InstitutionDetails/LabSection.jsx

import { useState } from "react"

const LabSection = ({ institution }) => {
  const [activeTab, setActiveTab] = useState("tests")
  const [selectedTest, setSelectedTest] = useState(null)
  const [showBooking, setShowBooking] = useState(false)

  const labTests = [
    {
      id: 1,
      name: "تحليل الدم الشامل",
      category: "blood",
      price: "80 ريال",
      duration: "2-4 ساعات",
      preparation: "صيام 8-12 ساعة",
      description: "فحص شامل لمكونات الدم",
      includes: ["كريات الدم الحمراء", "كريات الدم البيضاء", "الصفائح الدموية", "الهيموجلوبين"],
    },
    {
      id: 2,
      name: "وظائف الكلى",
      category: "kidney",
      price: "120 ريال",
      duration: "4-6 ساعات",
      preparation: "صيام 8 ساعات",
      description: "فحص وظائف الكلى",
      includes: ["الكرياتينين", "اليوريا", "حمض اليوريك"],
    },
    {
      id: 3,
      name: "وظائف الكبد",
      category: "liver",
      price: "150 ريال",
      duration: "4-6 ساعات",
      preparation: "صيام 10-12 ساعة",
      description: "فحص وظائف الكبد",
      includes: ["ALT", "AST", "البيليروبين", "الألبومين"],
    },
    {
      id: 4,
      name: "السكر التراكمي",
      category: "diabetes",
      price: "90 ريال",
      duration: "2-3 ساعات",
      preparation: "لا يتطلب صيام",
      description: "قياس متوسط السكر خلال 3 أشهر",
      includes: ["HbA1c"],
    },
    {
      id: 5,
      name: "الدهون الثلاثية والكوليسترول",
      category: "lipids",
      price: "100 ريال",
      duration: "3-4 ساعات",
      preparation: "صيام 12 ساعة",
      description: "فحص مستوى الدهون في الدم",
      includes: ["الكوليسترول الكلي", "HDL", "LDL", "الدهون الثلاثية"],
    },
    {
      id: 6,
      name: "هرمونات الغدة الدرقية",
      category: "hormones",
      price: "200 ريال",
      duration: "6-8 ساعات",
      preparation: "لا يتطلب صيام",
      description: "فحص وظائف الغدة الدرقية",
      includes: ["TSH", "T3", "T4"],
    },
  ]

  const testResults = [
    {
      id: 1,
      patientName: "أحمد محمد",
      testName: "تحليل الدم الشامل",
      date: "2024-01-15",
      status: "جاهز",
      doctorName: "د. سارة أحمد",
    },
    {
      id: 2,
      patientName: "فاطمة علي",
      testName: "وظائف الكبد",
      date: "2024-01-14",
      status: "قيد المعالجة",
      doctorName: "د. محمد الأحمد",
    },
    {
      id: 3,
      patientName: "خالد سعد",
      testName: "السكر التراكمي",
      date: "2024-01-13",
      status: "جاهز",
      doctorName: "د. نورا حسن",
    },
  ]

  const categories = [
    { id: "all", name: "جميع التحاليل", icon: "bx-test-tube" },
    { id: "blood", name: "تحاليل الدم", icon: "bx-droplet" },
    { id: "kidney", name: "وظائف الكلى", icon: "bx-shape-circle" },
    { id: "liver", name: "وظائف الكبد", icon: "bx-shape-square" },
    { id: "diabetes", name: "السكري", icon: "bx-injection" },
    { id: "lipids", name: "الدهون", icon: "bx-heart" },
    { id: "hormones", name: "الهرمونات", icon: "bx-dna" },
  ]

  const handleTestSelect = (test) => {
    setSelectedTest(test)
    setShowBooking(true)
  }

  const renderTestsTab = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              className="flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700 transition-colors"
            >
              <i className={`bx ${category.icon}`}></i>
              <span className="text-sm">{category.name}</span>
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
                  <span className="text-gray-500">السعر:</span>
                  <span className="font-semibold text-yellow-600">{test.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">مدة النتيجة:</span>
                  <span className="font-medium">{test.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">التحضير:</span>
                  <span className="font-medium text-orange-600">{test.preparation}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">يشمل:</p>
                <div className="space-y-1">
                  {test.includes.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                      <i className="bx bx-check text-green-500"></i>
                      <span>{item}</span>
                    </div>
                  ))}
                  {test.includes.length > 2 && (
                    <span className="text-xs text-gray-500">+{test.includes.length - 2} المزيد</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleTestSelect(test)}
                className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                حجز التحليل
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
        <h3 className="text-xl font-semibold text-gray-800 mb-4">نتائج التحاليل</h3>
        <div className="space-y-4">
          {testResults.map((result) => (
            <div key={result.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">{result.patientName}</h4>
                  <p className="text-sm text-gray-600">{result.testName}</p>
                  <p className="text-xs text-gray-500">طلب من {result.doctorName}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.status === "جاهز" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {result.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{result.date}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse">
                {result.status === "جاهز" && (
                  <>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      عرض النتيجة
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                      تحميل PDF
                    </button>
                  </>
                )}
                {result.status === "قيد المعالجة" && (
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                    تتبع الحالة
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderServicesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <i className="bx bx-home text-4xl text-blue-500 mb-3"></i>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">سحب عينات منزلي</h3>
          <p className="text-gray-600 text-sm mb-4">سحب العينات من المنزل</p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            طلب زيارة منزلية
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow text-center">
          <i className="bx bx-time text-4xl text-green-500 mb-3"></i>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">نتائج سريعة</h3>
          <p className="text-gray-600 text-sm mb-4">نتائج خلال ساعات</p>
          <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
            طلب خدمة سريعة
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow text-center">
          <i className="bx bx-phone text-4xl text-purple-500 mb-3"></i>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">استشارة النتائج</h3>
          <p className="text-gray-600 text-sm mb-4">شرح النتائج مع المختص</p>
          <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
            طلب استشارة
          </button>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: "tests", name: "التحاليل", icon: "bx-test-tube" },
    { id: "results", name: "النتائج", icon: "bx-file" },
    { id: "services", name: "الخدمات", icon: "bx-cog" },
  ]

  return (
    <div className="space-y-6">
      {/* Lab Section Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center space-x-4 space-x-reverse mb-6">
          <i className="bx bx-test-tube text-4xl text-yellow-600"></i>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">المختبر</h1>
            <p className="text-gray-600">التحاليل الطبية والفحوصات المخبرية</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <i className="bx bx-test-tube text-3xl text-yellow-500 mb-2"></i>
            <div className="text-2xl font-bold text-yellow-600">150+</div>
            <div className="text-sm text-gray-600">نوع تحليل</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <i className="bx bx-time text-3xl text-green-500 mb-2"></i>
            <div className="text-2xl font-bold text-green-600">2-8</div>
            <div className="text-sm text-gray-600">ساعات للنتيجة</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <i className="bx bx-check-circle text-3xl text-blue-500 mb-2"></i>
            <div className="text-2xl font-bold text-blue-600">99%</div>
            <div className="text-sm text-gray-600">دقة النتائج</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <i className="bx bx-calendar text-3xl text-purple-500 mb-2"></i>
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-gray-600">خدمة الطوارئ</div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex space-x-0 space-x-reverse border-b mt-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 space-x-reverse px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-yellow-500 text-yellow-600 bg-yellow-50"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <i className={`bx ${tab.icon}`}></i>
              <span>{tab.name}</span>
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
              <h3 className="text-xl font-bold text-gray-800">حجز تحليل - {selectedTest.name}</h3>
              <button onClick={() => setShowBooking(false)} className="text-gray-500 hover:text-gray-700">
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">التحليل:</span>
                    <span>{selectedTest.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">السعر:</span>
                    <span className="text-yellow-600 font-bold">{selectedTest.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">مدة النتيجة:</span>
                    <span>{selectedTest.duration}</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg text-sm">
                <strong>تعليمات التحضير:</strong> {selectedTest.preparation}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل:</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="أدخل الاسم الكامل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف:</label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  placeholder="05xxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ المفضل:</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={() => {
                    alert("تم حجز التحليل بنجاح!")
                    setShowBooking(false)
                  }}
                  className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  تأكيد الحجز
                </button>
                <button
                  onClick={() => setShowBooking(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
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
