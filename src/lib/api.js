/**
 * lib/api.js
 * One small wrapper around fetch for every call to the backend.
 * - Calls go to /api/*, which next.config.mjs proxies to the Express server
 * - Sends the login cookie automatically
 * - Throws an Error (with .status and .details) when the response is not OK
 * - Sends the user to /login if the session is missing or expired
 */

export async function api(path, { method = "GET", body, params } = {}) {
  // Build "?a=1&b=2" from params, skipping empty values
  const query = params
    ? "?" +
      new URLSearchParams(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== "")
      )
    : "";

  const res = await fetch(`/api${path}${query}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  // 204 No Content (e.g. logout, delete) has no body
  if (res.status === 204) return null;

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    // Not logged in anymore → back to login (except while on the login request itself)
    if (res.status === 401 && path !== "/auth/login" && typeof window !== "undefined") {
      // A full page load (not router.push) is intended: this file is not a React
      // component, and reloading also clears any cached data from the old session.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    // No JSON error body means our API never answered (e.g. it is not running)
    const fallback = res.status >= 500 ? "Cannot reach the server. Please try again shortly." : "Request failed";
    const error = new Error(json?.error?.message || fallback);
    error.status = res.status;
    error.details = json?.error?.details || [];
    throw error;
  }

  return json;
}
