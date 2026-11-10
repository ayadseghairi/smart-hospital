import { Suspense, lazy, useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import "./App.css"

// Eagerly loaded — tiny and needed for first paint
import { useAuth } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import UnverifiedEmailBanner from "./components/UnverifiedEmailBanner"

// Route-level code splitting
const Home = lazy(() => import("./pages/Home"))
const InstitutionPage = lazy(() => import("./pages/InstitutionPage"))
const DoctorProfile = lazy(() => import("./pages/DoctorProfile"))
const AppointmentBooking = lazy(() => import("./pages/AppointmentBooking"))
const SearchResults = lazy(() => import("./pages/SearchResults"))
const EmergencyPage = lazy(() => import("./pages/EmergencyPage"))
const NotFound = lazy(() => import("./pages/NotFound"))

const LoginPage = lazy(() => import("./pages/LoginPage"))
const RegisterPage = lazy(() => import("./pages/RegisterPage"))
const CheckInboxPage = lazy(() => import("./pages/CheckInboxPage"))
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"))
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"))
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"))
const AcceptInvitePage = lazy(() => import("./pages/AcceptInvitePage"))

const MyAppointmentsPage = lazy(() => import("./pages/MyAppointmentsPage"))
const MyAccountPage = lazy(() => import("./pages/MyAccountPage"))
const DoctorDashboardPage = lazy(() => import("./pages/DoctorDashboardPage"))
const SuperAdminDashboardPage = lazy(() => import("./pages/SuperAdminDashboardPage"))
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"))
const TermsPage = lazy(() => import("./pages/TermsPage"))

function AppRoutes() {
  const { loadSession } = useAuth()
  useLocation() // keep router context active without using the value

  // Restore session on first render (checks the refresh cookie)
  useEffect(() => {
    loadSession()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <UnverifiedEmailBanner />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><span className="text-gray-400 text-sm animate-pulse">…</span></div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/institution/:id" element={<InstitutionPage />} />
          <Route path="/institution/:id/:section" element={<InstitutionPage />} />
          <Route path="/doctor/:id" element={<DoctorProfile />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Auth flows */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/check-inbox" element={<CheckInboxPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />

          {/* Patient — must be logged in */}
          <Route path="/my-appointments" element={
            <ProtectedRoute roles={["PATIENT"]}>
              <MyAppointmentsPage />
            </ProtectedRoute>
          } />
          <Route path="/my-account" element={
            <ProtectedRoute roles={["PATIENT", "DOCTOR", "INSTITUTION_ADMIN", "SUPER_ADMIN"]}>
              <MyAccountPage />
            </ProtectedRoute>
          } />
          <Route path="/appointment/book/:doctorId" element={
            <ProtectedRoute roles={["PATIENT"]}>
              <AppointmentBooking />
            </ProtectedRoute>
          } />

          {/* Doctor dashboard */}
          <Route path="/doctor-dashboard" element={
            <ProtectedRoute roles={["DOCTOR"]}>
              <DoctorDashboardPage />
            </ProtectedRoute>
          } />

          {/* Super admin dashboard */}
          <Route path="/admin" element={
            <ProtectedRoute roles={["SUPER_ADMIN"]}>
              <SuperAdminDashboardPage />
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  )
}

function App() {
  return (
    <div className="App">
      <AppRoutes />
    </div>
  )
}

export default App
