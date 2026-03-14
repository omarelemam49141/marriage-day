"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Locale } from "@/lib/messages";

const STORAGE_KEY = "ishhar-locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const locale: Locale = "ar";

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.lang = "ar";
    document.documentElement.dir = "rtl";
    document.documentElement.classList.add("locale-ar");
    document.documentElement.classList.remove("locale-en");
  }, [mounted]);

  const setLocale = useCallback((_next: Locale) => {
    // Arabic only; no-op
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
