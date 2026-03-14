"use client";

import { useEffect, useState } from "react";
import { getRemaining, isDone } from "@/lib/countdown";

export function useCountdown(targetDate: Date) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 16); // ~60fps for smooth ms/µs
    return () => clearInterval(interval);
  }, []);

  const done = isDone(targetDate, now);
  const remaining = getRemaining(targetDate, now);
  return { done, remaining, now };
}
