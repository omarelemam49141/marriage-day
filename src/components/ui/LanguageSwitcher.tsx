"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { useLocale } from "@/context/LocaleContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const t = useTranslations().t;

  return (
    <div className={cn("flex gap-1 rounded-lg border bg-muted/30 p-0.5", className)} role="group" aria-label="Language">
      <Button
        variant={locale === "ar" ? "default" : "ghost"}
        size="sm"
        className="min-w-[4rem]"
        onClick={() => setLocale("ar")}
      >
        {t("langAr")}
      </Button>
      <Button
        variant={locale === "en" ? "default" : "ghost"}
        size="sm"
        className="min-w-[4rem]"
        onClick={() => setLocale("en")}
      >
        {t("langEn")}
      </Button>
    </div>
  );
}
