// components/Sections/InstitutionDetails/PharmacySection.jsx

const PharmacySection = () => {
  // Medications, prescriptions and stats come from the real API (Phase 5).
  // Until then, show an honest empty state.

  const services = [
    { icon: "bx-receipt", color: "text-red-500", title: "استشارة دوائية", desc: "استشارة مع الصيدلي حول الأدوية" },
    { icon: "bx-home", color: "text-blue-500", title: "توصيل منزلي", desc: "توصيل الأدوية إلى المنزل" },
    { icon: "bx-refresh", color: "text-green-500", title: "تجديد الوصفة", desc: "تجديد الوصفات الطبية المنتهية" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <i className="bx bx-plus-medical text-4xl text-red-600"></i>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">الصيدلية</h1>
            <p className="text-gray-600">إدارة الأدوية والوصفات الطبية</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          بيانات المخزون والوصفات ستتوفر عند ربط الصيدلية بالمنصة.
        </p>
      </div>

      {/* Empty state for medications */}
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <i className="bx bx-capsule text-5xl text-gray-300 mb-4"></i>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد أدوية مسجّلة بعد</h3>
        <p className="text-gray-500 text-sm">
          ستظهر قائمة الأدوية المتاحة بعد تحديث بيانات الصيدلية.
        </p>
      </div>

      {/* Empty state for prescriptions */}
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <i className="bx bx-receipt text-5xl text-gray-300 mb-4"></i>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد وصفات مسجّلة بعد</h3>
        <p className="text-gray-500 text-sm">
          ستظهر الوصفات الطبية عند إتمام المواعيد وتسجيلها في المنصة.
        </p>
      </div>

      {/* Services */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">الخدمات المتاحة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div key={svc.title} className="bg-white p-6 rounded-lg shadow text-center">
              <i className={`bx ${svc.icon} text-4xl ${svc.color} mb-3`}></i>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{svc.title}</h3>
              <p className="text-gray-600 text-sm">{svc.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PharmacySection
