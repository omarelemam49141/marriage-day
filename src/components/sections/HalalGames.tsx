"use client";

import { useState } from "react";
import { useTranslations } from "@/hooks/useTranslations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MemoryGame } from "@/components/games/MemoryGame";
import { BismillahReaction } from "@/components/games/BismillahReaction";
import { motion } from "framer-motion";

export function HalalGames() {
  const t = useTranslations().t;
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [bismillahOpen, setBismillahOpen] = useState(false);

  return (
    <section className="scroll-mt-16 px-4 py-16" id="games">
      <div className="container mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-2 text-center text-2xl font-bold text-foreground md:text-3xl"
        >
          {t("gamesTitle")} 🎮
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10 text-center text-sm text-muted-foreground"
        >
          {t("gamesNote")}
        </motion.p>
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="flex h-full flex-col">
              <CardHeader>
                <CardTitle>{t("memoryGame")}</CardTitle>
                <CardDescription>{t("memoryGameDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button className="w-full" onClick={() => setMemoryOpen(true)}>
                  {t("memoryPlay")}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="flex h-full flex-col">
              <CardHeader>
                <CardTitle>{t("bismillahGame")}</CardTitle>
                <CardDescription>{t("bismillahGameDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button className="w-full" onClick={() => setBismillahOpen(true)}>
                  {t("memoryPlay")}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Dialog open={memoryOpen} onOpenChange={setMemoryOpen}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("memoryGame")}</DialogTitle>
          </DialogHeader>
          <MemoryGame />
        </DialogContent>
      </Dialog>

      <Dialog open={bismillahOpen} onOpenChange={setBismillahOpen}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("bismillahGame")}</DialogTitle>
          </DialogHeader>
          <BismillahReaction />
        </DialogContent>
      </Dialog>
    </section>
  );
}
