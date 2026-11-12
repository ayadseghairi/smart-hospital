// src/pages/doctor/DoctorAvailabilityPage.jsx
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import Layout from "../../components/Layout"
import { useAuth } from "../../contexts/AuthContext"
import { apiGet, apiPost, apiDelete } from "../../api/client"

// Sunday (0) first, then Mon-Thu, then Fri-Sat — Algerian work week
const WEEKDAY_ORDER = [0, 1, 2, 3, 4, 5, 6]
const SLOT_OPTIONS = [15, 20, 30, 45, 60]

export default function DoctorAvailabilityPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const { user } = useAuth()
  const qc = useQueryClient()

  const [weekday, setWeekday] = useState("0")
  const [fromTime, setFromTime] = useState("08:00")
  const [toTime, setToTime] = useState("16:00")
  const [slotMinutes, setSlotMinutes] = useState("30")
  const [institutionId, setInstitutionId] = useState("")

  // Fetch current rules
  const { data: rules = [], isLoading, error } = useQuery({
    queryKey: ["doctor-availability"],
    queryFn: () => apiGet("/doctor/availability", lang),
    enabled: !!user,
  })

  // Fetch doctor's institutions for the dropdown
  const { data: doctorData } = useQuery({
    queryKey: ["doctor-me"],
    queryFn: () => apiGet("/auth/me", lang),
    enabled: !!user,
  })
  const institutions = doctorData?.doctor?.institutionLinks?.map((l) => l.institution) ?? []

  const addRule = useMutation({
    mutationFn: () => apiPost("/doctor/availability", {
      weekday: parseInt(weekday, 10),
      fromTime,
      toTime,
      slotMinutes: parseInt(slotMinutes, 10),
      institutionId: institutionId || undefined,
    }, lang),
    onSuccess: () => {
      toast.success(t("doctor.availability.saveSuccess"))
      qc.invalidateQueries({ queryKey: ["doctor-availability"] })
    },
    onError: () => toast.error(t("doctor.availability.saveError")),
  })

  const deleteRule = useMutation({
    mutationFn: (id) => apiDelete(`/doctor/availability/${id}`, lang),
    onSuccess: () => {
      toast.success(t("doctor.availability.deleteSuccess"))
      qc.invalidateQueries({ queryKey: ["doctor-availability"] })
    },
    onError: () => toast.error(t("doctor.availability.deleteError")),
  })

  function handleSubmit(e) {
    e.preventDefault()
    if (!fromTime || !toTime || fromTime >= toTime) return
    addRule.mutate()
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("doctor.availability.title")}</h1>

        {/* Current rules */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-3">{t("doctor.availability.rulesTitle")}</h2>

          {isLoading && <p className="text-gray-400 text-sm">{t("common.loading")}</p>}
          {error && <p className="text-red-500 text-sm">{t("common.loadError")}</p>}

          {!isLoading && !error && rules.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <p className="text-gray-500 text-sm">{t("doctor.availability.noRules")}</p>
            </div>
          )}

          {!isLoading && !error && rules.length > 0 && (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div key={rule.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{t(`doctor.availability.weekdays.${rule.weekday}`)}</span>
                    <span className="mx-2 text-gray-400">·</span>
                    <span>{rule.fromTime} – {rule.toTime}</span>
                    <span className="mx-2 text-gray-400">·</span>
                    <span>{rule.slotMinutes} min</span>
                    {rule.institution && (
                      <>
                        <span className="mx-2 text-gray-400">·</span>
                        <span className="text-gray-500">
                          {lang === "ar" ? rule.institution.nameAr : rule.institution.nameFr}
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => deleteRule.mutate(rule.id)}
                    disabled={deleteRule.isPending}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50 text-sm"
                    aria-label="delete"
                  >
                    <Trash2 size={18} aria-hidden />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Add rule form */}
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">{t("doctor.availability.addRule")}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Weekday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("doctor.availability.weekday")}</label>
              <select
                value={weekday}
                onChange={(e) => setWeekday(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {WEEKDAY_ORDER.map((d) => (
                  <option key={d} value={d}>{t(`doctor.availability.weekdays.${d}`)}</option>
                ))}
              </select>
            </div>

            {/* Slot duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("doctor.availability.slotDuration")}</label>
              <select
                value={slotMinutes}
                onChange={(e) => setSlotMinutes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SLOT_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("doctor.availability.from")}</label>
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("doctor.availability.to")}</label>
              <input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                required
                min={fromTime}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Institution */}
            {institutions.length > 0 && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t("doctor.availability.institution")}</label>
                <select
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t("doctor.availability.selectInstitution")}</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {lang === "ar" ? inst.nameAr : inst.nameFr}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={addRule.isPending || !fromTime || !toTime || fromTime >= toTime}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {addRule.isPending ? t("common.loading") : t("doctor.availability.save")}
              </button>
            </div>
          </form>
        </section>

        {/* Time-off notice */}
        <p className="text-xs text-gray-400 text-center">{t("doctor.availability.timeOffNote")}</p>
      </div>
    </Layout>
  )
}
