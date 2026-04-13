"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export default function AnimatedCounter({ target, suffix = "", prefix = "", duration = 2000 }: Props) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;

    const steps = 60;
    const stepDuration = duration / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      // Ease-out curve
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * target);
      setCount(current);

      if (step >= steps) {
        setCount(target);
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {prefix}{count}{suffix}
    </span>
  );
}
