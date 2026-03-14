/**
 * Marriage date: Gregorian equivalent of 11 Dhu al-Hijjah (11 ذي الحجة).
 * Set NEXT_PUBLIC_MARRIAGE_DATE in .env.local (ISO string, e.g. 2025-06-06T20:00:00).
 */
const envDate = process.env.NEXT_PUBLIC_MARRIAGE_DATE;
const fallbackDate = "2026-06-17T20:00:00"; // Placeholder: update to your 11 ذي الحجة date

export const MARRIAGE_DATE = envDate ? new Date(envDate) : new Date(fallbackDate);
