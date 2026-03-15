"use client";

import emailjs from "@emailjs/browser";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { asset } from "@/lib/assets";

const BADGE_MESSAGES = [
  { icon: "🍰", text: "مش عاوزة جاتوه؟" },
  { icon: "👧", text: "عاوزة أصلى فى المسجد وأكفر عن ذنوبى" },
  { icon: "📣", text: "البيت يناديييكى" },
  { icon: "🏠", text: "أنا زعلتك فى حاجة؟" },
  { icon: "🙈", text: "بيت منة مش عاجبك؟" },
  { icon: "🧭", text: "مش عارفة الطريق للبيت؟" },
  { icon: "🏡", text: "البيت أصلا أصلا أصلا للبنات" },
  { icon: "🏔️", text: "جبل يعنى hiking والصحة فى النازل" },
  { icon: "😤", text: "منة معزمتنيش أول واحدة" },
  { icon: "🕌", text: "المسجد اوضة واحدة, انما البيت برح وشرح فمتبقاش كلح" },
  { icon: "💰", text: "متخافيش مفيش رسوم دخول... مش كتير" },
  { icon: "🪜", text: "ياااه لو البيت فى الدور التالت, للأسف التالت علوى بعيد" },
] as const;

const SOUND_PATHS = [
  asset("/sounds/1.mp3"),
  asset("/sounds/6.mp3"),
  asset("/sounds/7.mp3"),
  asset("/sounds/1.mp3")
];

let audioCtx: AudioContext | null = null;

function playFallbackBeep() {
  if (typeof window === "undefined") return;

  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext ||
        // @ts-expect-error webkit fallback for older browsers
        window.webkitAudioContext)();
    }

    const ctx = audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Randomly choose one of a few short beep patterns
    const pattern = Math.floor(Math.random() * 3);

    osc.type = pattern === 0 ? "square" : pattern === 1 ? "triangle" : "sawtooth";

    // Base pitch
    const baseFreq = pattern === 0 ? 600 : pattern === 1 ? 500 : 700;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.linearRampToValueAtTime(baseFreq * 1.8, now + 0.12);
    osc.frequency.linearRampToValueAtTime(baseFreq * 0.9, now + 0.24);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.03);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.22);
    gain.gain.linearRampToValueAtTime(0, now + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch {
    // If AudioContext fails (e.g. restricted), just silently ignore
  }
}

function playRandomSound() {
  if (typeof window === "undefined") return;

  try {
    const randomIndex = Math.floor(Math.random() * SOUND_PATHS.length);
    const src = SOUND_PATHS[randomIndex];
    const audio = new Audio(src);
    audio.play().catch(() => {
      // If the file is missing or blocked, fall back to generated beep
      playFallbackBeep();
    });
  } catch {
    playFallbackBeep();
  }
}

