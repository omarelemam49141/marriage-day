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
  if (typeof window !== "undefined") {
    const parts = window.location.pathname.split("/").filter(Boolean);
    // If URL is e.g. /marriage-day/mosque-quiz or /marriage-day, first segment is the app base
    if (parts.length >= 1 && parts[0] !== "mosque-quiz" && parts[0] !== "api" && !parts[0].startsWith("_")) {
      return `/${parts[0]}`;
    }
  }
  return BASE;
}

/** Home URL (app root). Use for links like "back home" so they don't go to the origin root. */
export function homeHref(): string {
  const base = basePath();
  return base ? `${base}/` : "/";
}
