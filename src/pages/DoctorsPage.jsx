// src/pages/DoctorsPage.jsx
import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { apiGet } from "../api/client"
import Layout from "../components/Layout"

function initials(name) {
  if (!name) return "?"
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
}

function DoctorCard({ doctor, lang }) {
  const { t } = useTranslation()
  const name = doctor.user?.fullName ?? t("common.unknown")
  const specialty = lang === "fr"
    ? doctor.specialty?.nameFr
    : doctor.specialty?.nameAr

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
          {initials(name)}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{name}</h3>
          {specialty && <p className="text-sm text-blue-600">{specialty}</p>}
        </div>
      </div>
      {doctor.consultationFeeDZD != null && (
        <p className="text-sm text-gray-600">
          {t("doctors.fee")}: <span className="font-medium">{doctor.consultationFeeDZD} {t("common.currency")}</span>
        </p>
      )}
      <Link
        to={`/doctor/${doctor.id}`}
        className="mt-auto text-sm text-blue-600 hover:underline font-medium"
      >
        {t("doctors.viewProfile")} →
      </Link>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div className="h-3 bg-blue-100 rounded w-1/2"></div>
        </div>
      </div>
      <div className="h-3 bg-blue-100 rounded w-24"></div>
    </div>
  )
}

export default function DoctorsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"

  const [q, setQ] = useState("")
  const [specialty, setSpecialty] = useState("")

  const { data: specialtiesData } = useQuery({
    queryKey: ["specialties"],
    queryFn: () => apiGet("/search?type=specialties&q=", lang),
    staleTime: 5 * 60_000,
  })
  const specialties = specialtiesData?.specialties ?? specialtiesData ?? []

  const params = new URLSearchParams()
  if (q.trim()) params.set("q", q.trim())
  if (specialty) params.set("specialty", specialty)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["doctors-list", q, specialty],
    queryFn: () => apiGet(`/doctors?${params.toString()}`, lang),
    staleTime: 60_000,
  })

  const doctors = data?.doctors ?? data ?? []

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("doctors.listTitle")}</h1>
        <p className="text-gray-500 mb-8">{t("doctors.listSubtitle")}</p>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-8 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label htmlFor="dq" className="block text-xs font-medium text-gray-600 mb-1">{t("doctors.filterSearch")}</label>
            <input
              id="dq"
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("doctors.filterSearchPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="specialty" className="block text-xs font-medium text-gray-600 mb-1">{t("doctors.filterSpecialty")}</label>
            <select
              id="specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white focus:border-transparent"
            >
              <option value="">{t("doctors.allSpecialties")}</option>
              {specialties.map((s) => (
                <option key={s.id ?? s.slug} value={s.slug ?? s.id}>
                  {lang === "fr" ? s.nameFr : s.nameAr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {isError && (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">{t("common.loadError")}</p>
            <button
              onClick={() => refetch()}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm"
            >
              {t("common.retry")}
            </button>
          </div>
        )}

        {!isLoading && !isError && doctors.length === 0 && (
          <div className="text-center py-16">
            <i className="bx bx-user-circle text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 font-medium">{t("doctors.emptyList")}</p>
          </div>
        )}

        {!isLoading && !isError && doctors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doc) => (
              <DoctorCard key={doc.id} doctor={doc} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
