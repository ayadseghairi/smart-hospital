// src/pages/InstallPage.jsx
/**
 * /install — per-platform app install instructions with a client-side QR code.
 * No external QR code services — uses the qrcode.js library rendered to a canvas.
 */
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Smartphone, Monitor, Apple, Download } from "lucide-react"
import Layout from "../components/Layout"
import { useInstallPrompt } from "../hooks/useInstallPrompt"

const APP_URL = typeof window !== "undefined" ? window.location.origin : ""

function QrCode({ value, size = 180 }) {
  const canvasRef = useRef(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!value) return
    let cancelled = false
    import("qrcode").then((QRCode) => {
      if (cancelled || !canvasRef.current) return
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: { dark: "#1f2937", light: "#ffffff" },
      }).catch(() => setError(true))
    }).catch(() => setError(true))
    return () => { cancelled = true }
  }, [value, size])

  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-lg text-xs text-gray-500 text-center p-4"
        style={{ width: size, height: size }}
      >
        {value}
      </div>
    )
  }

  return <canvas ref={canvasRef} className="rounded-lg" aria-label={value} />
}

function PlatformCard({ icon, title, steps, action }) {
  const CardIcon = icon
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2C5F8A]/10 flex items-center justify-center shrink-0">
          <CardIcon size={20} className="text-[#2C5F8A]" aria-hidden />
        </div>
        <h2 className="font-semibold text-gray-800 text-base">{title}</h2>
      </div>

      <ol className="space-y-2 ps-1">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#2C5F8A]/10 text-[#2C5F8A] text-xs font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span className="text-sm text-gray-700 leading-snug">{step}</span>
          </li>
        ))}
      </ol>

      {action && (
        <div className="pt-1">
          {action}
        </div>
      )}
    </div>
  )
}

export default function InstallPage() {
  const { t } = useTranslation()
  const { isIosSafari, canInstall, isStandalone, triggerInstall } = useInstallPrompt()

  if (isStandalone) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Download size={28} className="text-green-600" aria-hidden />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">{t("install.alreadyInstalled")}</h1>
          <p className="text-sm text-gray-500">{t("install.alreadyInstalledDesc")}</p>
        </div>
      </Layout>
    )
  }

  const androidSteps = [
    t("install.androidStep1"),
    t("install.androidStep2"),
    t("install.androidStep3"),
    t("install.androidStep4"),
  ]

  const iosSteps = [
    t("install.iosStep1"),
    t("install.iosStep2"),
    t("install.iosStep3"),
  ]

  const desktopSteps = [
    t("install.desktopStep1"),
    t("install.desktopStep2"),
    t("install.desktopStep3"),
  ]

  return (
    <Layout>
      <div className="min-h-[60vh] bg-gray-50 py-10">
        <div className="container mx-auto px-4 max-w-2xl">

          {/* Page header */}
          <div className="text-center mb-8">
            <img src="/logo.jpg" alt={t("brand.logoAlt")} width={64} height={64} className="w-16 h-16 rounded-2xl object-cover mx-auto mb-4 shadow-md" />
            <h1 className="text-2xl font-bold text-gray-800">{t("install.pageTitle")}</h1>
            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">{t("install.pageSubtitle")}</p>
          </div>

          {/* QR code block */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="shrink-0">
              <QrCode value={APP_URL} size={180} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800 mb-1">{t("install.qrLabel")}</h2>
              <p className="text-sm text-gray-500 leading-snug">{t("install.qrDesc")}</p>
              <p className="text-xs text-gray-400 mt-2 font-mono break-all">{APP_URL}</p>
            </div>
          </div>

          {/* Platform cards */}
          <div className="space-y-4">
            {/* Android / Chrome — show install button if prompt is available */}
            <PlatformCard
              icon={Smartphone}
              title={t("install.androidTitle")}
              steps={androidSteps}
              action={canInstall && !isIosSafari ? (
                <button
                  onClick={triggerInstall}
                  className="flex items-center gap-2 bg-[#2C5F8A] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#245075] transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#2C5F8A] focus-visible:outline-none"
                >
                  <Download size={16} aria-hidden />
                  {t("install.installNow")}
                </button>
              ) : null}
            />

            <PlatformCard
              icon={Apple}
              title={t("install.iosTitle")}
              steps={iosSteps}
            />

            <PlatformCard
              icon={Monitor}
              title={t("install.desktopTitle")}
              steps={desktopSteps}
              action={canInstall && !isIosSafari ? (
                <button
                  onClick={triggerInstall}
                  className="flex items-center gap-2 bg-[#2C5F8A] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#245075] transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#2C5F8A] focus-visible:outline-none"
                >
                  <Download size={16} aria-hidden />
                  {t("install.installNow")}
                </button>
              ) : null}
            />
          </div>
        </div>
      </div>
    </Layout>
  )
}
