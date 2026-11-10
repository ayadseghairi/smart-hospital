import { Routes, Route, useLocation } from "react-router-dom"
import { useEffect } from "react"
import "./App.css"

// Existing pages
import Home from "./pages/Home"
import InstitutionPage from "./pages/InstitutionPage"
import DoctorProfile from "./pages/DoctorProfile"
import AppointmentBooking from "./pages/AppointmentBooking"
import SearchResults from "./pages/SearchResults"
import EmergencyPage from "./pages/EmergencyPage"
import NotFound from "./pages/NotFound"

// Auth pages
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import CheckInboxPage from "./pages/CheckInboxPage"
import VerifyEmailPage from "./pages/VerifyEmailPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import AcceptInvitePage from "./pages/AcceptInvitePage"

// Authenticated pages
import MyAppointmentsPage from "./pages/MyAppointmentsPage"
import DoctorDashboardPage from "./pages/DoctorDashboardPage"
import SuperAdminDashboardPage from "./pages/SuperAdminDashboardPage"

// Components
import ProtectedRoute from "./components/ProtectedRoute"
import UnverifiedEmailBanner from "./components/UnverifiedEmailBanner"
import { useAuth } from "./contexts/AuthContext"

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
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/institution/:id" element={<InstitutionPage />} />
        <Route path="/institution/:id/:section" element={<InstitutionPage />} />
        <Route path="/doctor/:id" element={<DoctorProfile />} />

        {/* Auth flows */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/check-inbox" element={<CheckInboxPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/accept-invite" element={<AcceptInvitePage />} />

        {/* Patient — must be logged in (any role) */}
        <Route path="/my-appointments" element={
          <ProtectedRoute roles={["PATIENT"]}>
            <MyAppointmentsPage />
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
