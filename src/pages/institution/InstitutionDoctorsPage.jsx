import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import Layout from "../../components/Layout"
import Avatar from "../../components/common/Avatar"
import { apiGet } from "../../api/client"

export default function InstitutionDoctorsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  // First get the institution
  const { data: institution } = useQuery({
    queryKey: ["institution-mine"],
    queryFn: () => apiGet("/institution/mine", lang),
  })

  // Then get its doctors
  const { data: doctors = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["institution-mine-doctors", institution?.id],
    queryFn: () => apiGet(`/institutions/${institution?.id}/doctors`, lang),
    enabled: !!institution?.id,
  })

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t("instAdmin.doctors.title")}</h1>
        <p className="text-gray-500 text-sm mb-6">{t("instAdmin.doctors.hint")}</p>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
          {t("instAdmin.doctors.addHint")}
          {" "}<Link to="/contact" className="underline">{t("nav.contact")}</Link>
        </div>

        {isLoading && <div className="animate-pulse h-20 bg-gray-100 rounded-xl" />}
        {isError && <div className="text-center"><button onClick={() => refetch()} className="text-blue-600 text-sm">{t("common.retry")}</button></div>}
        {!isLoading && doctors.length === 0 && <p className="text-center text-gray-400 py-8">{t("instAdmin.doctors.empty")}</p>}

        <div className="space-y-3">
          {doctors.map(d => (
            <div key={d.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <Avatar name={d.user?.fullName ?? "?"} size="sm" />
              <div>
                <p className="font-medium text-gray-800">{d.user?.fullName}</p>
                <p className="text-sm text-gray-500">{lang === "ar" ? d.specialty?.nameAr : d.specialty?.nameFr}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
