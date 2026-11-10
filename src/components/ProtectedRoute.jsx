// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useTranslation } from "react-i18next"

/**
 * Wraps a route that requires authentication.
 * @param {string[]} roles — optional allowed roles; empty = any authenticated user
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loaded } = useAuth()
  const location = useLocation()
  const { t } = useTranslation()

  if (!loaded) {
    // Session not yet checked — show a minimal spinner
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">{t("common.loading")}</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />
  }

  return children
}
