// src/components/Home/HomeSections.jsx
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Stethoscope, Building2, BookOpen, ScanLine, FlaskConical, Pill,
  Phone, Search, CalendarCheck, BellRing, Handshake,
} from "lucide-react"

const Section = ({ title, subtitle, children, className = "" }) => (
  <section className={`py-12 sm:py-16 ${className}`}>
    <div className="container mx-auto px-4">
      <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-3 text-slate-600">{subtitle}</p>}
      </div>
      {children}
    </div>
  </section>
)

/* ---------- Quick access tiles ---------- */
// NOTE: /services/:category must exist (imaging | lab | pharmacy); see the prompt.
const TILES = [
  { key: "doctors", to: "/doctors", Icon: Stethoscope },
  { key: "institutions", to: "/institutions", Icon: Building2 },
  { key: "specialties", to: "/specialties", Icon: BookOpen },

]

export function QuickAccess() {
  const { t } = useTranslation()
  return (
    <Section title={t("home.quick.title")} className="pt-16 sm:pt-20">
      <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
        {TILES.map(({ key, to, Icon }) => (
          <li key={key}>
            <Link
              to={to}
              className="group flex min-h-[7.5rem] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C5F8A] motion-reduce:transition-none"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2C5F8A]/10 text-[#2C5F8A]">
                <Icon size={26} aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-slate-800 sm:text-base">
                {t(`home.quick.${key}`)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/* ---------- National emergency numbers (from the API, never hard-coded) ---------- */
export function EmergencyStrip() {
  const { t, i18n } = useTranslation()
  const [numbers, setNumbers] = useState(null)
  const fr = i18n.language?.startsWith("fr")

  useEffect(() => {
    const ctrl = new AbortController()
    // swap for your api client if you have one
    fetch("/api/v1/emergency/numbers", { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => setNumbers(Array.isArray(j?.data) ? j.data : []))
      .catch(() => setNumbers([]))
    return () => ctrl.abort()
  }, [])

  return (
    <section className="bg-red-50 py-10 ring-1 ring-inset ring-red-100" aria-labelledby="emergency-title">
      <div className="container mx-auto px-4">
        <h2 id="emergency-title" className="text-center text-xl font-bold text-red-800 sm:text-2xl">
          {t("home.emergency.title")}
        </h2>
        <p className="mt-2 text-center text-red-900/80">{t("home.emergency.note")}</p>

        {numbers && numbers.length > 0 ? (
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {numbers.map((n) => (
              <li key={`${n.number}-${n.labelFr}`}>
                <a
                  href={`tel:${n.number}`}
                  className="flex min-h-[4.5rem] flex-col items-center justify-center rounded-2xl bg-white px-3 py-3 text-center shadow-sm ring-1 ring-red-200 hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
                >
                  <span className="inline-flex items-center gap-2 text-2xl font-extrabold text-red-700">
                    <Phone size={20} aria-hidden="true" />
                    <bdi dir="ltr">{n.number}</bdi>
                  </span>
                  <span className="mt-1 text-sm text-slate-700">{fr ? n.labelFr : n.labelAr}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-6 text-center">
          <Link to="/emergency" className="font-semibold text-red-800 underline underline-offset-4">
            {t("home.emergency.nearby")}
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ---------- How it works (3 honest steps) ---------- */
const STEPS = [
  { key: "search", Icon: Search },
  { key: "request", Icon: CalendarCheck },
  { key: "confirm", Icon: BellRing },
]

export function HowItWorks() {
  const { t } = useTranslation()
  return (
    <Section title={t("home.how.title")} className="bg-white">
      <ol className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
        {STEPS.map(({ key, Icon }, i) => (
          <li key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#2C5F8A] text-white">
              <Icon size={24} aria-hidden="true" />
            </span>
            <h3 className="text-lg font-semibold text-slate-900">
              <span className="text-[#2C5F8A]">{i + 1}.</span> {t(`home.how.${key}.title`)}
            </h3>
            <p className="mt-2 text-slate-600">{t(`home.how.${key}.text`)}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

/* ---------- Assistant intro (wraps your existing <SmartAssistant />) ---------- */
export function AssistantSection({ children }) {
  const { t } = useTranslation()
  return (
    <Section title={t("home.assistant.title")} subtitle={t("home.assistant.text")}>
      <div className="mx-auto max-w-2xl">{children}</div>
    </Section>
  )
}

/* ---------- Partner call to action ---------- */
export function PartnerCta() {
  const { t } = useTranslation()
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-5 rounded-3xl bg-[#2C5F8A] px-6 py-10 text-center text-white sm:px-10 md:flex-row md:text-start">
          <Handshake size={44} aria-hidden="true" className="shrink-0" />
          <div className="flex-1">
            <h2 className="text-xl font-bold sm:text-2xl">{t("home.partner.title")}</h2>
            <p className="mt-2 text-white/90">{t("home.partner.text")}</p>
          </div>
          <Link
            to="/for-institutions"
            className="inline-flex min-h-[48px] items-center rounded-xl bg-white px-6 font-semibold text-[#1d4468] hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {t("home.partner.cta")}
          </Link>
        </div>
      </div>
    </section>
  )
}