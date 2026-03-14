"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export function CoupleMessages() {
  const { t } = useTranslations();

  return (
    <section className="scroll-mt-16 bg-muted/30 px-4 py-16" id="messages">
      <div className="container mx-auto max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center text-2xl font-bold text-foreground md:text-3xl"
        >
          {t("coupleMessagesTitle")} 💌
        </motion.h2>
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-sky-200 dark:border-sky-800">
              <CardContent className="flex items-center gap-4 pt-6">
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  aria-hidden
                >
                  💻
                </motion.span>
                <p className="text-lg font-medium md:text-xl">&ldquo;{t("groomMessage")}&rdquo;</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-rose-200 dark:border-rose-800">
              <CardContent className="flex items-center gap-4 pt-6">
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  aria-hidden
                >
                  🌸
                </motion.span>
                <p className="text-lg font-medium md:text-xl">&ldquo;{t("brideMessage")}&rdquo;</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
