// src/hooks/useInstallPrompt.js
/**
 * Captures the browser's beforeinstallprompt event for Android/Chrome PWA install,
 * detects iOS Safari standalone mode, and manages a 14-day dismissal cooldown.
 */
import { useState, useEffect, useCallback } from "react"

const DISMISS_KEY = "pwa_install_dismissed_until"
const COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000 // 14 days

function isIos() {
  if (typeof navigator === "undefined") return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isSafari() {
  if (typeof navigator === "undefined") return false
  return /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios/i.test(navigator.userAgent)
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-ignore — iOS-specific
    window.navigator.standalone === true
  )
}

function isDismissedNow() {
  try {
    const until = localStorage.getItem(DISMISS_KEY)
    if (!until) return false
    return Date.now() < Number(until)
  } catch {
    return false
  }
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isDismissed, setIsDismissed] = useState(() => isDismissedNow())
  const [isStandalone] = useState(() => isStandaloneMode())

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  // Re-check dismissal after a visibility change (e.g. tab switch)
  useEffect(() => {
    const check = () => setIsDismissed(isDismissedNow())
    document.addEventListener("visibilitychange", check)
    return () => document.removeEventListener("visibilitychange", check)
  }, [])

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null)
    }
  }, [deferredPrompt])

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + COOLDOWN_MS))
    } catch {
      // storage full or blocked — ignore
    }
    setIsDismissed(true)
  }, [])

  // canInstall = Chrome/Android has a deferred prompt, OR it's iOS Safari outside standalone
  const canInstall =
    !isStandalone &&
    (deferredPrompt !== null || (isIos() && isSafari()))

  const isIosSafari = isIos() && isSafari() && !isStandalone

  return { canInstall, isIosSafari, isStandalone, isDismissed, triggerInstall, dismiss }
}
