// src/components/InstallApp/IosSafariSheet.jsx
import { X } from "lucide-react"
import { useTranslation } from "react-i18next"

/**
 * Step-by-step iOS Safari install instructions sheet.
 * No external images — the Share icon is an inline SVG.
 */
export default function IosSafariSheet({ onClose }) {
  const { t } = useTranslation()

  const steps = [
    {
      num: 1,
      text: t("install.iosStep1"),
      icon: (
        // iOS share icon (box with up-arrow) — inline SVG, no external resources
        <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-blue-100 shrink-0">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2C5F8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </span>
      ),
    },
    {
      num: 2,
      text: t("install.iosStep2"),
      icon: (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-blue-100 shrink-0">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2C5F8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 17h3m3 0h-3m0 0v-3m0 3v3" />
          </svg>
        </span>
      ),
    },
    {
      num: 3,
      text: t("install.iosStep3"),
      icon: (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-blue-100 shrink-0">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#2C5F8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </span>
      ),
    },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ios-install-title"
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[slideUp_0.3s_ease-out]">
        <button
          onClick={onClose}
          className="absolute top-4 end-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          aria-label="Close"
        >
          <X size={18} aria-hidden />
        </button>

        <h2 id="ios-install-title" className="text-lg font-bold text-gray-800 mb-1 pe-8">
          {t("install.installApp")}
        </h2>
        <p className="text-sm text-gray-500 mb-5">
          {t("install.iosInstructions")}
        </p>

        <ol className="space-y-3">
          {steps.map(({ num, text, icon }) => (
            <li key={num} className="flex items-start gap-3">
              {icon}
              <p className="text-sm text-gray-700 leading-snug pt-1">{text}</p>
            </li>
          ))}
        </ol>

        {/* Arrow hint pointing down */}
        <div className="mt-5 flex justify-center">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
          <span className="ms-1 text-xs text-gray-400">{t("install.tapShareBelow")}</span>
        </div>
      </div>
    </div>
  )
}
