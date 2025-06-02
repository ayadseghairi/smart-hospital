"use client"

// components/Sections/InstitutionDetails/PharmacySection.jsx

import { useState } from "react"

const PharmacySection = ({ institution }) => {
  const [activeTab, setActiveTab] = useState("medications")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const medications = [
    {
      id: 1,
      name: "باراسيتامول 500 مجم",
      category: "pain-relief",
      price: "15 ريال",
      availability: "متوفر",
      description: "مسكن للألم وخافض للحرارة",
      dosage: "قرص كل 6 ساعات",
      sideEffects: "نادراً ما يسبب آثار جانبية",
      prescription: false,
    },
    {
      id: 2,
      name: "أموكسيسيلين 250 مجم",
      category: "antibiotics",
      price: "45 ريال",
      availability: "متوفر",
      description: "مضاد حيوي واسع المجال",
      dosage: "كبسولة كل 8 ساعات",
      sideEffects: "قد يسبب اضطراب في المعدة",
      prescription: true,
    },
    {
      id: 3,
      name: "أوميبرازول 20 مجم",
      category: "digestive",
      price: "35 ريال",
      availability: "متوفر",
      description: "لعلاج حموضة المعدة",
      dosage: "كبسولة يومياً قبل الإفطار",
      sideEffects: "صداع خفيف أحياناً",
      prescription: true,
    },
    {
      id: 4,
      name: "فيتامين د 1000 وحدة",
      category: "vitamins",
      price: "25 ريال",
      availability: "قليل",
      description: "مكمل فيتامين د",
      dosage: "قرص يومياً",
      sideEffects: "آمن عند الاستخدام الصحيح",
      prescription: false,
    },
    {
      id: 5,
      name: "إنسولين سريع المفعول",
      category: "diabetes",
      price: "120 ريال",
      availability: "غير متوفر",
      description: "إنسولين لمرضى السكري",
      dosage: "حسب توجيهات الطبيب",
      sideEffects: "انخفاض السكر إذا زادت الجرعة",
      prescription: true,
    },
  ]

  const categories = [
    { id: "all", name: "جميع الأدوية", icon: "bx-capsule" },
    { id: "pain-relief", name: "مسكنات", icon: "bx-band-aid" },
    { id: "antibiotics", name: "مضادات حيوية", icon: "bx-shield" },
    { id: "digestive", name: "أدوية الجهاز الهضمي", icon: "bx-stomach" },
    { id: "vitamins", name: "فيتامينات", icon: "bx-leaf" },
    { id: "diabetes", name: "أدوية السكري", icon: "bx-injection" },
  ]

  const prescriptions = [
    {
      id: 1,
      patientName: "أحمد محمد",
      doctorName: "د. سارة أحمد",
      date: "2024-01-15",
      status: "جاهز للاستلام",
      medications: ["أموكسيسيلين 250 مجم", "باراسيتامول 500 مجم"],
      total: "60 ريال",
    },
    {
      id: 2,
      patientName: "فاطمة علي",
      doctorName: "د. محمد الأحمد",
      date: "2024-01-14",
      status: "قيد التحضير",
      medications: ["أوميبرازول 20 مجم"],
      total: "35 ريال",
    },
  ]

  const filteredMedications = medications.filter((med) => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || med.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const renderMedicationsTab = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن دواء..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <i className={`bx ${category.icon}`}></i>
              <span className="text-sm">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Medications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedications.map((medication) => (
          <div key={medication.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{medication.name}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    medication.availability === "متوفر"
                      ? "bg-green-100 text-green-800"
                      : medication.availability === "قليل"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {medication.availability}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-3">{medication.description}</p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">السعر:</span>
                  <span className="font-semibold text-red-600">{medication.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الجرعة:</span>
                  <span className="font-medium">{medication.dosage}</span>
                </div>
                {medication.prescription && (
                  <div className="flex items-center space-x-1 space-x-reverse text-orange-600">
                    <i className="bx bx-receipt text-sm"></i>
                    <span className="text-xs">يتطلب وصفة طبية</span>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                <strong>الآثار الجانبية:</strong> {medication.sideEffects}
              </div>

              <button
                disabled={medication.availability === "غير متوفر"}
                className="w-full mt-4 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {medication.availability === "غير متوفر" ? "غير متوفر" : "طلب الدواء"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderPrescriptionsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">الوصفات الطبية</h3>
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">{prescription.patientName}</h4>
                  <p className="text-sm text-gray-600">وصفة من {prescription.doctorName}</p>
                  <p className="text-xs text-gray-500">{prescription.date}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    prescription.status === "جاهز للاستلام"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {prescription.status}
                </span>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">الأدوية:</p>
                <ul className="text-sm text-gray-600">
                  {prescription.medications.map((med, index) => (
                    <li key={index} className="flex items-center space-x-2 space-x-reverse">
                      <i className="bx bx-capsule text-red-500"></i>
                      <span>{med}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-red-600">المجموع: {prescription.total}</span>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                  {prescription.status === "جاهز للاستلام" ? "استلام" : "تتبع الطلب"}
                </button>
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
          <i className="bx bx-receipt text-4xl text-red-500 mb-3"></i>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">استشارة دوائية</h3>
          <p className="text-gray-600 text-sm mb-4">استشارة مع الصيدلي حول الأدوية</p>
          <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors">
            طلب استشارة
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow text-center">
          <i className="bx bx-home text-4xl text-blue-500 mb-3"></i>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">توصيل منزلي</h3>
          <p className="text-gray-600 text-sm mb-4">توصيل الأدوية إلى المنزل</p>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            طلب توصيل
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow text-center">
          <i className="bx bx-refresh text-4xl text-green-500 mb-3"></i>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">تجديد الوصفة</h3>
          <p className="text-gray-600 text-sm mb-4">تجديد الوصفات الطبية المنتهية</p>
          <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
            تجديد وصفة
          </button>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: "medications", name: "الأدوية", icon: "bx-capsule" },
    { id: "prescriptions", name: "الوصفات", icon: "bx-receipt" },
    { id: "services", name: "الخدمات", icon: "bx-cog" },
  ]

  return (
    <div className="space-y-6">
      {/* Pharmacy Section Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center space-x-4 space-x-reverse mb-6">
          <i className="bx bx-plus-medical text-4xl text-red-600"></i>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">الصيدلية</h1>
            <p className="text-gray-600">إدارة الأدوية والوصفات الطبية</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <i className="bx bx-capsule text-3xl text-red-500 mb-2"></i>
            <div className="text-2xl font-bold text-red-600">1,250</div>
            <div className="text-sm text-gray-600">صنف دوائي</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <i className="bx bx-check-circle text-3xl text-green-500 mb-2"></i>
            <div className="text-2xl font-bold text-green-600">95%</div>
            <div className="text-sm text-gray-600">نسبة التوفر</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <i className="bx bx-receipt text-3xl text-blue-500 mb-2"></i>
            <div className="text-2xl font-bold text-blue-600">45</div>
            <div className="text-sm text-gray-600">وصفة اليوم</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <i className="bx bx-time text-3xl text-purple-500 mb-2"></i>
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
                  ? "border-red-500 text-red-600 bg-red-50"
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
      {activeTab === "medications" && renderMedicationsTab()}
      {activeTab === "prescriptions" && renderPrescriptionsTab()}
      {activeTab === "services" && renderServicesTab()}
    </div>
  )
}

export default PharmacySection

