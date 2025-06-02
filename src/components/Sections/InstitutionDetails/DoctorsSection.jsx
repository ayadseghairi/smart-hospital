"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

const DoctorsSection = () => {
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: "Dr. Ahmed",
      specialty: "Cardiologist",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      name: "Dr. Fatima",
      specialty: "Dermatologist",
      image: "https://via.placeholder.com/150",
    },
    {
      id: 3,
      name: "Dr. Ali",
      specialty: "Pediatrician",
      image: "https://via.placeholder.com/150",
    },
  ])

  const navigate = useNavigate()

  const handleBookAppointment = (doctor) => {
    navigate(`/appointment/book/${doctor.id}`)
  }

  return (
    <div className="container mx-auto py-12">
      <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Our Doctors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={doctor.image || "/placeholder.svg"} alt={doctor.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800">{doctor.name}</h3>
              <p className="text-gray-600">{doctor.specialty}</p>
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
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DoctorsSection
