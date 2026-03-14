"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

export function BrideGroom() {
  const { t } = useTranslations();

  return (
    <section className="scroll-mt-16 px-4 py-16" id="bride-groom">
      <div className="container mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center text-2xl font-bold text-foreground md:text-3xl"
        >
          منة وعمر 💒
        </motion.h2>
        <div className="grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden border-2 border-rose-200 bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-card">
              <CardHeader>
                <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
                  {t("brideTitle")} 🌸
                </span>
                <p className="font-arabic text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-tajawal)" }}>
                  {t("brideName")}
                </p>
                <p className="text-muted-foreground">{t("brideTagline")}</p>
              </CardHeader>
              <CardContent>
                <p className="text-4xl" aria-hidden>👩‍🍳🌷</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="overflow-hidden border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-white dark:from-sky-950/20 dark:to-card">
              <CardHeader>
                <span className="text-sm font-medium text-sky-600 dark:text-sky-400">
                  {t("groomTitle")} 💻
                </span>
                <p className="font-arabic text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-tajawal)" }}>
                  {t("groomName")}
                </p>
                <p className="text-muted-foreground">{t("groomTagline")}</p>
              </CardHeader>
              <CardContent>
                <p className="text-4xl" aria-hidden>⌨️☕</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
