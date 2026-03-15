"use client";

import emailjs from "@emailjs/browser";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { asset, homeHref } from "@/lib/assets";
import { MOSQUE_QUIZ_QUESTIONS as QUESTIONS } from "@/lib/mosque-quiz-questions";

const WOLF_SOUNDS = [
  asset("/sounds/mosque-quiz/wolf-1.mp3"),
  asset("/sounds/mosque-quiz/wolf-2.mp3"),
  asset("/sounds/mosque-quiz/wolf-3.mp3"),
];

const ANSWER_SOUNDS = [
  asset("/sounds/mosque-quiz/answers/angry-cat.mp3"),
  asset("/sounds/mosque-quiz/answers/angry-elephant.mp3"),
  asset("/sounds/mosque-quiz/answers/annoying birds.mp3"),
  asset("/sounds/mosque-quiz/answers/fingers-tipping-annoying.mp3"),
  asset("/sounds/mosque-quiz/answers/metal-squeez.mp3"),
  asset("/sounds/mosque-quiz/answers/toy-squeezing.mp3"),
  asset("/sounds/mosque-quiz/answers/wow-annoying.mp3"),
];

type Phase = "intro" | "quiz" | "result";

const DRESS_CODE_BADGE_OPTION_0 = [
  "سبحان الله!",
  "فيه اه عادى جدا فعلا مش غريبة ومش مريبة ومش عجيبة",
  "كلام ربنا مش كلامنا",
  "فليخرجن تفلات",
] as const;

const MIKUP_BADGE_OPTION_2 = ["😂😂😂", "🤣🤣🤣", "همووت"];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function computeScoreFromAnswers(answersByQuestion: Record<number, number>): number {
  return QUESTIONS.reduce((acc, question, idx) => {
    const sel = answersByQuestion[idx];
    if (sel === undefined) return acc;
    const isCorrect = question.acceptAny
      ? true
      : question.correctIndices
        ? question.correctIndices.includes(sel)
        : sel === question.correctIndex;
    return acc + (isCorrect ? 1 : 0);
  }, 0);
}

