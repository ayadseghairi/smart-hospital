// src/components/GuestOnly.jsx
import { Navigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../contexts/AuthContext"

const ROLE_HOME = {
  PATIENT: "/account",
  DOCTOR: "/doctor",
  INSTITUTION_ADMIN: "/institution",
  SUPER_ADMIN: "/admin",
}

/**
 * Wraps guest-only routes (login, register).
 * Authenticated users are redirected to their role home.
 */
export default function GuestOnly({ children }) {
  const { user, loaded } = useAuth()
  const { t } = useTranslation()

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 animate-pulse text-sm">{t("common.loading")}</div>
      </div>
    )
  }

  if (user) {
    return <Navigate to={ROLE_HOME[user.role] ?? "/"} replace />
  }

  return children
}
