// components/Sections/InstitutionDetails/DoctorsSection.jsx

import { useNavigate, Link } from "react-router-dom"
import Avatar from "../../common/Avatar"

const DoctorsSection = () => {
  // No mock data. Doctors load from the real API (Phase 5).
  const doctors = []

  const navigate = useNavigate()

  const handleBookAppointment = (doctor) => {
    navigate(`/appointment/book/${doctor.id}`)
  }

  return (
    <div className="container mx-auto py-12">
      <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">الأطباء</h2>
      {doctors.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <i className="bx bx-user-plus text-6xl mb-4 text-gray-300"></i>
          <p className="text-lg">لا يوجد أطباء مسجلون في هذه المؤسسة بعد.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="flex items-center justify-center pt-6">
                <Avatar name={doctor.fullName} size="xl" />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{doctor.fullName}</h3>
                {doctor.specialty && (
                  <p className="text-gray-600">{doctor.specialty.nameAr}</p>
                )}
              </div>
              <div className="px-4 py-2 flex justify-between">
                <Link
                  to={`/doctor/${doctor.id}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-center"
                >
                  عرض الملف
                </Link>
                <button
                  onClick={() => handleBookAppointment(doctor)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  حجز موعد
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DoctorsSection
