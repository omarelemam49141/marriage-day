"use client";

import { MousePointer2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";

export function Header() {
  const { t } = useTranslations();

  const handleSkipClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const target = document.querySelector<HTMLElement>("#bride-groom");
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-end gap-2 px-4">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleSkipClick}
          aria-label={t("skipToContent")}
        >
          <MousePointer2 className="rtl:rotate-180" />
        </Button>
      </div>
    </header>
  );
}
