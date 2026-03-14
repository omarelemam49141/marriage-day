/**
 * Marriage date: Saturday 21 March 2026.
 * Set NEXT_PUBLIC_MARRIAGE_DATE in .env.local (ISO string, e.g. 2026-03-21T20:00:00).
 */
const envDate = process.env.NEXT_PUBLIC_MARRIAGE_DATE;
const fallbackDate = "2026-03-21T20:00:00"; // Saturday 21 March 2026

export const MARRIAGE_DATE = envDate ? new Date(envDate) : new Date(fallbackDate);
