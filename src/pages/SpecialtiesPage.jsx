import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import Layout from "../components/Layout"
import { apiGet } from "../api/client"

export default function SpecialtiesPage() {
  const { i18n } = useTranslation()
  const lang = i18n.language
  const title = lang === "ar" ? "التخصصات الطبية" : "Spécialités médicales"
  const subtitle = lang === "ar"
    ? "اختر تخصصاً للعثور على الأطباء المتخصصين في ولاية خنشلة"
    : "Choisissez une spécialité pour trouver les médecins correspondants dans la wilaya de Khenchela"
  const emptyMsg = lang === "ar" ? "لا توجد تخصصات بعد." : "Aucune spécialité pour l'instant."

  const { data: specialties = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["specialties"],
    queryFn: () => apiGet("/search?q=&type=specialties&limit=100", lang),
    select: (data) => data?.specialties ?? data ?? [],
  })

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">{title}</h1>
          <p className="text-gray-500">{subtitle}</p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center">
            <button onClick={() => refetch()} className="text-blue-600 hover:underline text-sm">
              {lang === "ar" ? "إعادة المحاولة" : "Réessayer"}
            </button>
          </div>
        )}

        {!isLoading && specialties.length === 0 && (
          <p className="text-center text-gray-400 py-12">{emptyMsg}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {specialties.map((s) => (
            <Link
              key={s.id}
              to={`/doctors?specialty=${s.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <p className="font-semibold text-gray-800">{lang === "ar" ? s.nameAr : s.nameFr}</p>
              <p className="text-sm text-gray-400 mt-1">{lang === "ar" ? s.nameFr : s.nameAr}</p>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
}
