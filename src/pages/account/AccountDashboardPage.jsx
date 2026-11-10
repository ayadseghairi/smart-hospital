// src/pages/account/AccountDashboardPage.jsx
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import Layout from "../../components/Layout"
import { useAuth } from "../../contexts/AuthContext"
import { apiGet } from "../../api/client"

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/4" />
    </div>
  )
}

export default function AccountDashboardPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"
  const { user } = useAuth()

  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ["upcoming-appointments"],
    queryFn: () => apiGet("/appointments/mine?status=CONFIRMED&limit=3", lang),
    enabled: !!user,
  })

  const formatDate = (iso) =>
    new Intl.DateTimeFormat(lang === "ar" ? "ar-DZ" : "fr-DZ", {
      dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Algiers",
    }).format(new Date(iso))

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{t("account.dashboard.title")}</h1>
        {user && (
          <p className="text-gray-500 text-sm mb-6">
            {user.fullName}
            {user.email && <span className="mx-2">·</span>}
            {user.email && <span>{user.email}</span>}
          </p>
        )}

        {/* Unverified-email warning */}
        {user && !user.emailVerifiedAt && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <i className="bx bx-error text-amber-500 text-lg mt-0.5" />
            <div>
              <p className="text-sm text-amber-800">{t("account.dashboard.unverifiedEmail")}</p>
              <Link to="/account/add-email" className="text-sm text-amber-700 underline mt-1 inline-block">
                {t("account.dashboard.addEmail")}
              </Link>
            </div>
          </div>
        )}

        {/* Upcoming appointments */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-3">{t("account.dashboard.upcomingTitle")}</h2>

          {isLoading && (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm">{t("common.loadError")}</p>
          )}

          {!isLoading && !error && appointments.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <i className="bx bx-calendar text-4xl text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">{t("account.dashboard.noUpcoming")}</p>
            </div>
          )}

          {!isLoading && !error && appointments.length > 0 && (
            <div className="space-y-3">
              {appointments.map((appt) => (
                <div key={appt.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    {appt.doctor && (
                      <p className="font-medium text-gray-800">{appt.doctor.user.fullName}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {lang === "ar" ? appt.institution?.nameAr : appt.institution?.nameFr}
                    </p>
                    <p className="text-sm text-gray-600">{formatDate(appt.startsAt)}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                    {t("appointments.status.confirmed")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link to="/account/appointments" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all text-center">
              <i className="bx bx-calendar text-2xl text-blue-600 mb-2 block" />
              <p className="text-sm font-medium text-gray-700">{t("account.dashboard.viewAllAppointments")}</p>
            </Link>
            <Link to="/account/profile" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all text-center">
              <i className="bx bx-user text-2xl text-blue-600 mb-2 block" />
              <p className="text-sm font-medium text-gray-700">{t("account.dashboard.editProfile")}</p>
            </Link>
            <Link to="/account/security" className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition-all text-center">
              <i className="bx bx-shield text-2xl text-blue-600 mb-2 block" />
              <p className="text-sm font-medium text-gray-700">{t("account.dashboard.accountSettings")}</p>
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  )
}
