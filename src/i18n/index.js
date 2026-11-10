// src/i18n/index.js
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import ar from "./locales/ar.json"
import fr from "./locales/fr.json"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      fr: { translation: fr },
    },
    fallbackLng: "ar",
    supportedLngs: ["ar", "fr"],
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "delinLang",
    },
    interpolation: {
      escapeValue: false,
    },
  })

// Sync HTML dir/lang whenever the language changes
const applyDir = (lng) => {
  const isRTL = lng === "ar"
  document.documentElement.lang = lng
  document.documentElement.dir = isRTL ? "rtl" : "ltr"
}

applyDir(i18n.language)
i18n.on("languageChanged", applyDir)

export default i18n
