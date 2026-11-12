// src/components/InstallApp/InstallBanner.jsx
import { useState } from "react"
import { X, Download, Smartphone } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useInstallPrompt } from "../../hooks/useInstallPrompt"
import IosSafariSheet from "./IosSafariSheet"

/**
 * A dismissible install-app banner for the home page (below hero).
 * Hidden when already in standalone mode or dismissed within 14 days.
 */
export default function InstallBanner() {
  const { t } = useTranslation()
  const { canInstall, isIosSafari, isDismissed, triggerInstall, dismiss } = useInstallPrompt()
  const [showIosSheet, setShowIosSheet] = useState(false)

  // Don't render if already installed, not installable, or recently dismissed
  if (!canInstall || isDismissed) return null

  const handleInstall = () => {
    if (isIosSafari) {
      setShowIosSheet(true)
    } else {
      triggerInstall()
    }
  }

  return (
    <>
      <div
        role="region"
        aria-label={t("install.bannerAriaLabel")}
        className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-r from-[#2C5F8A]/10 to-blue-50 border border-[#2C5F8A]/20 px-4 py-4 flex items-start gap-3 sm:items-center"
      >
        <div className="shrink-0 w-10 h-10 rounded-xl bg-[#2C5F8A] flex items-center justify-center">
          <Smartphone size={20} className="text-white" aria-hidden />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">{t("install.bannerTitle")}</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{t("install.bannerDesc")}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstall}
            className="flex items-center gap-1.5 bg-[#2C5F8A] text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-[#245075] transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#2C5F8A] focus-visible:outline-none"
          >
            <Download size={14} aria-hidden />
            {t("install.install")}
          </button>
          <button
            onClick={dismiss}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:text-gray-600 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none min-h-[44px] min-w-[44px]"
            aria-label={t("common.close")}
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      </div>

      {showIosSheet && <IosSafariSheet onClose={() => setShowIosSheet(false)} />}
    </>
  )
}
