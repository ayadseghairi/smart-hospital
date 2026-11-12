// pages/AppointmentBooking.jsx
import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react"
import { apiGet, apiPost } from "../api/client"
import { useAuth } from "../contexts/AuthContext"
import Avatar from "../components/common/Avatar"

const AppointmentBooking = () => {
  const { doctorId } = useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const isRtl = lang === "ar"
  const BackIcon = isRtl ? ArrowRight : ArrowLeft
  const { user } = useAuth()

  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlot, setSelectedSlot] = useState("")
  const [reason, setReason] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const { data: doctor, isLoading: doctorLoading, error: doctorError } = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => apiGet(`/doctors/${doctorId}`, lang),
  })

  const { data: slots = [], isLoading: slotsLoading, refetch: refetchSlots } = useQuery({
    queryKey: ["doctor-slots", doctorId, selectedDate],
    queryFn: () => apiGet(`/doctors/${doctorId}/slots?date=${selectedDate}`, lang),
    enabled: !!selectedDate,
  })

  const bookMutation = useMutation({
    mutationFn: () => apiPost("/appointments", {
      doctorId,
      institutionId: doctor?.institutionLinks?.[0]?.institution?.id,
      startsAt: selectedSlot,
      reason: reason || undefined,
    }, lang),
    onSuccess: () => {
      setSubmitted(true)
    },
    onError: (err) => {
      if (err.status === 409) {
        toast.error(t("appointment.slotTaken"))
        refetchSlots()
      } else if (err.status === 403) {
        toast.error(t("appointment.emailRequired"))
      } else {
        toast.error(t("appointment.bookError"))
      }
    },
  })

  const formatSlot = (iso) =>
    new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : "fr-DZ", {
      hour: "2-digit", minute: "2-digit", timeZone: "Africa/Algiers",
    }).format(new Date(iso))

  // Must have verified email to book
  const canBook = user?.emailVerifiedAt

  if (doctorLoading) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-blue-600" aria-hidden />
      </div>
    )
  }

  if (doctorError || !doctor) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center px-4">
          <AlertCircle size={64} className="text-gray-400 mb-4 mx-auto" aria-hidden />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">{t("appointment.doctorNotFound")}</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-800">{t("nav.backHome")}</Link>
        </div>
      </div>
    )
  }

  const specialty = lang === "ar" ? doctor.specialty?.nameAr : doctor.specialty?.nameFr

  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-2">
          <Link to={`/doctor/${doctorId}`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 min-h-[44px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded shrink-0">
            <BackIcon size={20} aria-hidden />
            <span className="text-sm sm:text-base">{t("nav.backToDoctorProfile")}</span>
          </Link>
          <h1 className="text-base sm:text-xl font-bold text-gray-800 text-center min-w-0 truncate">{t("appointment.title")}</h1>
          <div aria-hidden className="w-10 shrink-0" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {submitted ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <CheckCircle2 size={64} className="text-green-500 mb-4 mx-auto" aria-hidden />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">{t("appointment.submitted")}</h2>
            <p className="text-gray-600 mb-6">{t("appointment.submittedDesc")}</p>
            <div className="flex gap-3 justify-center">
              <Link to="/my-appointments" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                {t("nav.myAppointments")}
              </Link>
              <Link to="/" className="border border-gray-300 text-gray-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                {t("nav.backHome")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Doctor summary */}
            <div className="bg-white rounded-xl shadow-lg p-5 flex items-center gap-4">
              <Avatar name={doctor.user?.fullName ?? "?"} size="lg" />
              <div>
                <p className="font-semibold text-gray-800">{doctor.user?.fullName}</p>
                {specialty && <p className="text-blue-600 text-sm">{specialty}</p>}
              </div>
            </div>

            {/* Unverified email warning */}
            {!canBook && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-amber-600 mt-0.5 shrink-0" aria-hidden />
                  <div>
                    <p className="font-semibold text-amber-800">{t("appointment.emailRequired")}</p>
                    <p className="text-sm text-amber-700 mt-1">{t("appointment.emailRequiredHint")}</p>
                  </div>
                </div>
              </div>
            )}

            {canBook && (
              <>
                {/* Date picker */}
                <div className="bg-white rounded-xl shadow-lg p-5">
                  <h3 className="font-semibold text-gray-800 mb-3">{t("appointment.chooseDate")}</h3>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot("") }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    dir="ltr"
                  />
                </div>

                {/* Slots */}
                {selectedDate && (
                  <div className="bg-white rounded-xl shadow-lg p-5">
                    <h3 className="font-semibold text-gray-800 mb-3">{t("appointment.chooseSlot")}</h3>
                    {slotsLoading ? (
                      <p className="text-gray-500 text-sm">{t("common.loading")}</p>
                    ) : slots.length === 0 ? (
                      <p className="text-gray-500 text-sm">{t("appointment.noSlots")}</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-3 rounded-lg text-sm border transition-colors ${
                              selectedSlot === slot
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                            dir="ltr"
                          >
                            {formatSlot(slot)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reason (optional) */}
                {selectedSlot && (
                  <div className="bg-white rounded-xl shadow-lg p-5">
                    <h3 className="font-semibold text-gray-800 mb-3">{t("appointment.reason")} ({t("common.optional")})</h3>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                      maxLength={200}
                      placeholder={t("appointment.reasonPlaceholder")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />

                    {/* Notice: manual approval */}
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                      <Info size={16} className="text-blue-500 shrink-0 mt-0.5" aria-hidden />
                      <p className="text-sm text-blue-800">{t("appointment.noticeText")}</p>
                    </div>

                    <button
                      onClick={() => bookMutation.mutate()}
                      disabled={bookMutation.isPending}
                      className="mt-4 w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                    >
                      {bookMutation.isPending ? t("common.loading") : t("appointment.confirmBooking")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentBooking
