// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { apiGet, apiPost, setAccessToken, clearAccessToken } from "../api/client"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const { i18n } = useTranslation()
  const lang = i18n.language === "fr" ? "fr" : "ar"

  const [user, setUser] = useState(null)   // null = not loaded yet
  const [loaded, setLoaded] = useState(false) // true once we've tried /auth/me

  // Called once on app mount — tries to restore session from the refresh cookie
  const loadSession = useCallback(async () => {
    try {
      const data = await apiGet("/auth/me", lang)
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoaded(true)
    }
  }, [lang])

  const login = useCallback(async (credentials) => {
    const data = await apiPost("/auth/login", credentials, lang)
    setAccessToken(data.accessToken)
    // Fetch full user profile (role, etc.) after login
    const me = await apiGet("/auth/me", lang)
    setUser(me)
    return { ...data, user: me }
  }, [lang])

  const logout = useCallback(async () => {
    try {
      await apiPost("/auth/logout", {}, lang)
    } catch {
      // best effort
    } finally {
      clearAccessToken()
      setUser(null)
    }
  }, [lang])

  const refreshUser = useCallback(async () => {
    try {
      const data = await apiGet("/auth/me", lang)
      setUser(data)
    } catch {
      setUser(null)
    }
  }, [lang])

  return (
    <AuthContext.Provider value={{ user, loaded, loadSession, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
