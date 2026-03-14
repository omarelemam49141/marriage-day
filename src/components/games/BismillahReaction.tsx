"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { motion } from "framer-motion";

type Phase = "idle" | "waiting" | "go" | "result";

export function BismillahReaction() {
  const t = useTranslations().t;
  const [phase, setPhase] = useState<Phase>("idle");
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTimeRef = useRef<number>(0);

  const startWaiting = useCallback(() => {
    setPhase("waiting");
    setReactionMs(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    const delay = 1000 + Math.random() * 2000;
    timerRef.current = setTimeout(() => {
      startTimeRef.current = performance.now();
      setPhase("go");
      timerRef.current = null;
    }, delay);
  }, []);

  const handleGoClick = useCallback(() => {
    if (phase !== "go") return;
    setReactionMs(Math.round(performance.now() - startTimeRef.current));
    setPhase("result");
  }, [phase]);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setPhase("idle");
    setReactionMs(null);
  }, []);

  return (
    <div className="space-y-4">
      {phase === "idle" && (
        <Button size="lg" className="w-full" onClick={startWaiting}>
          {t("bismillahReady")}
        </Button>
      )}
      {phase === "waiting" && (
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="rounded-lg border-2 border-dashed p-6 text-center text-muted-foreground"
        >
          انتظر... / Wait...
        </motion.div>
      )}
      {phase === "go" && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4"
        >
          <Button size="lg" className="w-full text-2xl" onClick={handleGoClick}>
            {t("bismillahGo")}
          </Button>
        </motion.div>
      )}
      {phase === "result" && reactionMs !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-primary/10 p-6 text-center"
        >
          <p className="text-lg font-bold text-primary">
            {reactionMs < 250 ? t("bismillahFast") : t("bismillahGood")} — {reactionMs} ms
          </p>
          <Button variant="outline" className="mt-4" onClick={reset}>
            {t("bismillahTry")}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
