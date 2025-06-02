"use client"

import { Routes, Route } from "react-router-dom"
import "./App.css"
import Home from "./pages/Home"
import InstitutionPage from "./pages/InstitutionPage"
import DoctorProfile from "./pages/DoctorProfile"
import AppointmentBooking from "./pages/AppointmentBooking"
import SearchResults from "./pages/SearchResults"
import EmergencyPage from "./pages/EmergencyPage"
import NotFound from "./pages/NotFound"

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Main Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/emergency" element={<EmergencyPage />} />

        {/* Institution Routes */}
        <Route path="/institution/:id" element={<InstitutionPage />} />
        <Route path="/institution/:id/:section" element={<InstitutionPage />} />

        {/* Doctor Routes */}
        <Route path="/doctor/:id" element={<DoctorProfile />} />
        <Route path="/appointment/book/:doctorId" element={<AppointmentBooking />} />

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
