/**
 * Base path for static assets (e.g. GitHub Pages: /repo-name).
 * Ensures /images, /sounds, /videos work when app is served under a subpath.
 */
const BASE = typeof process !== "undefined" && process.env?.NEXT_PUBLIC_BASE_PATH
  ? process.env.NEXT_PUBLIC_BASE_PATH.replace(/\/$/, "")
  : "";

export function asset(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${p}`;
}
