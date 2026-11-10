// src/api/client.js
// Fetch wrapper with:
//   - credentials: "include" (for httpOnly refresh-token cookie)
//   - Accept-Language header (current i18n language)
//   - Automatic 401 → refresh-token retry (once)
//   - Uniform {data, error} response shape

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1"

let isRefreshing = false
let refreshPromise = null

async function doRefresh() {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
  if (!res.ok) throw new Error("refresh_failed")
  const body = await res.json()
  return body.data?.accessToken ?? null
}

// Single in-flight refresh — multiple concurrent 401s all await the same promise
async function refreshOnce() {
  if (!isRefreshing) {
    isRefreshing = true
    refreshPromise = doRefresh().finally(() => {
      isRefreshing = false
      refreshPromise = null
    })
  }
  return refreshPromise
}

// Stored in memory only — never in localStorage (XSS protection)
let accessToken = null

export function setAccessToken(token) {
  accessToken = token
}

export function clearAccessToken() {
  accessToken = null
}

export function getAccessToken() {
  return accessToken
}

/**
 * Core fetch wrapper. Adds auth header, Accept-Language, and handles 401 refresh.
 */
export async function apiFetch(path, options = {}, lang = "ar") {
  const headers = {
    "Content-Type": "application/json",
    "Accept-Language": lang,
    "X-Requested-With": "XMLHttpRequest",
    ...(options.headers ?? {}),
  }
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  })

  if (res.status === 401 && path !== "/auth/refresh" && path !== "/auth/login") {
    try {
      const newToken = await refreshOnce()
      if (newToken) {
        setAccessToken(newToken)
        // Retry the original request with the new token
        const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` }
        const retry = await fetch(`${API_BASE}${path}`, {
          ...options,
          headers: retryHeaders,
          credentials: "include",
        })
        return retry
      }
    } catch {
      clearAccessToken()
      // Fall through to return the original 401
    }
  }

  return res
}

/**
 * Convenience helpers that parse JSON and throw on error.
 */
export async function apiGet(path, lang) {
  const res = await apiFetch(path, { method: "GET" }, lang)
  const body = await res.json()
  if (!res.ok) throw Object.assign(new Error(body.error ?? "request_failed"), { status: res.status, body })
  return body.data
}

export async function apiPost(path, data, lang) {
  const res = await apiFetch(path, {
    method: "POST",
    body: JSON.stringify(data),
  }, lang)
  const body = await res.json()
  if (!res.ok) throw Object.assign(new Error(body.error ?? "request_failed"), { status: res.status, body })
  return body.data
}

export async function apiPatch(path, data, lang) {
  const res = await apiFetch(path, {
    method: "PATCH",
    body: JSON.stringify(data),
  }, lang)
  const body = await res.json()
  if (!res.ok) throw Object.assign(new Error(body.error ?? "request_failed"), { status: res.status, body })
  return body.data
}

export async function apiDelete(path, lang) {
  const res = await apiFetch(path, { method: "DELETE" }, lang)
  const body = await res.json()
  if (!res.ok) throw Object.assign(new Error(body.error ?? "request_failed"), { status: res.status, body })
  return body.data
}
