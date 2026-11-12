// src/pages/doctor/DoctorProfileEditPage.jsx
import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Camera } from "lucide-react"
import Layout from "../../components/Layout"
import { useAuth } from "../../contexts/AuthContext"
import { apiGet, apiPatch } from "../../api/client"

const LANGUAGES = ["ar", "fr", "tamazight"]

export default function DoctorProfileEditPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const { user } = useAuth()

  const [bioAr, setBioAr] = useState("")
  const [bioFr, setBioFr] = useState("")
  const [languages, setLanguages] = useState([])
  const [consultationFeeDZD, setConsultationFeeDZD] = useState("")

  const { data: me, isLoading, error } = useQuery({
    queryKey: ["doctor-me-profile"],
    queryFn: () => apiGet("/auth/me", lang),
    enabled: !!user,
  })

  useEffect(() => {
    if (me?.doctor) {
      setBioAr(me.doctor.bioAr ?? "")
      setBioFr(me.doctor.bioFr ?? "")
      setLanguages(me.doctor.languages ?? [])
      setConsultationFeeDZD(me.doctor.consultationFeeDZD != null ? String(me.doctor.consultationFeeDZD) : "")
    }
  }, [me])

  const save = useMutation({
    mutationFn: () => apiPatch("/doctor/profile", {
      bioAr: bioAr.trim() || undefined,
      bioFr: bioFr.trim() || undefined,
      languages,
      consultationFeeDZD: consultationFeeDZD !== "" ? parseInt(consultationFeeDZD, 10) : null,
    }, lang),
    onSuccess: () => toast.success(t("doctor.profile.saveSuccess")),
    onError: () => toast.error(t("doctor.profile.saveError")),
  })

  function toggleLanguage(l) {
    setLanguages((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]
    )
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-10 text-center text-gray-400 text-sm">{t("common.loading")}</div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto px-4 py-10 text-center text-red-500 text-sm">{t("common.loadError")}</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("doctor.profile.title")}</h1>

        <form onSubmit={(e) => { e.preventDefault(); save.mutate() }} className="space-y-5">
          {/* Bio Arabic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("doctor.profile.bioAr")}
              <span className="text-gray-400 font-normal ms-1">({t("doctor.profile.bioMaxHint")})</span>
            </label>
            <textarea
              value={bioAr}
              onChange={(e) => setBioAr(e.target.value)}
              maxLength={1000}
              rows={4}
              dir="rtl"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Bio French */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("doctor.profile.bioFr")}
              <span className="text-gray-400 font-normal ms-1">({t("doctor.profile.bioMaxHint")})</span>
            </label>
            <textarea
              value={bioFr}
              onChange={(e) => setBioFr(e.target.value)}
              maxLength={1000}
              rows={4}
              dir="ltr"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Languages */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">{t("doctor.profile.languages")}</p>
            <div className="flex flex-wrap gap-3">
              {LANGUAGES.map((l) => (
                <label key={l} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={languages.includes(l)}
                    onChange={() => toggleLanguage(l)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {t(`doctor.profile.lang${l.charAt(0).toUpperCase() + l.slice(1)}`)}
                </label>
              ))}
            </div>
          </div>

          {/* Consultation fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("doctor.profile.consultationFee")}
            </label>
            <input
              type="number"
              value={consultationFeeDZD}
              onChange={(e) => setConsultationFeeDZD(e.target.value)}
              min={0}
              max={100000}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">{t("doctor.profile.feeOptional")}</p>
          </div>

          {/* Photo upload — coming soon */}
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4 text-center">
            <Camera size={24} className="text-gray-400 mb-1 mx-auto" aria-hidden />
            <p className="text-xs text-gray-400">{t("doctor.profile.photoNote")}</p>
          </div>

          <button
            type="submit"
            disabled={save.isPending}
            className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {save.isPending ? t("common.loading") : t("doctor.profile.save")}
          </button>
        </form>
      </div>
    </Layout>
  )
}
