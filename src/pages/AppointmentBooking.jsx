"use client"

// pages/AppointmentBooking.jsx

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"

const AppointmentBooking = () => {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    appointmentType: "consultation",
    date: "",
    time: "",
    patientInfo: {
      name: "",
      phone: "",
      email: "",
      age: "",
      gender: "",
      medicalHistory: "",
    },
    symptoms: "",
    previousVisit: false,
  })

  // Mock doctor data (same as DoctorProfile)
  const mockDoctors = {
    1: {
      id: 1,
      name: "د. أحمد محمد السعيد",
      specialty: "أخصائي القلب والأوعية الدموية",
      institution: "مستشفى الملك فهد التخصصي",
      consultationFee: "300 ريال",
      image: "/placeholder.svg?height=100&width=100",
      availableSlots: [
        { date: "2024-01-15", time: "10:00", available: true },
        { date: "2024-01-15", time: "11:00", available: false },
        { date: "2024-01-15", time: "14:00", available: true },
        { date: "2024-01-16", time: "09:00", available: true },
        { date: "2024-01-16", time: "10:30", available: true },
        { date: "2024-01-17", time: "11:00", available: true },
        { date: "2024-01-17", time: "14:30", available: true },
      ],
    },
  }

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const doctorData = mockDoctors[doctorId]
      setDoctor(doctorData)
      setLoading(false)
    }, 1000)
  }, [doctorId])

  const appointmentTypes = [
    { id: "consultation", name: "استشارة أولى", price: "300 ريال", duration: "30 دقيقة" },
    { id: "followup", name: "متابعة", price: "200 ريال", duration: "20 دقيقة" },
    { id: "checkup", name: "فحص دوري", price: "250 ريال", duration: "25 دقيقة" },
    { id: "emergency", name: "استشارة طارئة", price: "500 ريال", duration: "45 دقيقة" },
  ]

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setBookingData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setBookingData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleConfirmBooking = () => {
    // Here you would typically send the booking data to your API
    alert("تم حجز الموعد بنجاح! سيتم إرسال تأكيد عبر الرسائل النصية.")
    navigate(`/doctor/${doctorId}`)
  }

  const getAvailableDates = () => {
    const dates = [...new Set(doctor.availableSlots.filter((slot) => slot.available).map((slot) => slot.date))]
    return dates
  }

  const getAvailableTimesForDate = (selectedDate) => {
    return doctor.availableSlots.filter((slot) => slot.date === selectedDate && slot.available)
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">اختر نوع الموعد</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointmentTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => handleInputChange("appointmentType", type.id)}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-colors ${
                    bookingData.appointmentType === type.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{type.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-semibold">{type.price}</span>
                    <span className="text-gray-600 text-sm">{type.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">اختر التاريخ والوقت</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">التاريخ:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {getAvailableDates().map((date) => (
                  <button
                    key={date}
                    onClick={() => handleInputChange("date", date)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      bookingData.date === date
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {new Date(date).toLocaleDateString("ar-SA")}
                  </button>
                ))}
              </div>
            </div>

            {bookingData.date && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">الوقت:</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {getAvailableTimesForDate(bookingData.date).map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => handleInputChange("time", slot.time)}
                      className={`p-3 rounded-lg border-2 transition-colors ${
                        bookingData.time === slot.time
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">معلومات المريض</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الكامل *</label>
                <input
                  type="text"
                  value={bookingData.patientInfo.name}
                  onChange={(e) => handleInputChange("patientInfo.name", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أدخل الاسم الكامل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
                <input
                  type="tel"
                  value={bookingData.patientInfo.phone}
                  onChange={(e) => handleInputChange("patientInfo.phone", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="05xxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={bookingData.patientInfo.email}
                  onChange={(e) => handleInputChange("patientInfo.email", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">العمر *</label>
                <input
                  type="number"
                  value={bookingData.patientInfo.age}
                  onChange={(e) => handleInputChange("patientInfo.age", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="العمر"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">الجنس *</label>
                <div className="flex space-x-4 space-x-reverse">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="male"
                      checked={bookingData.patientInfo.gender === "male"}
                      onChange={(e) => handleInputChange("patientInfo.gender", e.target.value)}
                      className="mr-2"
                    />
                    ذكر
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="female"
                      checked={bookingData.patientInfo.gender === "female"}
                      onChange={(e) => handleInputChange("patientInfo.gender", e.target.value)}
                      className="mr-2"
                    />
                    أنثى
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الأعراض أو سبب الزيارة</label>
              <textarea
                value={bookingData.symptoms}
                onChange={(e) => handleInputChange("symptoms", e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="اشرح الأعراض أو سبب الزيارة..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ المرضي</label>
              <textarea
                value={bookingData.patientInfo.medicalHistory}
                onChange={(e) => handleInputChange("patientInfo.medicalHistory", e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أي أمراض مزمنة أو أدوية حالية..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={bookingData.previousVisit}
                onChange={(e) => handleInputChange("previousVisit", e.target.checked)}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">هل زرت هذا الطبيب من قبل؟</label>
            </div>
          </div>
        )

      case 4:
        const selectedType = appointmentTypes.find((type) => type.id === bookingData.appointmentType)
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">تأكيد الحجز</h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">ملخص الموعد</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">الطبيب:</span>
                  <span className="font-medium">{doctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">التخصص:</span>
                  <span className="font-medium">{doctor.specialty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">نوع الموعد:</span>
                  <span className="font-medium">{selectedType?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">التاريخ:</span>
                  <span className="font-medium">{new Date(bookingData.date).toLocaleDateString("ar-SA")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الوقت:</span>
                  <span className="font-medium">{bookingData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المدة:</span>
                  <span className="font-medium">{selectedType?.duration}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-600 font-semibold">التكلفة:</span>
                  <span className="font-bold text-blue-600">{selectedType?.price}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">معلومات المريض</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">الاسم:</span>
                  <span className="font-medium">{bookingData.patientInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الهاتف:</span>
                  <span className="font-medium">{bookingData.patientInfo.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">العمر:</span>
                  <span className="font-medium">{bookingData.patientInfo.age} سنة</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الجنس:</span>
                  <span className="font-medium">{bookingData.patientInfo.gender === "male" ? "ذكر" : "أنثى"}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start space-x-3 space-x-reverse">
                <i className="bx bx-info-circle text-blue-500 text-xl mt-1"></i>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">ملاحظات مهمة:</p>
                  <ul className="space-y-1">
                    <li>• يرجى الحضور قبل 15 دقيقة من موعدك</li>
                    <li>• إحضار الهوية الشخصية وبطاقة التأمين</li>
                    <li>• في حالة التأخير أكثر من 15 دقيقة، قد يتم إلغاء الموعد</li>
                    <li>• يمكن إلغاء أو تعديل الموعد قبل 24 ساعة</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <i className="bx bx-loader-alt animate-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">جاري تحميل بيانات الحجز...</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <i className="bx bx-error text-6xl text-red-500 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">خطأ في تحميل البيانات</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to={`/doctor/${doctorId}`}
              className="flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-800 transition-colors"
            >
              <i className="bx bx-arrow-back text-xl"></i>
              <span>العودة لملف الطبيب</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">حجز موعد</h1>
              <p className="text-gray-600">مع {doctor.name}</p>
            </div>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= stepNumber ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${step > stepNumber ? "bg-blue-600" : "bg-gray-200"}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>نوع الموعد</span>
            <span>التاريخ والوقت</span>
            <span>معلومات المريض</span>
            <span>تأكيد الحجز</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow p-8">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevStep}
              disabled={step === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>

            {step < 4 ? (
              <button
                onClick={handleNextStep}
                disabled={
                  (step === 1 && !bookingData.appointmentType) ||
                  (step === 2 && (!bookingData.date || !bookingData.time)) ||
                  (step === 3 &&
                    (!bookingData.patientInfo.name ||
                      !bookingData.patientInfo.phone ||
                      !bookingData.patientInfo.age ||
                      !bookingData.patientInfo.gender))
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            ) : (
              <button
                onClick={handleConfirmBooking}
                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                تأكيد الحجز
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppointmentBooking
