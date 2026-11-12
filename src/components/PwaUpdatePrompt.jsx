import { useRegisterSW } from "virtual:pwa-register/react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useEffect } from "react"

export default function PwaUpdatePrompt() {
  const { t } = useTranslation()
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // Check for updates every 60 s while the tab is open
      r && setInterval(() => r.update(), 60_000)
    },
  })

  useEffect(() => {
    if (needRefresh) {
      toast(t("pwa.updateAvailable"), {
        duration: Infinity,
        action: {
          label: t("pwa.refresh"),
          onClick: () => updateServiceWorker(true),
        },
      })
    }
  }, [needRefresh, t, updateServiceWorker])

  return null
}
