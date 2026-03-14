"use client";

import { useTranslations } from "@/hooks/useTranslations";
import { motion } from "framer-motion";

export function FooterBlessing() {
  const { t } = useTranslations();

  return (
    <footer className="border-t bg-muted/20 px-4 py-12" id="footer">
      <div className="container mx-auto max-w-3xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-arabic text-xl font-medium text-foreground"
          style={{ fontFamily: "var(--font-tajawal)" }}
        >
          {t("footerBlessing")}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-4 text-sm text-muted-foreground"
        >
          {t("footerMade")}
        </motion.p>
      </div>
    </footer>
  );
}
