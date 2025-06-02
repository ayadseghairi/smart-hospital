"use client"

// components/Sections/InstitutionDetails/NursesSection.jsx

import { useState } from "react"

const NursesSection = ({ institution }) => {
  const [activeTab, setActiveTab] = useState("services")
  const [selectedService, setSelectedService] = useState(null)
  const [showBooking, setShowBooking] = useState(false)

  const nursingServices = [
    {
      id: 1,
      name: "رعاية منزلية",
      description: "خدمات التمريض في المنزل",
      price: "200 ريال/يوم",
      duration: "8-24 ساعة",
      includes: ["قياس العلامات الحيوية", "إعطاء الأدوية", "العناية بالجروح", "المتابعة الطبية"],
      icon: "bx-home-heart",
      available: true,
    },
    {
      id: 2,
      name: "العناية بالجروح",
      description: "تنظيف وتضميد الجروح",
      price: "80 ريال/جلسة",
      duration: "30-45 دقيقة",
      includes: ["تنظيف الجرح", "تطبيق المطهرات", "تغيير الضمادات", "متابعة الشفاء"],
      icon: "bx-band-aid",
      available: true,
    },
    {
      id: 3,
      name: "حقن طبية",
      description: "إعطاء الحقن والأدوية",
      price: "50 ريال/حقنة",
      duration: "15-20 دقيقة",
      includes: ["حقن عضلية", "حقن وريدية", "حقن تحت الجلد", "متابعة الآثار الجانبية"],
      icon: "bx-injection",
      available: true,
    },
    {
      id: 4,
      name: "قياس العلامات الحيوية",
      description: "مراقبة الحالة الصحية",
      price: "30 ريال/زيارة",
      duration: "15-30 دقيقة",
      includes: ["قياس الضغط", "قياس الحرارة", "قياس النبض", "قياس التنفس"],
      icon: "bx-pulse",
      available: true,
    },
    {
      id: 5,
      name: "العلاج الطبيعي",
      description: "تمارين وعلاج طبيعي",
      price: "150 ريال/جلسة",
      duration: "45-60 دقيقة",
      includes: ["تمارين حركية", "تدليك علاجي", "تقوية العضلات", "تحسين المرونة"],
      icon: "bx-dumbbell",
      available: true,
    },
    {
      id: 6,
      name: "رعاية كبار السن",
      description: "رعاية شاملة لكبار السن",
      price: "300 ريال/يوم",
      duration: "12-24 ساعة",
      includes: ["مساعدة في الأنشطة اليومية", "إعطاء الأدوية", "المراقبة الصحية", "الدعم النفسي"],
      icon: "bx-user-check",
      available: true,
    },
  ]

  const nurses = [
    {
      id: 1,
      name: "الممرضة سارة أحمد",
      specialty: "تمريض عام",
      experience: "8 سنوات",
      rating: 4.9,
      image: "/placeholder.svg?height=100&width=100",
      certifications: ["ممرضة مسجلة", "إسعافات أولية", "رعاية منزلية"],
      languages: ["العربية", "الإنجليزية"],
      availability: "متاحة",
    },
    {
      id: 2,
      name: "الممرض محمد علي",
      specialty: "العناية المركزة",
      experience: "12 سنة",
      rating: 4.8,
      image: "/placeholder.svg?height=100&width=100",
      certifications: ["ممرض مسجل", "العناية المركزة", "الطوارئ"],
      languages: ["العربية", "الإنجليزية"],
      availability: "متاح",
    },
    {
      id: 3,
      name: "الممرضة فاطمة حسن",
      specialty: "تمريض الأطفال",
      experience: "6 سنوات",
      rating: 4.9,
      image: "/placeholder.svg?height=100&width=100",
      certifications: ["تمريض الأطفال", "رعاية حديثي الولادة"],
      languages: ["العربية"],
      availability: "متاحة",
    },
  ]

  const appointments = [
    {
      id: 1,
      patientName: "أحمد محمد",
      nurseName: "سارة أحمد",
      service: "رعاية منزلية",
      date: "2024-01-15",
      time: "09:00",
      status: "مؤكد",
      duration: "8 ساعات",
    },
    {
      id: 2,
      patientName: "فاطمة علي",
      nurseName: "محمد علي",
      service: "العناية بالجروح",
      date: "2024-01-15",
      time: "14:00",
      status: "قيد التنفيذ",
      duration: "45 دقيقة",
    },
  ]

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
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border-l-4 border-pink-500"
          >
            <div className="p-6">
              <div className="text-center mb-4">
                <i className={`bx ${service.icon} text-4xl text-pink-500 mb-2`}></i>
                <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
              </div>

              <p className="text-gray-600 text-sm mb-4">{service.description}</p>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">السعر:</span>
                  <span className="font-semibold text-pink-600">{service.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">المدة:</span>
                  <span className="font-medium">{service.duration}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">يشمل:</p>
                <div className="space-y-1">
                  {service.includes.slice(0, 2).map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                      <i className="bx bx-check text-green-500"></i>
                      <span>{item}</span>
                    </div>
                  ))}
                  {service.includes.length > 2 && (
                    <span className="text-xs text-gray-500">+{service.includes.length - 2} المزيد</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleServiceSelect(service)}
                className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                طلب الخدمة
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderNursesTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nurses.map((nurse) => (
          <div key={nurse.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="text-center mb-4">
                <img
                  src={nurse.image || "/placeholder.svg"}
                  alt={nurse.name}
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-800">{nurse.name}</h3>
                <p className="text-gray-600 text-sm">{nurse.specialty}</p>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">الخبرة:</span>
                  <span className="font-medium">{nurse.experience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">التقييم:</span>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <span className="font-medium">{nurse.rating}</span>
                    <i className="bx bx-star text-yellow-500"></i>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الحالة:</span>
                  <span className="font-medium text-green-600">{nurse.availability}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">الشهادات:</p>
                <div className="flex flex-wrap gap-1">
                  {nurse.certifications.slice(0, 2).map((cert, index) => (
                    <span key={index} className="bg-pink-100 text-pink-800 px-2 py-1 rounded text-xs">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2 space-x-reverse">
                <button className="flex-1 bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors text-sm">
                  طلب خدمة
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  الملف
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAppointmentsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">المواعيد المحجوزة</h3>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">{appointment.patientName}</h4>
                  <p className="text-sm text-gray-600">مع {appointment.nurseName}</p>
                  <p className="text-sm text-gray-600">{appointment.service}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      appointment.status === "مؤكد"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "قيد التنفيذ"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {appointment.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {appointment.date} - {appointment.time}
                  </p>
                  <p className="text-xs text-gray-500">المدة: {appointment.duration}</p>
                </div>
              </div>

              <div className="flex justify-end space-x-2 space-x-reverse">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  تفاصيل
                </button>
                {appointment.status === "مؤكد" && (
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                    إلغاء
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: "services", name: "الخدمات", icon: "bx-heart" },
    { id: "nurses", name: "الممرضين", icon: "bx-user-plus" },
    { id: "appointments", name: "المواعيد", icon: "bx-calendar" },
  ]

  return (
    <div className="space-y-6">
      {/* Nurses Section Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center space-x-4 space-x-reverse mb-6">
          <i className="bx bx-heart text-4xl text-pink-600"></i>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">قسم التمريض</h1>
            <p className="text-gray-600">خدمات الرعاية التمريضية المتخصصة</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <i className="bx bx-user-plus text-3xl text-pink-500 mb-2"></i>
            <div className="text-2xl font-bold text-pink-600">25</div>
            <div className="text-sm text-gray-600">ممرض/ة</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <i className="bx bx-check-circle text-3xl text-green-500 mb-2"></i>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <div className="text-sm text-gray-600">رضا المرضى</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <i className="bx bx-calendar text-3xl text-blue-500 mb-2"></i>
            <div className="text-2xl font-bold text-blue-600">35</div>
            <div className="text-sm text-gray-600">موعد اليوم</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <i className="bx bx-time text-3xl text-purple-500 mb-2"></i>
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-gray-600">خدمة طوارئ</div>
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
                  ? "border-pink-500 text-pink-600 bg-pink-50"
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
      {activeTab === "services" && renderServicesTab()}
      {activeTab === "nurses" && renderNursesTab()}
      {activeTab === "appointments" && renderAppointmentsTab()}

      {/* Booking Modal */}
      {showBooking && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">طلب خدمة - {selectedService.name}</h3>
              <button onClick={() => setShowBooking(false)} className="text-gray-500 hover:text-gray-700">
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-pink-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">الخدمة:</span>
                    <span>{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">السعر:</span>
                    <span className="text-pink-600 font-bold">{selectedService.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">المدة:</span>
                    <span>{selectedService.duration}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">الخدمة تشمل:</p>
                <div className="space-y-1">
                  {selectedService.includes.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                      <i className="bx bx-check text-green-500"></i>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل:</label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="أدخل الاسم الكامل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف:</label>
                <input
                  type="tel"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="05xxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">العنوان (للخدمات المنزلية):</label>
                <textarea
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="أدخل العنوان التفصيلي..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ والوقت المفضل:</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <input
                    type="time"
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية:</label>
                <textarea
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="أي ملاحظات أو تعليمات خاصة..."
                />
              </div>

              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={() => {
                    alert("تم طلب الخدمة بنجاح! سيتم التواصل معك قريباً.")
                    setShowBooking(false)
                  }}
                  className="flex-1 bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  تأكيد الطلب
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

export default NursesSection