export function AttendanceChoice() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showMosqueDialog, setShowMosqueDialog] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [showReliefEmoji, setShowReliefEmoji] = useState(false);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState<number | null>(null);
  const lightningAudioRef = useRef<HTMLAudioElement | null>(null);
  const heartAudioRef = useRef<HTMLAudioElement | null>(null);
  const natureAudioRef = useRef<HTMLAudioElement | null>(null);
  const natureTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [remainingIndexes, setRemainingIndexes] = useState<number[]>(
    () => BADGE_MESSAGES.map((_, index) => index),
  );

  const badgeMessage = useMemo(
    () => (currentBadgeIndex == null ? null : BADGE_MESSAGES[currentBadgeIndex]),
    [currentBadgeIndex],
  );

  useEffect(() => {
    if (badgeMessage == null) return;

    const timeout = setTimeout(() => {
      setCurrentBadgeIndex(null);
    }, 4000);

    return () => clearTimeout(timeout);
  }, [badgeMessage]);

  useEffect(() => {
    if (!showSuccessPopup) return;
    const timeout = setTimeout(() => setShowSuccessPopup(false), 5000);
    return () => clearTimeout(timeout);
  }, [showSuccessPopup]);

  useEffect(() => {
    if (!showReliefEmoji) return;
    const timeout = setTimeout(() => setShowReliefEmoji(false), 5000);
    return () => clearTimeout(timeout);
  }, [showReliefEmoji]);

  useEffect(() => {
    if (!showMosqueDialog) return;
    const lightning = new Audio(asset("/sounds/lightning.mp3"));
    const heart = new Audio(asset("/sounds/heart-beating.mp3"));
    lightningAudioRef.current = lightning;
    heartAudioRef.current = heart;
    lightning.play().catch(() => {});
    heart.loop = true;
    heart.play().catch(() => {});
    return () => {
      lightning.pause();
      heart.pause();
      lightningAudioRef.current = null;
      heartAudioRef.current = null;
    };
  }, [showMosqueDialog]);

  const stopMosqueSounds = () => {
    if (heartAudioRef.current) {
      heartAudioRef.current.pause();
      heartAudioRef.current = null;
    }
    if (lightningAudioRef.current) {
      lightningAudioRef.current.pause();
      lightningAudioRef.current = null;
    }
  };

  const stopNatureSound = () => {
    if (natureTimeoutRef.current) {
      clearTimeout(natureTimeoutRef.current);
      natureTimeoutRef.current = null;
    }
    if (natureAudioRef.current) {
      natureAudioRef.current.pause();
      natureAudioRef.current.currentTime = 0;
      natureAudioRef.current = null;
    }
  };

  const playWarmNatureShort = () => {
    stopNatureSound();
    try {
      const n = new Audio(asset("/sounds/warm-nature.mp3"));
      natureAudioRef.current = n;
      n.play().catch(() => {});
      natureTimeoutRef.current = setTimeout(() => {
        stopNatureSound();
      }, 5000);
    } catch {
      // ignore
    }
  };

  const handleMosqueCloseWithRelief = () => {
    stopMosqueSounds();
    setShowMosqueDialog(false);
    setShowReliefEmoji(true);
    playWarmNatureShort();
  };

  const handleMosqueClick = () => {
    stopNatureSound();
    setShowReliefEmoji(false);
    setShowMosqueDialog(true);
  };

  const handleMosqueCancel = () => {
    handleMosqueCloseWithRelief();
  };

  const handleMosqueAyoh = () => {
    stopMosqueSounds();
    setShowMosqueDialog(false);
    try {
      const doorSlam = new Audio(asset("/sounds/mosque-quiz/answers/door-slam.mp3"));
      doorSlam.play().catch(() => {});
    } catch {
      // ignore
    }
    setShowTransition(true);
  };

  const handleHouseClick = () => {
    setDialogOpen(true);
  };

  const showNextBadgeMessage = () => {
    setRemainingIndexes((prev) => {
      const pool = prev.length > 0 ? prev : BADGE_MESSAGES.map((_, index) => index);
      const randomIndex = Math.floor(Math.random() * pool.length);
      const chosen = pool[randomIndex];

      setCurrentBadgeIndex(chosen);

      return pool.filter((index) => index !== chosen);
    });
  };

  const handleDialogNo = () => {
    setDialogOpen(false);
    playRandomSound();
    showNextBadgeMessage();
  };

  const handleDialogYes = () => {
    setDialogOpen(false);
    setGuestName("");
    setNameError(null);
    setShowNameDialog(true);
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGuestName(event.target.value);
    if (nameError) {
      setNameError(null);
    }
  };

  const handleSubmitName = async () => {
    const trimmed = guestName.trim();
    if (!trimmed) {
      setNameError("لازم نعرف اسم المزموزيل الأول");
      return;
    }

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const rsvpTemplateId =
      process.env.NEXT_PUBLIC_EMAILJS_RSVP_TEMPLATE_ID ||
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !rsvpTemplateId || !publicKey) {
      setNameError("الإرسال مش شغال دلوقتي. تواصلي مع صاحب الموقع.");
      return;
    }

    try {
      setIsSending(true);
      await emailjs.send(serviceId, rsvpTemplateId, { name: trimmed }, publicKey);
      setShowNameDialog(false);
      setGuestName("");
      setShowSuccessPopup(true);
      try {
        const audio = new Audio(asset("/sounds/email sent.mp3"));
        audio.play().catch(() => {});
      } catch {
        // ignore
      }
    } catch {
      setNameError("حصلت مشكلة صغيرة فى الإرسال، جربى تانى بعد شوية.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section
      id="bride-groom"
      className="relative scroll-mt-16 px-4 py-16"
      aria-label="اختيار مكان الحضور"
    >
      <div className="pointer-events-none absolute inset-0 ishhar-corner opacity-30" aria-hidden />

      <div className="container relative z-10 mx-auto max-w-4xl text-center">
        <h2 className="mb-10 text-2xl font-bold text-foreground md:text-3xl">
          إن شاء الله هحضر فى....
        </h2>

        <div className="grid gap-6 md:grid-cols-2 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <Button
              type="button"
              variant="outline"
              className="group flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-primary/30 bg-background/80 p-6 text-lg font-semibold text-primary shadow-sm transition-all hover:-translate-y-1 hover:border-primary hover:bg-primary/10 hover:shadow-lg"
              onClick={handleMosqueClick}
            >
              <span className="flex items-center justify-center">
                <span className="inline-flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-4xl shadow-inner shadow-primary/30 transition-transform group-hover:scale-110">
                  🕌
                </span>
              </span>
              <span className="leading-relaxed">المسجد عشان أسمع الخطبة</span>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="h-full"
          >
            <Button
              type="button"
              variant="secondary"
              className="group flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-secondary/40 bg-secondary/80 p-6 text-lg font-semibold text-secondary-foreground shadow-sm transition-all hover:-translate-y-1 hover:border-secondary hover:bg-secondary hover:shadow-lg"
              onClick={handleHouseClick}
            >
              <span className="flex items-center justify-center">
                <span className="inline-flex size-16 items-center justify-center rounded-3xl bg-background/80 text-4xl shadow-inner shadow-secondary/40 transition-transform group-hover:scale-110">
                  🏠
                </span>
              </span>
              <span className="leading-relaxed">البيت عند منة</span>
            </Button>
          </motion.div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.7 }}
            className="space-y-6"
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                هل متأكدة 100% من القرار المصيرى ده؟
              </DialogTitle>
            </DialogHeader>
            <DialogFooter className="mt-2 flex flex-row justify-center gap-4">
              <motion.button
                type="button"
                onClick={handleDialogYes}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.96, y: 0 }}
                className="inline-flex items-center justify-center rounded-xl border-2 border-secondary/40 bg-background px-5 py-2 text-sm font-semibold text-secondary-foreground shadow-sm transition-colors hover:border-secondary hover:bg-secondary/10"
              >
                😇 نعم
              </motion.button>
              <motion.button
                type="button"
                onClick={handleDialogNo}
                whileHover={{ scale: 1.08, rotate: [-2, 2, -1, 1, 0] }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center rounded-xl bg-red-700 px-5 py-2 text-sm font-semibold text-red-50 shadow-md shadow-red-700/40 transition-colors hover:bg-red-600"
              >
                😈 لا
              </motion.button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showMosqueDialog}
        onOpenChange={(open) => {
          if (!open) handleMosqueCloseWithRelief();
          else {
            stopNatureSound();
            setShowReliefEmoji(false);
            setShowMosqueDialog(open);
          }
        }}
      >
        <DialogContent
          className="mosque-dialog-close-light border-2 border-zinc-600 bg-zinc-900 text-zinc-100 text-center"
          overlayClassName="bg-black/85 backdrop-blur-md"
        >
          <div className="mosque-modal-inner">
            <motion.div
              initial={{ opacity: 0.95 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="space-y-6 py-2"
            >
              <DialogHeader>
                <div className="flex flex-col gap-2 text-center">
                  <DialogTitle className="text-xl font-bold text-zinc-50">متأكدة؟</DialogTitle>
                  <p className="text-lg font-semibold">فعلا؟</p>
                  <p className="text-lg font-semibold">بجد؟</p>
                  <p className="text-base text-zinc-400">مفيش حد مهددك....؟</p>
                </div>
              </DialogHeader>
              <div className="mt-4 flex flex-row justify-center gap-4">
                <motion.button
                  type="button"
                  onClick={handleMosqueCancel}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-zinc-500 bg-zinc-800 px-5 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700"
                >
                  لا خلاص فى ايه! 😱
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleMosqueAyoh}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
                >
                  أيوه ... 💪
                </motion.button>
              </div>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showNameDialog}
        onOpenChange={(open) => {
          setShowNameDialog(open);
          if (!open) setNameError(null);
        }}
      >
        <DialogContent className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, mass: 0.7 }}
            className="space-y-6"
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                اسم المزموزيل ....؟
              </DialogTitle>
            </DialogHeader>

            <motion.div
              animate={
                nameError
                  ? { x: [0, -6, 6, -4, 4, 0] }
                  : { x: 0 }
              }
              transition={{ duration: 0.4 }}
              className="space-y-2"
            >
              <input
                dir="rtl"
                value={guestName}
                onChange={handleNameChange}
                placeholder="ابصمى هنا"
                className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {nameError && (
                <p className="text-xs font-medium text-red-600">{nameError}</p>
              )}
            </motion.div>

            <div className="mt-2 flex flex-row justify-center gap-4">
              <motion.button
                type="button"
                disabled={isSending}
                onClick={handleSubmitName}
                whileHover={isSending ? {} : { scale: 1.05, y: -2 }}
                whileTap={isSending ? {} : { scale: 0.96, y: 0 }}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/40 disabled:opacity-60"
              >
                {isSending ? "جارى الإرسال..." : "تلبية الدعوة"}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setShowNameDialog(false)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground"
              >
                إلغاء
              </motion.button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="text-center border-2 border-primary/30">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="space-y-6 py-2"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="text-5xl"
              aria-hidden
            >
              ✉️
            </motion.div>
            <DialogHeader className="text-center">
              <DialogTitle className="text-xl font-bold text-primary">
                تم! الدعوة اتبعت والبيت يستنيكي
              </DialogTitle>
            </DialogHeader>
            <p className="text-center text-muted-foreground text-sm">
              منة وعمر هيسعدوا بيكي إن شاء الله
            </p>
            <motion.button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
            >
              فل 🌸
            </motion.button>
          </motion.div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {badgeMessage && (
          <motion.div
            key={badgeMessage.text}
            initial={{ opacity: 0, scale: 0.7, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 40 }}
            transition={{ type: "spring", stiffness: 450, damping: 24, mass: 0.7 }}
            className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"
            aria-live="polite"
          >
            <motion.div
              className="pointer-events-auto inline-flex max-w-xl items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-2 shadow-lg shadow-primary/40"
              animate={{
                y: [0, -4, 0],
                rotate: [0, -2, 2, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
            >
              <span className="text-xl" aria-hidden>
                {badgeMessage.icon}
              </span>
              <span className="text-sm font-medium">{badgeMessage.text}</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReliefEmoji && (
          <motion.div
            key="relief"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="pointer-events-none fixed inset-x-0 bottom-8 z-40 flex justify-center px-4"
            aria-live="polite"
          >
            <motion.div
              className="inline-flex items-center justify-center rounded-full bg-secondary/90 px-6 py-3 text-4xl shadow-lg border border-border"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              😌
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTransition && (
          <motion.div
            className="fixed inset-0 z-100 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onAnimationComplete={() => {
              router.push("/mosque-quiz");
            }}
            aria-hidden
          />
        )}
      </AnimatePresence>
    </section>
  );
}

