// pages/Home.jsx

import "./Home.css"
import { useNavigate } from "react-router-dom"
import SearchBox from "../components/Sections/SearchBox"
import SmartAssistant from "../components/Sections/SmartAssistant"
import EmergencyAccess from "../components/Sections/EmergencyAccess"
import HealthInstitutions from "../components/Sections/HealthInstitutions"
import { BRAND } from "../lib/brand"

const Home = () => {
  const navigate = useNavigate()

  const handleInstitutionSelect = (institution) => {
    navigate(`/institution/${institution.id}`)
  }

  const handleEmergencyAccess = () => {
    navigate("/emergency")
  }

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/logo.jpg"
                alt={BRAND.logoAlt}
                className="w-12 h-12 rounded-full object-cover shadow-md"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{BRAND.nameAr}</h1>
                <p className="text-gray-600">{BRAND.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => navigate("/login")}
              >
                تسجيل الدخول
              </button>
              <button
                className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                onClick={() => navigate("/register")}
              >
                إنشاء حساب
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10">
        {/* Introduction Section */}
        <section className="mb-12 text-center">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/logo.jpg"
              alt={BRAND.logoAlt}
              className="w-16 h-16 rounded-full object-cover shadow-lg me-4"
            />
            <h2 className="text-4xl font-bold text-gray-800">
              مراحل استفادة المستخدم من الخدمات عبر المنصة الصحية الذكية
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-8">
            يمر المستخدم بمجموعة من المراحل المتكاملة والمتسلسلة من أجل الاستفادة من الخدمات الصحية الرقمية التي تقدمها
            المنصة الذكية
          </p>

          {/* User Journey Steps */}
          <div className="bg-white rounded-xl shadow-lg p-8 text-start">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">مراحل الرحلة الصحية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  { label: "الولوج إلى المنصة", sub: "عبر الواجهة الرئيسية" },
                  { label: "تصفح المؤسسة الصحية", sub: "الصفحة الخاصة بالمؤسسة" },
                  { label: "الإدارة العامة", sub: "خدمات إدارية متكاملة" },
                  { label: "قسم الأطباء", sub: "حجز المواعيد والاستشارات" },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{step.label}</h4>
                      <p className="text-gray-600">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[
                  { label: "التصوير الطبي", sub: "خدمات الأشعة والتصوير" },
                  { label: "الصيدلية", sub: "إدارة الأدوية والوصفات" },
                  { label: "المخبر", sub: "التحاليل والفحوصات" },
                  { label: "قسم التمريض", sub: "الرعاية التمريضية" },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                      {i + 5}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{step.label}</h4>
                      <p className="text-gray-600">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Service Cards */}
        <section className="mb-12">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">الخدمات الرئيسية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SearchBox onSearch={handleSearch} />
            <SmartAssistant />
            <EmergencyAccess onEmergencyAccess={handleEmergencyAccess} />
            <HealthInstitutions onInstitutionSelect={handleInstitutionSelect} />
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-8">مميزات المنصة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <i className="bx bx-shield-check text-5xl text-green-500 mb-4"></i>
              <h4 className="text-xl font-semibold mb-2">أمان البيانات</h4>
              <p className="text-gray-600">حماية متقدمة لجميع البيانات الطبية والشخصية</p>
            </div>
            <div className="text-center">
              <i className="bx bx-time text-5xl text-blue-500 mb-4"></i>
              <h4 className="text-xl font-semibold mb-2">خدمة مستمرة</h4>
              <p className="text-gray-600">منصة رقمية متاحة دائماً لجميع المستخدمين</p>
            </div>
            <div className="text-center">
              <i className="bx bx-mobile-alt text-5xl text-purple-500 mb-4"></i>
              <h4 className="text-xl font-semibold mb-2">متوافق مع الجوال</h4>
              <p className="text-gray-600">تصميم متجاوب يعمل على جميع الأجهزة</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <img src="/logo.jpg" alt={BRAND.logoAlt} className="w-8 h-8 rounded-full object-cover me-2" />
            <span className="font-semibold">{BRAND.nameAr}</span>
          </div>
          <p>
            &copy; {new Date().getFullYear()} {BRAND.nameAr}. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Home
