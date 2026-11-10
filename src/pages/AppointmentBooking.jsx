// pages/AppointmentBooking.jsx

import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

const AppointmentBooking = () => {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()
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
  const [bookingSubmitted, setBookingSubmitted] = useState(false)

  // Phase 5: replace with real API call: GET /doctors/:doctorId
  const doctor = null
  const loading = false

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
    if (step < 4) setStep(step + 1)
  }

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleConfirmBooking = () => {
    // Phase 5: POST /appointments
    setBookingSubmitted(true)
    navigate(`/doctor/${doctorId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <i className="bx bx-loader-alt animate-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600">{t("appointment.loading")}</p>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <i className="bx bx-error text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("appointment.doctorNotFound")}</h2>
          <p className="text-gray-500 mb-4">{t("appointment.doctorNotFoundDesc")}</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            {t("nav.backHome")}
          </Link>
        </div>
      </div>
    )
  }

  const appointmentTypeKeys = ["consultation", "followup", "checkup"]

  const renderStep = () => {
    switch (step) {
      case 1: {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t("appointment.chooseType")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appointmentTypeKeys.map((typeKey) => (
                <div
                  key={typeKey}
                  onClick={() => handleInputChange("appointmentType", typeKey)}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-colors ${
                    bookingData.appointmentType === typeKey
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{t(`appointment.types.${typeKey}`)}</h3>
                </div>
              ))}
            </div>
          </div>
        )
      }

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t("appointment.chooseDateTime")}</h2>
            <p className="text-gray-500 text-center py-8">
              <i className="bx bx-calendar text-4xl mb-2 text-gray-300"></i>
              <br />
              {t("appointment.noSlotsHint")}
            </p>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t("appointment.patientInfo")}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("appointment.fullName")}</label>
                <input
                  type="text"
                  value={bookingData.patientInfo.name}
                  onChange={(e) => handleInputChange("patientInfo.name", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("appointment.fullNamePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("appointment.phone")}</label>
                <input
                  type="tel"
                  value={bookingData.patientInfo.phone}
                  onChange={(e) => handleInputChange("patientInfo.phone", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("appointment.phonePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("appointment.email")}</label>
                <input
                  type="email"
                  value={bookingData.patientInfo.email}
                  onChange={(e) => handleInputChange("patientInfo.email", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("appointment.emailPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("appointment.age")}</label>
                <input
                  type="number"
                  value={bookingData.patientInfo.age}
                  onChange={(e) => handleInputChange("patientInfo.age", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t("appointment.agePlaceholder")}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("appointment.gender")}</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="male"
                      checked={bookingData.patientInfo.gender === "male"}
                      onChange={(e) => handleInputChange("patientInfo.gender", e.target.value)}
                    />
                    {t("appointment.male")}
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="female"
                      checked={bookingData.patientInfo.gender === "female"}
                      onChange={(e) => handleInputChange("patientInfo.gender", e.target.value)}
                    />
                    {t("appointment.female")}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t("appointment.reason")}</label>
              <textarea
                value={bookingData.symptoms}
                onChange={(e) => handleInputChange("symptoms", e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t("appointment.reasonPlaceholder")}
              />
            </div>
          </div>
        )

      case 4: {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t("appointment.confirmTitle")}</h2>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{t("appointment.summary")}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("appointment.appointmentType")}</span>
                  <span className="font-medium">{t(`appointment.types.${bookingData.appointmentType}`)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("appointment.nameLabel")}</span>
                  <span className="font-medium">{bookingData.patientInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("appointment.phoneLabel")}</span>
                  <span className="font-medium">{bookingData.patientInfo.phone}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <i className="bx bx-info-circle text-blue-500 text-xl mt-1"></i>
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">{t("appointment.notice")}</p>
                  <p>{t("appointment.noticeText")}</p>
                </div>
              </div>
            </div>
          </div>
        )
      }

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to={`/doctor/${doctorId}`}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <i className="bx bx-arrow-back text-xl"></i>
              <span>{t("nav.backToDoctorProfile")}</span>
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">{t("appointment.title")}</h1>
            </div>
            <div></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {bookingSubmitted ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <i className="bx bx-check-circle text-6xl text-green-500 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{t("appointment.submitted")}</h2>
            <p className="text-gray-600 mb-6">{t("appointment.submittedDesc")}</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("nav.backHome")}
            </Link>
          </div>
        ) : (
          <>
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
                <span>{t("appointment.steps.type")}</span>
                <span>{t("appointment.steps.datetime")}</span>
                <span>{t("appointment.steps.info")}</span>
                <span>{t("appointment.steps.confirm")}</span>
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
                  {t("appointment.prev")}
                </button>

                {step < 4 ? (
                  <button
                    onClick={handleNextStep}
                    disabled={
                      step === 3 &&
                      (!bookingData.patientInfo.name ||
                        !bookingData.patientInfo.phone ||
                        !bookingData.patientInfo.age ||
                        !bookingData.patientInfo.gender)
                    }
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("appointment.next")}
                  </button>
                ) : (
                  <button
                    onClick={handleConfirmBooking}
                    className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    {t("appointment.confirm")}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AppointmentBooking
