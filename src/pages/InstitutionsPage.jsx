// src/pages/InstitutionsPage.jsx
import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { Plus, Building2 } from "lucide-react"
import { apiGet } from "../api/client"
import Layout from "../components/Layout"

function InstitutionCard({ institution, lang }) {
  const { t } = useTranslation()
  const name = lang === "fr" ? institution.nameFr : institution.nameAr
  const commune = lang === "fr"
    ? institution.commune?.nameFr
    : institution.commune?.nameAr

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-gray-800 leading-snug">{name}</h3>
          {commune && <p className="text-sm text-gray-500 mt-0.5">{commune}</p>}
        </div>
        {institution.hasEmergency24h && (
          <span className="shrink-0 inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            <Plus size={12} aria-hidden />
            {t("institutions.emergency24h")}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
          {t(`institutions.types.${institution.type}`, institution.type)}
        </span>
        <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">
          {institution.sector === "PUBLIC" ? t("institution.public") : t("institution.private")}
        </span>
      </div>
      <Link
        to={`/institution/${institution.id}`}
        className="mt-auto text-sm text-blue-600 hover:underline font-medium"
      >
        {t("institutions.viewPage")} →
      </Link>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-gray-100 rounded w-1/2 mb-4"></div>
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-gray-100 rounded w-16"></div>
        <div className="h-5 bg-gray-100 rounded w-12"></div>
      </div>
      <div className="h-3 bg-blue-100 rounded w-24"></div>
    </div>
  )
}

export default function InstitutionsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"

  const [q, setQ] = useState("")
  const [sector, setSector] = useState("")
  const [emergency, setEmergency] = useState(false)

  const params = new URLSearchParams()
  if (q.trim()) params.set("q", q.trim())
  if (sector) params.set("sector", sector)
  if (emergency) params.set("emergency24h", "true")

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["institutions-list", q, sector, emergency],
    queryFn: () => apiGet(`/institutions?${params.toString()}`, lang),
    staleTime: 60_000,
  })

  const institutions = data?.institutions ?? data ?? []

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("institutions.listTitle")}</h1>
        <p className="text-gray-500 mb-8">{t("institutions.listSubtitle")}</p>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-8 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label htmlFor="q" className="block text-xs font-medium text-gray-600 mb-1">{t("institutions.filterSearch")}</label>
            <input
              id="q"
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("institutions.filterSearchPlaceholder")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="sector" className="block text-xs font-medium text-gray-600 mb-1">{t("institutions.filterSector")}</label>
            <select
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white focus:border-transparent"
            >
              <option value="">{t("institutions.types.all")}</option>
              <option value="PUBLIC">{t("institution.public")}</option>
              <option value="PRIVATE">{t("institution.private")}</option>
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none pb-2">
            <input
              type="checkbox"
              checked={emergency}
              onChange={(e) => setEmergency(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">{t("institutions.filterEmergency")}</span>
          </label>
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

        {!isLoading && !isError && institutions.length === 0 && (
          <div className="text-center py-16">
            <Building2 size={48} className="text-gray-300 mb-4 mx-auto" aria-hidden />
            <p className="text-gray-500 font-medium">{t("institutions.emptyList")}</p>
          </div>
        )}

        {!isLoading && !isError && institutions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {institutions.map((inst) => (
              <InstitutionCard key={inst.id} institution={inst} lang={lang} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
