// src/lib/returnTo.js
/**
 * Validate that a returnTo path is a safe same-origin relative path.
 * Rejects: protocol-relative URLs (//), absolute URLs, backslash tricks, etc.
 */
export function isSafeReturnTo(path) {
  if (!path || typeof path !== "string") return false
  if (path === "/") return true
  // Must start with exactly one / followed by a non-/ non-\ character
  if (!/^\/[^/\\]/.test(path)) return false
  // Must not contain a protocol scheme
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) return false
  // Must not contain null bytes or encoded variations of //
  if (path.includes("\0") || /%2f%2f/i.test(path) || /%5c/i.test(path)) return false
  return true
}
