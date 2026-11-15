// src/pages/Home.jsx  (replaces the old file; delete ./Home.css and its import)
import { useEffect, useState } from "react"
import Layout from "../components/Layout"
import InstallBanner from "../components/InstallApp/InstallBanner"
import SmartAssistant from "../components/Sections/SmartAssistant"
import HeroSection from "../components/Home/HeroSection"
import {
  QuickAccess, EmergencyStrip, HowItWorks, AssistantSection, PartnerCta,
} from "../components/Home/HomeSections"

// Real counts only. GET /api/v1/public/summary -> { data: { institutions, doctors, specialties } }
// If the endpoint fails or returns zeros, nothing is shown (no fake numbers).
function usePublicSummary() {
  const [summary, setSummary] = useState(null)
  useEffect(() => {
    const ctrl = new AbortController()
    fetch("/api/v1/public/summary", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setSummary(j?.data ?? null))
      .catch(() => setSummary(null))
    return () => ctrl.abort()
  }, [])
  return summary
}

export default function Home() {
  const summary = usePublicSummary()

  return (
    <Layout>
      <HeroSection summary={summary} />

      {/* Slim, dismissible; InstallBanner renders nothing when installed or not installable */}
      <div className="container mx-auto mt-6 px-4 empty:hidden">
        <InstallBanner />
      </div>

      <div className="bg-slate-50">
        <QuickAccess />
        <EmergencyStrip />
        <HowItWorks />
        <AssistantSection>
          <SmartAssistant />
        </AssistantSection>
        <PartnerCta />
      </div>
    </Layout>
  )
}