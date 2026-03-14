"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { useTranslations } from "@/hooks/useTranslations";
import { MARRIAGE_DATE } from "@/lib/config";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function CountdownUnit({
  value,
  label,
  labelPlural,
}: {
  value: number;
  label: string;
  labelPlural: string;
}) {
  const isPlural = value !== 1;
  return (
    <motion.span
      key={`${value}-${label}`}
      initial={{ scale: 1.05 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.2 }}
      className="inline-flex flex-col items-center gap-0.5"
    >
      <span className="tabular-nums font-bold text-primary" aria-hidden="true">
        {value.toLocaleString("ar-EG")}
      </span>
      <span className="text-xs font-medium text-muted-foreground">
        {isPlural ? labelPlural : label}
      </span>
    </motion.span>
  );
}

type ExtraPrecision = 0 | 1 | 2; // 0 = ms only, 1 = +micro, 2 = +micro + nano

export function HeroCountdown() {
  const { t, locale } = useTranslations();
  const { done, remaining } = useCountdown(MARRIAGE_DATE);
  const [extraPrecision, setExtraPrecision] = useState<ExtraPrecision>(0);
  const [micro, setMicro] = useState(0);
  const [nano, setNano] = useState(0);

  useEffect(() => {
    const raf = () => {
      const now = performance.now();
      // Make the "micro" counter visually spin faster than milliseconds
      setMicro(Math.floor((now * 10) % 1000));
      setNano(Math.floor((now * 1000) % 1000));
    };
    const id = requestAnimationFrame(function loop() {
      raf();
      requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const cyclePrecision = () => setExtraPrecision((prev) => ((prev + 1) % 3) as ExtraPrecision);

  if (done) {
    return (
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center text-3xl font-bold text-primary md:text-5xl"
        >
          {t("countdownDone")} 🎉
        </motion.p>
      </section>
    );
  }

  return (
    <section
      className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-20"
      aria-live="polite"
      aria-label="Countdown to marriage day"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
      <div className="absolute -top-24 end-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute top-1/2 start-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 ishhar-corner" aria-hidden />

      <div className="relative z-10 max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-3 text-xl font-semibold text-primary md:text-2xl"
          style={{ fontFamily: "var(--font-tajawal)" }}
        >
          بسم الله الرحمن الرحيم
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-2 text-2xl font-bold text-foreground md:text-4xl"
        >
          {t("heroTitle")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-10 text-muted-foreground"
        >
          {t("heroSubtitle")} 🧐
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 gap-y-6 text-2xl md:gap-6 md:text-3xl"
        >
          <CountdownUnit
            value={remaining.days}
            label={t("countdownDay")}
            labelPlural={t("countdownDays")}
          />
          <CountdownUnit
            value={remaining.hours}
            label={t("countdownHour")}
            labelPlural={t("countdownHours")}
          />
          <CountdownUnit
            value={remaining.minutes}
            label={t("countdownMinute")}
            labelPlural={t("countdownMinutes")}
          />
          <CountdownUnit
            value={remaining.seconds}
            label={t("countdownSecond")}
            labelPlural={t("countdownSeconds")}
          />
          <CountdownUnit
            value={remaining.milliseconds}
            label={t("countdownMilli")}
            labelPlural={t("countdownMilli")}
          />
          <span className="inline-flex flex-col items-center gap-1">
            {extraPrecision >= 1 && (
              <motion.span
                initial={{ opacity: 0, y: 4, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="relative rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 shadow-sm dark:bg-amber-500/25 dark:text-amber-200 after:absolute after:left-1/2 after:top-full after:block after:h-0 after:w-0 after:-translate-x-1/2 after:border-[6px] after:border-solid after:border-transparent after:border-t-amber-100 after:content-[''] dark:after:border-t-amber-500/25"
              >
                {extraPrecision === 1 ? t("countdownNotEnoughClick1") : t("countdownNotEnoughClick2")}
              </motion.span>
            )}
            <motion.button
              type="button"
              onClick={cyclePrecision}
              className="inline-flex items-center rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-ring"
              aria-pressed={extraPrecision > 0}
              aria-label={t("countdownNotEnough")}
            >
              {t("countdownNotEnough")}
            </motion.button>
          </span>
          {extraPrecision >= 1 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex flex-col items-center gap-0.5"
            >
              <span className="tabular-nums font-bold text-primary">
                {locale === "ar" ? micro.toLocaleString("ar-EG") : micro}
              </span>
              <span className="text-xs font-medium text-muted-foreground">{t("countdownMicro")}</span>
            </motion.span>
          )}
          {extraPrecision >= 2 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex flex-col items-center gap-0.5"
            >
              <span className="tabular-nums font-bold text-primary">
                {locale === "ar" ? nano.toLocaleString("ar-EG") : nano}
              </span>
              <span className="text-xs font-medium text-muted-foreground">{t("countdownNano")}</span>
            </motion.span>
          )}
        </motion.div>
      </div>
    </section>
  );
}
