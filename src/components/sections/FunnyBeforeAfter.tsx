"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";

export function FunnyBeforeAfter() {
  const { t } = useTranslations();

  return (
    <section className="scroll-mt-16 bg-muted/30 px-4 py-16" id="before-after">
      <div className="container mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center text-2xl font-bold text-foreground md:text-3xl"
        >
          {t("beforeAfterTitle")} 😄
        </motion.h2>
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardHeader>
                <p className="text-sm font-medium text-muted-foreground">{t("beforeLabel")}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="flex items-center gap-2 text-lg">
                  <span aria-hidden>☕🏃‍♀️</span> {t("beforeBride")}
                </p>
                <p className="flex items-center gap-2 text-lg">
                  <span aria-hidden>💻☕</span> {t("beforeGroom")}
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <p className="text-sm font-medium text-primary">{t("afterLabel")}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="flex items-center gap-2 text-lg">
                  <span aria-hidden>☕🏃‍♀️❤️</span> {t("afterBride")}
                </p>
                <p className="flex items-center gap-2 text-lg">
                  <span aria-hidden>💻☕❤️</span> {t("afterGroom")}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
