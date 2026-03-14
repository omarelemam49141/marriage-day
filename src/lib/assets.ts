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

/** Base path for the app (e.g. /marriage-day). Use for client-side links so they stay under the app. */
export function basePath(): string {
  return BASE;
}

/** Home URL (app root). Use for links like "back home" so they don't go to the origin root. */
export function homeHref(): string {
  return BASE ? `${BASE}/` : "/";
}