function playRandomFromList(list: string[], volume = 0.4) {
  try {
    const src = list[Math.floor(Math.random() * list.length)];
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
}

export default function MosqueQuizPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<number, number>>({});
  const [transitioning, setTransitioning] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmFirstName, setConfirmFirstName] = useState("");
  const [confirmLastName, setConfirmLastName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [resultRevealed, setResultRevealed] = useState(false);
  const [showRejectedVideo, setShowRejectedVideo] = useState(false);
  const selectedOption = answersByQuestion[currentQ] ?? null;
  const [badgeMessages, setBadgeMessages] = useState<Record<number, string>>({});
  const [hoveredSpecialOption, setHoveredSpecialOption] = useState<number | null>(null);
  const [quizImageError, setQuizImageError] = useState(false);

  const rainRef = useRef<HTMLAudioElement | null>(null);
  const cricketsRef = useRef<HTMLAudioElement | null>(null);
  const wolfTimeoutRef = useRef<number | null>(null);
  const remainingAnswerSoundIndexes = useRef<number[]>(
    ANSWER_SOUNDS.map((_, i) => i),
  );
  const firstAnswerSoundPlayed = useRef(false);
  const satanAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const rain = new Audio(asset("/sounds/mosque-quiz/rain-lightning.mp3"));
    rain.loop = true;
    rain.volume = 0.25;
    rainRef.current = rain;
    rain.play().catch(() => {});

    const crickets = new Audio(asset("/sounds/mosque-quiz/answers/crickets.mp3"));
    crickets.loop = true;
    crickets.volume = 0.15;
    cricketsRef.current = crickets;
    crickets.play().catch(() => {});

    const scheduleNextWolf = () => {
      const delay = 8000 + Math.random() * 12000;
      return window.setTimeout(() => {
        playRandomFromList(WOLF_SOUNDS, 0.4);
        wolfTimeoutRef.current = scheduleNextWolf();
      }, delay);
    };
    wolfTimeoutRef.current = scheduleNextWolf();

    return () => {
      rain.pause();
      rainRef.current = null;
      crickets.pause();
      cricketsRef.current = null;
      if (wolfTimeoutRef.current) {
        clearTimeout(wolfTimeoutRef.current);
        wolfTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const tryPlayAmbient = () => {
      const rain = rainRef.current;
      const crickets = cricketsRef.current;
      if (rain?.paused) rain.play().catch(() => {});
      if (crickets?.paused) crickets.play().catch(() => {});
    };
    const opts = { once: true, capture: true };
    window.addEventListener("click", tryPlayAmbient, opts);
    window.addEventListener("touchstart", tryPlayAmbient, opts);
    window.addEventListener("keydown", tryPlayAmbient, opts);
    return () => {
      window.removeEventListener("click", tryPlayAmbient, opts);
      window.removeEventListener("touchstart", tryPlayAmbient, opts);
      window.removeEventListener("keydown", tryPlayAmbient, opts);
    };
  }, []);

  useEffect(() => {
    if (phase !== "intro") return;
    const timeout = setTimeout(() => setPhase("quiz"), 4000);
    return () => clearTimeout(timeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== "result") {
      setResultRevealed(false);
      return;
    }
    const timeout = setTimeout(() => setResultRevealed(true), 2200);
    return () => clearTimeout(timeout);
  }, [phase]);

  const getBadgeTextForOption = useCallback((optionIndex: number): string | null => {
    if (currentQ === 1) {
      if (optionIndex === 0)
        return DRESS_CODE_BADGE_OPTION_0[Math.floor(Math.random() * DRESS_CODE_BADGE_OPTION_0.length)];
      if (optionIndex === 7) return "الله يعوض عليكى";
    } else if (currentQ === 2 && optionIndex === 2) {
      return MIKUP_BADGE_OPTION_2[Math.floor(Math.random() * MIKUP_BADGE_OPTION_2.length)];
    }
    return null;
  }, [currentQ]);

  const handleSelectOption = useCallback(
    (optionIndex: number) => {
      if (transitioning) return;
      if (currentQ === 1) {
        const wasSatan = answersByQuestion[currentQ] === 8;
        if (wasSatan && optionIndex !== 8) {
          const satan = satanAudioRef.current;
          if (satan) {
            satan.pause();
            satan.currentTime = 0;
            satanAudioRef.current = null;
          }
        }
      }
      setAnswersByQuestion((prev) => ({ ...prev, [currentQ]: optionIndex }));
      const badge = getBadgeTextForOption(optionIndex);
      if (badge) {
        setBadgeMessages((prev) => ({ ...prev, [optionIndex]: badge }));
      }
      if (currentQ === 1 && optionIndex === 8) {
        try {
          let audio = satanAudioRef.current;
          if (audio) {
            audio.pause();
            audio.currentTime = 0;
          } else {
            audio = new Audio(asset("/sounds/mosque-quiz/satan.mp3"));
            audio.volume = 0.5;
            satanAudioRef.current = audio;
          }
          audio.play().catch(() => {});
        } catch {
          // ignore
        }
      }
    },
    [transitioning, currentQ, getBadgeTextForOption, answersByQuestion],
  );

  const playAnswerSoundOnce = useCallback(() => {
    const ANGRY_CAT_INDEX = 0;
    if (!firstAnswerSoundPlayed.current) {
      firstAnswerSoundPlayed.current = true;
      remainingAnswerSoundIndexes.current = remainingAnswerSoundIndexes.current.filter(
        (i) => i !== ANGRY_CAT_INDEX,
      );
      try {
        const audio = new Audio(ANSWER_SOUNDS[ANGRY_CAT_INDEX]);
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {
        // ignore
      }
      return;
    }
    let pool = remainingAnswerSoundIndexes.current;
    if (pool.length === 0) {
      pool = ANSWER_SOUNDS.map((_, i) => i).filter((i) => i !== ANGRY_CAT_INDEX);
      remainingAnswerSoundIndexes.current = pool;
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[randomIndex];
    remainingAnswerSoundIndexes.current = pool.filter((i) => i !== chosen);
    try {
      const audio = new Audio(ANSWER_SOUNDS[chosen]);
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {
      // ignore
    }
  }, []);

  const handleNext = useCallback(() => {
    if (selectedOption === null || transitioning) return;
    playAnswerSoundOnce();
    setTransitioning(true);
    setTimeout(() => {
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ((q) => q + 1);
        setTransitioning(false);
      } else {
        setTransitioning(false);
        setSubmitError(null);
        setShowConfirmationModal(true);
      }
    }, 500);
  }, [selectedOption, transitioning, currentQ]);

  const handlePrevious = useCallback(() => {
    if (transitioning) return;
    setCurrentQ((q) => Math.max(0, q - 1));
  }, [transitioning]);

  const handleConfirmationSubmit = useCallback(async () => {
    const first = confirmFirstName.trim();
    const last = confirmLastName.trim();
    if (!first) {
      setSubmitError("الاسم الأول مطلوب");
      return;
    }
    if (!last) {
      setSubmitError("الاسم التاني مطلوب");
      return;
    }

    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      setSubmitError("الإعدادات ناقصة، تواصل مع صاحب الموقع.");
      return;
    }

    setSubmitError(null);
    setIsSending(true);
    try {
      const fullName = `${first} ${last}`;
      const now = new Date();
      const timeStr = now.toLocaleString("ar-EG", {
        dateStyle: "full",
        timeStyle: "short",
      });

      const computedScore = computeScoreFromAnswers(answersByQuestion);
      const accepted = computedScore === QUESTIONS.length;

      const quizRows = QUESTIONS.map((q, idx) => {
        const optIndex = answersByQuestion[idx];
        const optText =
          typeof optIndex === "number" && q.options[optIndex] != null
            ? q.options[optIndex]
            : "—";
        return `
        <tr>
          <td style="padding:12px 14px; border:1px solid #e4d6c7; background:#fefcf9; font-size:14px; color:#3a2a18; vertical-align:top; width:28px;">${idx + 1}</td>
          <td style="padding:12px 14px; border:1px solid #e4d6c7; background:#fefcf9; font-size:14px; color:#3a2a18;">${escapeHtml(q.text)}</td>
          <td style="padding:12px 14px; border:1px solid #e4d6c7; background:#fff8f0; font-size:14px; color:#4a3420; border-right:3px solid #c9a86c;">${escapeHtml(optText)}</td>
        </tr>`;
      }).join("");

      const resultText = accepted
        ? "مبروك، تم قبولها بالمسجد"
        : "غير مقبولة بالمسجد (البيت عند منة مستنياها)";

      // Template: copy HTML from public/emailjs-quiz-template.html into EmailJS. Use {{{quiz_rows}}} (triple braces) for the table body.
      await emailjs.send(
        serviceId,
        templateId,
        {
          name: fullName,
          time: timeStr,
          quiz_rows: quizRows,
          score: String(computedScore),
          total: String(QUESTIONS.length),
          result_text: resultText,
        },
        publicKey,
      );

      setScore(computedScore);
      setShowConfirmationModal(false);
      setConfirmFirstName("");
      setConfirmLastName("");
      setPhase("result");
      try {
        const audio = new Audio(asset("/sounds/email sent.mp3"));
        audio.play().catch(() => {});
      } catch {
        // ignore
      }
    } catch {
      setSubmitError("حصلت مشكلة صغيرة فى الإرسال، جربى تانى بعد شوية.");
    } finally {
      setIsSending(false);
    }
  }, [confirmFirstName, confirmLastName, answersByQuestion]);

  const handleConfirmationCancel = useCallback(() => {
    setShowConfirmationModal(false);
    setSubmitError(null);
  }, []);

  const question = QUESTIONS[currentQ];
  const passed = score === QUESTIONS.length;

  const optionLabels = ["أ", "ب", "ج", "د", "ه", "و", "ز", "ح", "ط"];
  const isDressCodeQuestion = currentQ === 1;
  const specialOptionNoNext = isDressCodeQuestion && (selectedOption === 0 || selectedOption === 7);
  const isSpecialOption = (i: number) =>
    (currentQ === 1 && (i === 0 || i === 7)) || (currentQ === 2 && i === 2);
  const showBadgeForOption = useCallback((optionIndex: number) => {
    const badge = getBadgeTextForOption(optionIndex);
    if (badge) {
      setBadgeMessages((prev) => ({ ...prev, [optionIndex]: badge }));
    }
  }, [getBadgeTextForOption]);

  const hideBadge = useCallback((optionIndex: number) => {
    setHoveredSpecialOption(null);
    if (selectedOption !== optionIndex) {
      setBadgeMessages((prev) => {
        const next = { ...prev };
        delete next[optionIndex];
        return next;
      });
    }
  }, [selectedOption]);

  useEffect(() => {
    setBadgeMessages({});
    setHoveredSpecialOption(null);
    const satan = satanAudioRef.current;
    if (satan) {
      satan.pause();
      satan.currentTime = 0;
      satanAudioRef.current = null;
    }
  }, [currentQ]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div
        className="mosque-quiz-fog pointer-events-none fixed inset-0 z-0 bg-linear-to-b from-zinc-900/80 via-transparent to-zinc-950/80"
        aria-hidden
      />
      <div
        className="absolute inset-0 z-0 bg-linear-to-b from-zinc-950 via-zinc-900/95 to-zinc-950"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              className="max-w-2xl text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <motion.h1
                className="mb-4 text-3xl font-bold tracking-tight text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.35)] md:text-4xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                  y: 0,
                }}
                transition={{
                  opacity: {
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.3,
                  },
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
          )}

          {phase === "quiz" && (
            <motion.div
              key={`quiz-${currentQ}`}
              className="w-full max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: transitioning ? 0 : 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <div className="mb-8 text-center">
                <motion.div
                  className="mx-auto mb-6 overflow-hidden rounded-xl border-2 border-zinc-700/60 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {!quizImageError ? (
                    <img
                      src={asset("/images/quiz.png")}
                      alt="مين عاوز يروح المسجد!"
                      className="h-auto w-full max-h-44 max-w-2xl object-contain"
                      onError={() => setQuizImageError(true)}
                    />
                  ) : (
                    <div className="flex max-h-44 min-h-28 items-center justify-center bg-zinc-800/50 px-6 py-4 text-center text-lg font-medium text-zinc-200">
                      مين عاوز يروح المسجد!
                    </div>
                  )}
                </motion.div>

                <div className="mx-auto mb-6 flex items-center justify-center gap-2">
                  {QUESTIONS.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-8 rounded-full transition-colors duration-300 ${
                        i < currentQ
                          ? "bg-red-500"
                          : i === currentQ
                            ? "bg-red-500/60"
                            : "bg-zinc-700"
                      }`}
                    />
                  ))}
                </div>

                <motion.div
                  className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-4 py-1.5 text-xs text-zinc-400"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span>السؤال {currentQ + 1}</span>
                  <span className="text-zinc-600">من</span>
                  <span>{QUESTIONS.length}</span>
                </motion.div>
              </div>

              <motion.div
                className="quiz-question-diamond relative mb-10 rounded-xl border border-zinc-700/50 bg-zinc-900/90 px-6 py-8 text-center shadow-[0_0_40px_rgba(0,0,0,0.5)]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <div className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 border-l border-t border-zinc-700/50 bg-zinc-900/90" />
                <h2 className="text-xl font-bold leading-relaxed text-zinc-50 md:text-2xl">
                  {question.text}
                </h2>
              </motion.div>

              <div className="grid items-stretch gap-3 sm:grid-cols-2">
                {question.options.map((option, i) => {
                  const isSelected = selectedOption === i;
                  const isSpecialOptionForButton = isSpecialOption(i);
                  const thisBadge = badgeMessages[i] ?? null;
                  const showBadgeAboveThisOption =
                    isSpecialOptionForButton &&
                    thisBadge &&
                    (selectedOption === i || hoveredSpecialOption === i);
                  const optionStyle = isSelected
                    ? "border-primary/70 bg-zinc-800 ring-2 ring-primary/30"
                    : "border-zinc-700/60 bg-zinc-800/70 hover:border-zinc-500 hover:bg-zinc-800";

                  const isFullWidthOption = isDressCodeQuestion && i === 8;

                  return (
                    <div
                      key={i}
                      className={`relative flex min-h-0 flex-col ${isFullWidthOption ? "col-span-2" : ""}`}
                    >
                      {showBadgeAboveThisOption && (
                        <motion.div
                          className="absolute bottom-full left-1/2 z-10 mb-2 max-w-[18rem] -translate-x-1/2 rounded-xl border border-amber-500/40 bg-amber-950/90 px-4 py-2 text-center text-sm font-medium text-amber-200 shadow-lg"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 4 }}
                          transition={{ duration: 0.2 }}
                        >
                          {thisBadge}
                        </motion.div>
                      )}
                      <motion.button
                        type="button"
                        disabled={transitioning}
                        onClick={() => handleSelectOption(i)}
                        onMouseEnter={() => {
                          if (isSpecialOptionForButton) {
                            setHoveredSpecialOption(i);
                            showBadgeForOption(i);
                          }
                        }}
                        onMouseLeave={() => {
                          if (isSpecialOptionForButton) hideBadge(i);
                        }}
                        className={`group relative flex min-h-0 w-full flex-1 items-start gap-3 rounded-xl border px-5 py-4 text-start text-sm font-medium transition-all duration-200 ${optionStyle} ${!transitioning ? "cursor-pointer" : "cursor-default"}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          opacity: { delay: 0.25 + i * 0.08 },
                          y: { delay: 0.25 + i * 0.08 },
                        }}
                        whileHover={!transitioning ? { scale: 1.02 } : {}}
                        whileTap={!transitioning ? { scale: 0.98 } : {}}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-700/50 text-xs font-bold text-zinc-400 group-hover:bg-zinc-600/50">
                          {optionLabels[i]}
                        </span>
                        <span className="leading-relaxed">{option}</span>
                      </motion.button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {currentQ > 0 && (
                  <motion.button
                    type="button"
                    disabled={transitioning}
                    onClick={handlePrevious}
                    className="rounded-xl border border-zinc-600 bg-zinc-800 px-6 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-700 disabled:opacity-50"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={!transitioning ? { scale: 1.02 } : {}}
                    whileTap={!transitioning ? { scale: 0.98 } : {}}
                  >
                    → السؤال اللي فات
                  </motion.button>
                )}
                <AnimatePresence>
                  {selectedOption !== null && !specialOptionNoNext && (
                    <motion.div
                      className="flex justify-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.25 }}
                    >
                      <motion.button
                        type="button"
                        disabled={transitioning}
                        onClick={handleNext}
                        className="rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 disabled:opacity-50"
                        whileHover={!transitioning ? { scale: 1.05 } : {}}
                        whileTap={!transitioning ? { scale: 0.98 } : {}}
                      >
                        اللى بعده
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {phase === "result" && (
            <motion.div
              key="result"
              className="max-w-lg text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {!resultRevealed ? (
                <motion.div
                  className="flex flex-col items-center gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-600 border-t-emerald-400"
                    aria-hidden
                  />
                  <p className="text-lg text-zinc-400">جاري تحميل النتيجة...</p>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    className="mb-6 text-7xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    {passed ? "🎉" : "🚪"}
                  </motion.div>

                  <motion.h2
                    className="mb-4 text-center text-3xl font-bold text-zinc-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    نتيجة التنسيق
                  </motion.h2>

                  {passed && (
                    <motion.p
                      className="mb-4 text-center text-xl font-semibold text-emerald-400"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      مبروك، تم قبولك بالمسجد
                    </motion.p>
                  )}

                  {!passed && (
                    <motion.p
                      className="mx-auto mb-4 max-w-sm text-center text-lg leading-relaxed text-zinc-300"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      لم يتم قبولك بالمسجد نظراً لإنك مذاكرتيش كويس. مستنيينك فى بيت منة تنورينا 🏠
                    </motion.p>
                  )}

                  <motion.p
                    className="mb-8 text-center text-sm text-zinc-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    النتيجة: {score} من {QUESTIONS.length}
                  </motion.p>

                  <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
                    <motion.a
                      href={homeHref()}
                      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-semibold shadow-lg transition-colors ${
                        passed
                          ? "bg-emerald-600 text-white hover:bg-emerald-500"
                          : "bg-red-600 text-white hover:bg-red-500"
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      {passed ? "تمام أوك ماشى" : "بينا على البيت"}
                    </motion.a>
                    <motion.button
                      type="button"
                      onClick={() => setShowRejectedVideo(true)}
                      className="shrink-0 rounded-xl border border-dashed border-zinc-500 bg-zinc-800/50 px-5 py-2.5 text-center text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 sm:text-start"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      هيحصل ايه لو جيت وملتزمتش بآداب المسجد؟
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
        <DialogContent
          className="max-w-md border-zinc-700 bg-zinc-900 text-zinc-100"
          overlayClassName="bg-black/70"
          onPointerDownOutside={(e) => {
            if (isSending) e.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-zinc-50">
              إقرار قبل النتيجة
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-zinc-300" dir="rtl">
            أقر أن المدعوة{" "}
            <input
              type="text"
              required
              placeholder="الاسم الأول"
              value={confirmFirstName}
              onChange={(e) => setConfirmFirstName(e.target.value)}
              className="mx-1 inline-block w-28 rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-zinc-100 placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              dir="rtl"
            />{" "}
            <input
              type="text"
              required
              placeholder="الاسم التاني"
              value={confirmLastName}
              onChange={(e) => setConfirmLastName(e.target.value)}
              className="mx-1 inline-block w-28 rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-zinc-100 placeholder:text-zinc-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              dir="rtl"
            />{" "}
            إنى هلتزم بكل إجابة اختارتها والله على ما أقول شهيد.
          </p>
          {submitError && (
            <p className="text-sm text-red-400" role="alert">
              {submitError}
            </p>
          )}
          <DialogFooter className="flex flex-row gap-2 sm:justify-end">
            <button
              type="button"
              onClick={handleConfirmationCancel}
              disabled={isSending}
              className="rounded-xl border border-zinc-600 bg-zinc-800 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirmationSubmit}
              disabled={isSending}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isSending ? "جاري الإرسال..." : "ابعت الإجابات لمنة"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectedVideo} onOpenChange={setShowRejectedVideo}>
        <DialogContent
          className="max-w-lg border-amber-500/30 bg-zinc-900 p-0 overflow-hidden"
          overlayClassName="bg-black/80"
        >
          <motion.div
            className="p-4"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
          >
            <video
              src={asset("/videos/rejected.mp4")}
              controls
              autoPlay
              playsInline
              className="w-full rounded-xl border-2 border-amber-500/20 shadow-lg"
              onEnded={() => {}}
            />
          </motion.div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
