"use client"

// components/Sections/InstitutionDetails/ImagingSection.jsx

import { useState } from "react"

const ImagingSection = ({ institution }) => {
  const [selectedService, setSelectedService] = useState(null)
  const [showBooking, setShowBooking] = useState(false)
  const [bookingData, setBookingData] = useState({
    service: "",
    date: "",
    time: "",
    patientInfo: {
      name: "",
      phone: "",
      nationalId: "",
    },
    notes: "",
  })

  const imagingServices = [
    {
      id: "xray",
      name: "الأشعة السينية",
      description: "فحص الأشعة السينية للعظام والصدر",
      price: "150 ريال",
      duration: "15 دقيقة",
      preparation: "لا يتطلب تحضير خاص",
      icon: "bx-x-ray",
      available: true,
    },
    {
      id: "ct",
      name: "الأشعة المقطعية",
      description: "فحص مقطعي مفصل للأعضاء الداخلية",
      price: "800 ريال",
      duration: "30 دقيقة",
      preparation: "صيام 4 ساعات قبل الفحص",
      icon: "bx-scan",
      available: true,
    },
    {
      id: "mri",
      name: "الرنين المغناطيسي",
      description: "تصوير مفصل بالرنين المغناطيسي",
      price: "1200 ريال",
      duration: "45 دقيقة",
      preparation: "إزالة جميع المعادن",
      icon: "bx-brain",
      available: true,
    },
    {
      id: "ultrasound",
      name: "الموجات فوق الصوتية",
      description: "فحص بالموجات فوق الصوتية",
      price: "200 ريال",
      duration: "20 دقيقة",
      preparation: "امتلاء المثانة للفحص البطني",
      icon: "bx-pulse",
      available: true,
    },
    {
      id: "mammography",
      name: "تصوير الثدي",
      description: "فحص تصوير الثدي للكشف المبكر",
      price: "300 ريال",
      duration: "25 دقيقة",
      preparation: "تجنب مزيل العرق",
      icon: "bx-health",
      available: true,
    },
    {
      id: "nuclear",
      name: "الطب النووي",
      description: "فحوصات الطب النووي المتخصصة",
      price: "1500 ريال",
      duration: "60 دقيقة",
      preparation: "تعليمات خاصة حسب نوع الفحص",
      icon: "bx-atom",
      available: false,
    },
  ]

  const availableSlots = [
    { date: "2024-01-15", time: "09:00", available: true },
    { date: "2024-01-15", time: "10:00", available: true },
    { date: "2024-01-15", time: "11:00", available: false },
    { date: "2024-01-15", time: "14:00", available: true },
    { date: "2024-01-16", time: "09:30", available: true },
    { date: "2024-01-16", time: "10:30", available: true },
  ]

  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setBookingData({ ...bookingData, service: service.id })
  }

  const handleBooking = () => {
    setShowBooking(true)
  }

  const handleConfirmBooking = () => {
    alert(`تم حجز موعد ${selectedService.name} بنجاح!`)
    setShowBooking(false)
    setSelectedService(null)
  }

  return (
    <div className="space-y-6">
      {/* Imaging Section Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center space-x-4 space-x-reverse mb-6">
          <i className="bx bx-camera text-4xl text-purple-600"></i>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">قسم التصوير الطبي</h1>
            <p className="text-gray-600">خدمات التصوير والأشعة المتقدمة</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <i className="bx bx-devices text-3xl text-purple-500 mb-2"></i>
            <div className="text-2xl font-bold text-purple-600">12</div>
            <div className="text-sm text-gray-600">جهاز تصوير</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <i className="bx bx-calendar text-3xl text-blue-500 mb-2"></i>
            <div className="text-2xl font-bold text-blue-600">45</div>
            <div className="text-sm text-gray-600">موعد اليوم</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <i className="bx bx-check-circle text-3xl text-green-500 mb-2"></i>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <div className="text-sm text-gray-600">دقة التشخيص</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <i className="bx bx-time text-3xl text-yellow-500 mb-2"></i>
            <div className="text-2xl font-bold text-yellow-600">15</div>
            <div className="text-sm text-gray-600">دقيقة متوسط الانتظار</div>
          </div>
        </div>
      </div>

      {/* Imaging Services */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">خدمات التصوير المتاحة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {imagingServices.map((service) => (
            <div
              key={service.id}
              className={`border-2 rounded-lg p-6 transition-all cursor-pointer ${
                service.available
                  ? selectedService?.id === service.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300 hover:shadow-md"
                  : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
              }`}
              onClick={() => service.available && handleServiceSelect(service)}
            >
              <div className="text-center mb-4">
                <i className={`bx ${service.icon} text-4xl text-purple-500 mb-2`}></i>
                <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-600">{service.description}</p>
                <div className="flex justify-between">
                  <span className="text-gray-500">السعر:</span>
                  <span className="font-semibold text-purple-600">{service.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">المدة:</span>
                  <span className="font-medium">{service.duration}</span>
                </div>
                <div className="mt-3 p-2 bg-yellow-50 rounded text-xs">
                  <strong>التحضير:</strong> {service.preparation}
                </div>
              </div>

              {service.available ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleServiceSelect(service)
                    handleBooking()
                  }}
                  className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  حجز موعد
                </button>
              ) : (
                <div className="w-full mt-4 bg-gray-400 text-white py-2 rounded-lg text-center">
                  غير متاح حالياً
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Equipment Information */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">الأجهزة والمعدات</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 rounded-lg">
              <i className="bx bx-check-circle text-green-500 text-xl"></i>
              <div>
                <div className="font-semibold">أجهزة حديثة</div>
                <div className="text-sm text-gray-600">أحدث تقنيات التصوير الطبي</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 rounded-lg">
              <i className="bx bx-shield-check text-blue-500 text-xl"></i>
              <div>
                <div className="font-semibold">معايير السلامة</div>
                <div className="text-sm text-gray-600">أعلى معايير الأمان والحماية</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 rounded-lg">
              <i className="bx bx-user-check text-purple-500 text-xl"></i>
              <div>
                <div className="font-semibold">فريق متخصص</div>
                <div className="text-sm text-gray-600">أخصائيو أشعة معتمدون</div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 rounded-lg">
              <i className="bx bx-time-five text-orange-500 text-xl"></i>
              <div>
                <div className="font-semibold">نتائج سريعة</div>
                <div className="text-sm text-gray-600">تقارير خلال 24 ساعة</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 rounded-lg">
              <i className="bx bx-cloud text-indigo-500 text-xl"></i>
              <div>
                <div className="font-semibold">أرشفة رقمية</div>
                <div className="text-sm text-gray-600">حفظ الصور والتقارير إلكترونياً</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 rounded-lg">
              <i className="bx bx-phone text-green-500 text-xl"></i>
              <div>
                <div className="font-semibold">استشارة فورية</div>
                <div className="text-sm text-gray-600">مراجعة النتائج مع الطبيب</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">حجز موعد - {selectedService.name}</h3>
              <button onClick={() => setShowBooking(false)} className="text-gray-500 hover:text-gray-700">
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">الخدمة:</span>
                  <span>{selectedService.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">السعر:</span>
                  <span className="text-purple-600 font-bold">{selectedService.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">المدة:</span>
                  <span>{selectedService.duration}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل:</label>
                <input
                  type="text"
                  value={bookingData.patientInfo.name}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      patientInfo: { ...bookingData.patientInfo, name: e.target.value },
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="أدخل الاسم الكامل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف:</label>
                <input
                  type="tel"
                  value={bookingData.patientInfo.phone}
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      patientInfo: { ...bookingData.patientInfo, phone: e.target.value },
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="05xxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ المفضل:</label>
                <select
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">اختر التاريخ</option>
                  {availableSlots
                    .filter((slot) => slot.available)
                    .map((slot, index) => (
                      <option key={index} value={`${slot.date}-${slot.time}`}>
                        {new Date(slot.date).toLocaleDateString("ar-SA")} - {slot.time}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات إضافية:</label>
                <textarea
                  value={bookingData.notes}
                  onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="أي ملاحظات أو تعليمات خاصة..."
                />
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                <strong>تعليمات التحضير:</strong> {selectedService.preparation}
              </div>

              <div className="flex space-x-3 space-x-reverse">
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
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

export default ImagingSection
