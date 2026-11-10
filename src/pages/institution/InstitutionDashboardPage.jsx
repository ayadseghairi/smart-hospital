import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import Layout from "../../components/Layout"
import { apiGet } from "../../api/client"

export default function InstitutionDashboardPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const { data: stats, isLoading, isError, refetch } = useQuery({
    queryKey: ["institution-stats"],
    queryFn: () => apiGet("/institution/mine/stats", lang),
  })

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{t("instAdmin.dashboard.title")}</h1>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: t("instAdmin.dashboard.editProfile"), to: "/institution/profile" },
            { label: t("instAdmin.dashboard.manageServices"), to: "/institution/services" },
            { label: t("instAdmin.dashboard.appointments"), to: "/institution/appointments" },
            { label: t("instAdmin.dashboard.doctors"), to: "/institution/doctors" },
          ].map(({ label, to }) => (
            <Link key={to} to={to}
              className="block bg-white border border-gray-200 rounded-xl p-4 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">
              {label}
            </Link>
          ))}
        </div>

        {/* Stats */}
        {isLoading && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-40" />
        )}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 text-sm mb-3">{t("common.error")}</p>
            <button onClick={() => refetch()} className="text-blue-600 text-sm hover:underline">{t("common.retry")}</button>
          </div>
        )}
        {stats && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{t("instAdmin.dashboard.stats")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(stats.appointmentsByStatus ?? []).map(({ status, count }) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{count}</div>
                  <div className="text-sm text-gray-500">{t(`appointments.status.${status.toLowerCase()}`)}</div>
                </div>
              ))}
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalServices ?? 0}</div>
                <div className="text-sm text-gray-500">{t("instAdmin.dashboard.activeServices")}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
