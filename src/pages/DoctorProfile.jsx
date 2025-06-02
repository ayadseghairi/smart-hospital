"use client"

// pages/DoctorProfile.jsx

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"

const DoctorProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doctor, setDoctor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock doctor data
  const mockDoctors = {
    1: {
      id: 1,
      name: "د. أحمد محمد السعيد",
      specialty: "أخصائي القلب والأوعية الدموية",
      institution: "مستشفى الملك فهد التخصصي",
      institutionId: 1,
      experience: "15 سنة",
      rating: 4.9,
      reviewsCount: 234,
      consultationFee: "300 ريال",
      languages: ["العربية", "الإنجليزية"],
      education: "دكتوراه في طب القلب - جامعة الملك سعود",
      image: "/placeholder.svg?height=200&width=200",
      about:
        "د. أحمد محمد السعيد هو أخصائي قلب وأوعية دموية معتمد مع أكثر من 15 عامًا من الخبرة في علاج أمراض القلب المعقدة. حاصل على دكتوراه في طب القلب من جامعة الملك سعود ومتخصص في جراحة القلب المفتوح وقسطرة القلب.",
      specializations: [
        "جراحة القلب المفتوح",
        "قسطرة القلب",
        "علاج اضطرابات النظم",
        "زراعة أجهزة تنظيم ضربات القلب",
        "علاج فشل القلب",
      ],
      achievements: [
        "جائزة أفضل طبيب قلب لعام 2023",
        "عضو الجمعية السعودية لأمراض القلب",
        "أكثر من 500 عملية قلب ناجحة",
        "باحث في 25 دراسة علمية منشورة",
      ],
      availableSlots: [
        { date: "2024-01-15", time: "10:00", available: true },
        { date: "2024-01-15", time: "11:00", available: false },
        { date: "2024-01-15", time: "14:00", available: true },
        { date: "2024-01-16", time: "09:00", available: true },
        { date: "2024-01-16", time: "10:30", available: true },
      ],
      reviews: [
        {
          id: 1,
          patientName: "محمد أحمد",
          rating: 5,
          comment: "طبيب ممتاز ومتمكن، شرح لي حالتي بوضوح وكان العلاج فعال جداً",
          date: "2024-01-10",
        },
        {
          id: 2,
          patientName: "فاطمة علي",
          rating: 5,
          comment: "أفضل طبيب قلب تعاملت معه، دقيق في التشخيص ومتابعة ممتازة",
          date: "2024-01-08",
        },
      ],
    },
  }

  useEffect(() => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      const doctorData = mockDoctors[id]
      setDoctor(doctorData)
      setLoading(false)
    }, 1000)
  }, [id])

  const handleBookAppointment = () => {
    navigate(`/appointment/book/${id}`)
  }

  const tabs = [
    { id: "overview", name: "نظرة عامة", icon: "bx-user" },
    { id: "schedule", name: "المواعيد المتاحة", icon: "bx-calendar" },
    { id: "reviews", name: "التقييمات", icon: "bx-star" },
    { id: "contact", name: "التواصل", icon: "bx-phone" },
  ]

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <i className="bx bx-loader-alt animate-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">جاري تحميل بيانات الطبيب...</p>
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">الطبيب غير موجود</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">نبذة عن الطبيب</h3>
              <p className="text-gray-600 leading-relaxed">{doctor.about}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">التخصصات</h3>
                <div className="space-y-2">
                  {doctor.specializations.map((spec, index) => (
                    <div key={index} className="flex items-center space-x-2 space-x-reverse">
                      <i className="bx bx-check text-green-500"></i>
                      <span className="text-gray-700">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">الإنجازات</h3>
                <div className="space-y-2">
                  {doctor.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-2 space-x-reverse">
                      <i className="bx bx-award text-yellow-500"></i>
                      <span className="text-gray-700">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case "schedule":
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">المواعيد المتاحة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctor.availableSlots.map((slot, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    slot.available
                      ? "border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                  }`}
                  onClick={() => slot.available && handleBookAppointment()}
                >
                  <div className="text-center">
                    <div className="font-semibold text-gray-800">{new Date(slot.date).toLocaleDateString("ar-SA")}</div>
                    <div className="text-lg font-bold text-blue-600">{slot.time}</div>
                    <div className={`text-sm ${slot.available ? "text-green-600" : "text-gray-500"}`}>
                      {slot.available ? "متاح" : "محجوز"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "reviews":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">تقييمات المرضى</h3>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <i key={i} className={`bx ${i <= Math.floor(doctor.rating) ? "bxs-star" : "bx-star"}`}></i>
                    ))}
                  </div>
                  <span className="text-lg font-semibold">{doctor.rating}</span>
                  <span className="text-gray-600">({doctor.reviewsCount} تقييم)</span>
                </div>
              </div>

              <div className="space-y-4">
                {doctor.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {review.patientName.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-800">{review.patientName}</span>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <div className="flex text-yellow-500">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <i key={i} className={`bx ${i <= review.rating ? "bxs-star" : "bx-star"} text-sm`}></i>
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case "contact":
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">معلومات التواصل</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <i className="bx bx-hospital text-2xl text-blue-500"></i>
                <div>
                  <div className="font-semibold text-gray-800">المستشفى</div>
                  <div className="text-gray-600">{doctor.institution}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <i className="bx bx-phone text-2xl text-green-500"></i>
                <div>
                  <div className="font-semibold text-gray-800">الهاتف</div>
                  <div className="text-gray-600">+966 11 123 4567</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <i className="bx bx-envelope text-2xl text-purple-500"></i>
                <div>
                  <div className="font-semibold text-gray-800">البريد الإلكتروني</div>
                  <div className="text-gray-600">dr.ahmed@hospital.com</div>
                </div>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <i className="bx bx-time text-2xl text-orange-500"></i>
                <div>
                  <div className="font-semibold text-gray-800">ساعات العمل</div>
                  <div className="text-gray-600">السبت - الخميس: 9:00 ص - 5:00 م</div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center space-x-2 space-x-reverse text-blue-600 hover:text-blue-800 transition-colors"
            >
              <i className="bx bx-arrow-back text-xl"></i>
              <span>العودة للرئيسية</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">ملف الطبيب</h1>
            </div>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Doctor Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 md:space-x-reverse">
            <img
              src={doctor.image || "/placeholder.svg"}
              alt={doctor.name}
              className="w-32 h-32 rounded-full object-cover"
            />
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{doctor.name}</h1>
              <p className="text-xl text-blue-600 mb-2">{doctor.specialty}</p>
              <p className="text-gray-600 mb-4">{doctor.institution}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                <div className="flex items-center space-x-1 space-x-reverse">
                  <i className="bx bx-time text-gray-500"></i>
                  <span className="text-gray-600">{doctor.experience}</span>
                </div>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <i className="bx bx-star text-yellow-500"></i>
                  <span className="text-gray-600">
                    {doctor.rating} ({doctor.reviewsCount} تقييم)
                  </span>
                </div>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <i className="bx bx-dollar text-green-500"></i>
                  <span className="text-gray-600">{doctor.consultationFee}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {doctor.languages.map((lang, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {lang}
                  </span>
                ))}
              </div>

              <button
                onClick={handleBookAppointment}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                حجز موعد
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex space-x-0 space-x-reverse overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 space-x-reverse px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
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
        {renderTabContent()}
      </div>
    </div>
  )
}

export default DoctorProfile
