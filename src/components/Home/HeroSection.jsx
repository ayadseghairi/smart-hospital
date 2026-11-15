// src/components/Home/HeroSection.jsx
// Full-bleed hospital hero + overlapping search card.
// Images are produced by scripts/make-hero-images.mjs into /public/images/hero/.
// Requires Tailwind >= 3.3 (logical utilities: ps-*, pe-*, start-*, text-start).
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { Search, Siren } from "lucide-react"

const BASE = "/images/hero"
const WIDE = [768, 1280, 1920, 2560] // landscape crops (16:9)
const TALL = [480, 768, 1080] //        portrait crops for phones (4:5)

const srcSet = (name, widths, ext) =>
  widths.map((w) => `${BASE}/${name}-${w}.${ext} ${w}w`).join(", ")

export default function HeroSection({ summary }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  // 0 = optimized responsive set, 1 = plain /home.jpg, 2 = brand color only
  const [stage, setStage] = useState(0)

  const onSubmit = (e) => {
    e.preventDefault()
    const q = query.trim().slice(0, 100)
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  // Only real, non-zero numbers are ever shown (zero-fake-data policy).
  const stats = [
    { key: "institutions", value: summary?.institutions },
    { key: "doctors", value: summary?.doctors },
    { key: "specialties", value: summary?.specialties },
  ].filter((s) => Number.isFinite(s.value) && s.value > 0)

  return (
    <>
      <section
        aria-labelledby="hero-title"
        className="relative isolate overflow-hidden bg-[#1d4468] text-white"
      >
        {/* Background image. Decorative, so alt="" ; falls back: optimized set -> /home.jpg -> brand color. */}
        {stage === 0 && (
          <picture>
            {/* Phones: portrait crop */}
            <source media="(max-width: 639px)" type="image/avif" srcSet={srcSet("hospital-tall", TALL, "avif")} sizes="100vw" />
            <source media="(max-width: 639px)" type="image/webp" srcSet={srcSet("hospital-tall", TALL, "webp")} sizes="100vw" />
            <source media="(max-width: 639px)" srcSet={srcSet("hospital-tall", TALL, "jpg")} sizes="100vw" />
            {/* Tablets and desktops: landscape crop */}
            <source type="image/avif" srcSet={srcSet("hospital-wide", WIDE, "avif")} sizes="100vw" />
            <source type="image/webp" srcSet={srcSet("hospital-wide", WIDE, "webp")} sizes="100vw" />
            <img
              src={`${BASE}/hospital-wide-1280.jpg`}
              srcSet={srcSet("hospital-wide", WIDE, "jpg")}
              sizes="100vw"
              alt=""
              width="1920"
              height="1080"
              decoding="async"
              // lowercase attribute works on React 18 without warnings; the LCP image must not be lazy
              fetchpriority="high"
              onError={() => setStage(1)}
              className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_40%]"
            />
          </picture>
        )}
        {stage === 1 && (
          <img
            src="/home.jpg"
            alt=""
            decoding="async"
            fetchpriority="high"
            onError={() => setStage(2)}
            className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_40%]"
          />
        )}

        {/* Vertical gradient: direction-agnostic, so identical in RTL and LTR; keeps text >= 4.5:1 */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(9,24,40,0.92)_0%,rgba(9,24,40,0.62)_45%,rgba(9,24,40,0.38)_100%)]"
        />

        <div className="container mx-auto flex min-h-[32rem] flex-col justify-end px-4 pb-24 pt-16 sm:min-h-[36rem] sm:pb-28 lg:min-h-[42rem] lg:pb-32">
          <div className="max-w-2xl text-start">
            <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-sm font-medium backdrop-blur">
              {t("brand.name")}
            </p>
            <h1 id="hero-title" className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {t("home.hero.title")}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/90 sm:text-lg">
              {t("home.hero.subtitle")}
            </p>
            <div className="mt-6">
              <Link
                to="/emergency"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-red-600 px-5 text-base font-semibold text-white shadow-lg hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Siren size={20} aria-hidden="true" />
                {t("home.hero.emergencyCta")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search card overlapping the hero edge */}
      <div className="container relative z-10 mx-auto -mt-10 px-4 sm:-mt-12">
        <form
          role="search"
          onSubmit={onSubmit}
          className="flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-xl ring-1 ring-slate-200 sm:flex-row sm:p-4"
        >
          <label htmlFor="hero-search" className="sr-only">
            {t("home.hero.searchLabel")}
          </label>
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 start-4 my-auto h-5 w-5 text-slate-400"
            />
            <input
              id="hero-search"
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              maxLength={100}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("home.hero.searchPlaceholder")}
              className="h-12 w-full rounded-xl border border-slate-300 ps-12 pe-4 text-base text-slate-900 placeholder:text-slate-500 focus:border-[#2C5F8A] focus:outline-none focus:ring-2 focus:ring-[#2C5F8A]/30"
            />
          </div>
          <button
            type="submit"
            className="h-12 rounded-xl bg-[#2C5F8A] px-8 text-base font-semibold text-white hover:bg-[#244f74] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C5F8A]"
          >
            {t("home.hero.searchButton")}
          </button>
        </form>

        {stats.length > 0 && (
          <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-slate-600">
            {stats.map((s) => (
              <li key={s.key}>
                <span className="font-semibold text-slate-900">{s.value}</span>{" "}
                {t(`home.stats.${s.key}`)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}