"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { motion } from "framer-motion";

const factKeys = ["fact1", "fact2", "fact3", "fact4", "fact5"] as const;
const emojis = ["😄", "🏃‍♀️💻", "🐙", "📷🐛", "☕"];

export function FunnyFacts() {
  const { t } = useTranslations();

  return (
    <section className="scroll-mt-16 px-4 py-16" id="facts">
      <div className="container mx-auto max-w-3xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center text-2xl font-bold text-foreground md:text-3xl"
        >
          {t("factsTitle")} 🤓
        </motion.h2>
        <ul className="space-y-4">
          {factKeys.map((key, i) => (
            <motion.li
              key={key}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
            >
              <span className="text-2xl" aria-hidden>
                {emojis[i]}
              </span>
              <span className="text-lg">{t(key)}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
