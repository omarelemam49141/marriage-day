"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/useTranslations";
import { motion, AnimatePresence } from "framer-motion";

const SYMBOLS = ["🌙", "❤️", "🌹", "✨", "🕌", "📿", "🌟", "💒"];
const PAIRS = [...SYMBOLS, ...SYMBOLS];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function MemoryGame() {
  const t = useTranslations().t;
  const [cards, setCards] = useState(() => shuffle(PAIRS));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [lock, setLock] = useState(false);

  const reset = useCallback(() => {
    setCards(shuffle(PAIRS));
    setFlipped([]);
    setMatched(new Set());
    setLock(false);
  }, []);

  const handleClick = useCallback(
    (index: number) => {
      if (lock || flipped.includes(index) || matched.has(index)) return;
      const next = [...flipped, index];
      setFlipped(next);
      if (next.length === 2) {
        setLock(true);
        const [a, b] = next;
        if (cards[a] === cards[b]) {
          setMatched((m) => new Set([...m, a, b]));
          setFlipped([]);
          setLock(false);
        } else {
          setTimeout(() => {
            setFlipped([]);
            setLock(false);
          }, 600);
        }
      }
    },
    [cards, flipped, lock, matched]
  );

  const won = matched.size === PAIRS.length;

  return (
    <div className="space-y-4">
      {won ? (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-lg bg-primary/10 p-6 text-center"
        >
          <p className="text-xl font-bold text-primary">{t("memoryWin")}</p>
          <Button className="mt-4" onClick={reset}>
            {t("memoryNewGame")}
          </Button>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            <AnimatePresence>
              {cards.map((symbol, i) => {
                const isFlipped = flipped.includes(i) || matched.has(i);
                return (
                  <motion.button
                    key={`${i}-${symbol}`}
                    type="button"
                    layout
                    initial={false}
                    animate={{ scale: isFlipped ? 1 : 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex h-14 w-full items-center justify-center rounded-lg border-2 bg-card text-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-ring sm:h-16"
                    onClick={() => handleClick(i)}
                    disabled={lock}
                  >
                    {isFlipped ? symbol : "❓"}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            {t("memoryNewGame")}
          </Button>
        </>
      )}
    </div>
  );
}
