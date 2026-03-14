"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const WOLF_SOUNDS = [
  "/sounds/mosque-quiz/wolf-1.mp3",
  "/sounds/mosque-quiz/wolf-2.mp3",
  "/sounds/mosque-quiz/wolf-3.mp3",
];

function playWolfHowl() {
  try {
    const src = WOLF_SOUNDS[Math.floor(Math.random() * WOLF_SOUNDS.length)];
    const audio = new Audio(src);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
}

export default function MosqueQuizPage() {
  const rainRef = useRef<HTMLAudioElement | null>(null);
  const cricketsRef = useRef<HTMLAudioElement | null>(null);
  const wolfIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const rain = new Audio("/sounds/mosque-quiz/rain-lightning.mp3");
    rain.loop = true;
    rain.volume = 0.25;
    rainRef.current = rain;
    rain.play().catch(() => {});

    const crickets = new Audio("/sounds/mosque-quiz/crickets.mp3");
    crickets.loop = true;
    crickets.volume = 0.15;
    cricketsRef.current = crickets;
    crickets.play().catch(() => {});

    const scheduleNextWolf = () => {
      const delay = 8000 + Math.random() * 12000;
      return window.setTimeout(() => {
        playWolfHowl();
        wolfIntervalRef.current = scheduleNextWolf();
      }, delay);
    };
    wolfIntervalRef.current = scheduleNextWolf();

    return () => {
      rain.pause();
      rainRef.current = null;
      crickets.pause();
      cricketsRef.current = null;
      if (wolfIntervalRef.current) {
        clearTimeout(wolfIntervalRef.current);
        wolfIntervalRef.current = null;
      }
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div
        className="mosque-quiz-fog pointer-events-none fixed inset-0 z-0 bg-linear-to-b from-zinc-900/80 via-transparent to-zinc-950/80"
        aria-hidden
      />
      <div className="absolute inset-0 z-0 bg-linear-to-b from-zinc-950 via-zinc-900/95 to-zinc-950" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <motion.div
          className="max-w-2xl text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.h1
            className="mb-4 text-3xl font-bold tracking-tight text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.35)] md:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0.7, 1, 0.7],
              y: 0,
            }}
            transition={{
              opacity: { duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
              y: { duration: 0.8, delay: 0.3 },
            }}
          >
            ...
          </motion.h1>
          <motion.p
            className="text-lg text-zinc-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            جارٍ التحضير
          </motion.p>
        </motion.div>
      </div>
    </main>
  );
}
