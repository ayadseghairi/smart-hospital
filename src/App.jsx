import { Suspense, lazy, useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import "./App.css"

// Eagerly loaded — tiny and needed for first paint
import { useAuth } from "./contexts/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import GuestOnly from "./components/GuestOnly"
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

// Patient area
const AccountDashboardPage = lazy(() => import("./pages/account/AccountDashboardPage"))
const AccountProfilePage = lazy(() => import("./pages/account/AccountProfilePage"))
const AddEmailPage = lazy(() => import("./pages/account/AddEmailPage"))
const NotificationsPage = lazy(() => import("./pages/account/NotificationsPage"))
const SecurityPage = lazy(() => import("./pages/account/SecurityPage"))
const MyAppointmentsPage = lazy(() => import("./pages/MyAppointmentsPage"))
const MyAccountPage = lazy(() => import("./pages/MyAccountPage"))

// Doctor area
const DoctorDashboardPage = lazy(() => import("./pages/DoctorDashboardPage"))
const DoctorAppointmentsPage = lazy(() => import("./pages/doctor/DoctorAppointmentsPage"))
const DoctorAvailabilityPage = lazy(() => import("./pages/doctor/DoctorAvailabilityPage"))
const DoctorProfileEditPage = lazy(() => import("./pages/doctor/DoctorProfileEditPage"))
const DoctorSecurityPage = lazy(() => import("./pages/doctor/DoctorSecurityPage"))

const SuperAdminDashboardPage = lazy(() => import("./pages/SuperAdminDashboardPage"))
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"))
const TermsPage = lazy(() => import("./pages/TermsPage"))

// Public pages
const AboutPage = lazy(() => import("./pages/AboutPage"))
const ContactPage = lazy(() => import("./pages/ContactPage"))
const ForInstitutionsPage = lazy(() => import("./pages/ForInstitutionsPage"))
const CookiesPage = lazy(() => import("./pages/CookiesPage"))
const InstitutionsPage = lazy(() => import("./pages/InstitutionsPage"))
const DoctorsPage = lazy(() => import("./pages/DoctorsPage"))

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
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/for-institutions" element={<ForInstitutionsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/institutions" element={<InstitutionsPage />} />
          <Route path="/doctors" element={<DoctorsPage />} />

          {/* Auth flows — guests only */}
          <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
          <Route path="/check-inbox" element={<CheckInboxPage />} />
          <Route path="/register/check-email" element={<CheckInboxPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />

          {/* Patient area */}
          <Route path="/account" element={
            <ProtectedRoute roles={["PATIENT"]}>
              <AccountDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/account/appointments" element={
            <ProtectedRoute roles={["PATIENT"]}>
              <MyAppointmentsPage />
            </ProtectedRoute>
          } />
          <Route path="/account/profile" element={
            <ProtectedRoute roles={["PATIENT"]}>
              <AccountProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/account/add-email" element={
            <ProtectedRoute roles={["PATIENT"]}>
              <AddEmailPage />
            </ProtectedRoute>
          } />
          <Route path="/account/notifications" element={
            <ProtectedRoute roles={["PATIENT"]}>
              <NotificationsPage />
            </ProtectedRoute>
          } />
          <Route path="/account/security" element={
            <ProtectedRoute roles={["PATIENT"]}>
              <SecurityPage />
            </ProtectedRoute>
          } />
          <Route path="/account/privacy" element={
            <ProtectedRoute roles={["PATIENT"]}>
              <MyAccountPage />
            </ProtectedRoute>
          } />

          {/* Legacy patient routes */}
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

          {/* Doctor area */}
          <Route path="/doctor" element={
            <ProtectedRoute roles={["DOCTOR"]}>
              <DoctorDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/doctor/appointments" element={
            <ProtectedRoute roles={["DOCTOR"]}>
              <DoctorAppointmentsPage />
            </ProtectedRoute>
          } />
          <Route path="/doctor/availability" element={
            <ProtectedRoute roles={["DOCTOR"]}>
              <DoctorAvailabilityPage />
            </ProtectedRoute>
          } />
          <Route path="/doctor/profile" element={
            <ProtectedRoute roles={["DOCTOR"]}>
              <DoctorProfileEditPage />
            </ProtectedRoute>
          } />
          <Route path="/doctor/security" element={
            <ProtectedRoute roles={["DOCTOR"]}>
              <DoctorSecurityPage />
            </ProtectedRoute>
          } />
          {/* Legacy doctor routes */}
          <Route path="/doctor-dashboard" element={
            <ProtectedRoute roles={["DOCTOR"]}>
              <DoctorDashboardPage />
            </ProtectedRoute>
          } />

          {/* Institution admin */}
          <Route path="/institution" element={
            <ProtectedRoute roles={["INSTITUTION_ADMIN"]}>
              <MyAccountPage />
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
