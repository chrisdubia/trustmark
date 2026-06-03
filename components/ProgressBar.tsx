"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const STEPS = [
  { label: "Reading file…", duration: 400 },
  { label: "Scanning C2PA manifest…", duration: 700 },
  { label: "Extracting EXIF metadata…", duration: 500 },
  { label: "Running AI detection…", duration: 900 },
  { label: "Computing verdict…", duration: 300 },
];

export default function ProgressBar() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let total = 0;
    const totalDuration = STEPS.reduce((s, st) => s + st.duration, 0);
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((step, i) => {
      const t = setTimeout(() => {
        setStepIndex(i);
        const pct = Math.round(((total + step.duration / 2) / totalDuration) * 95);
        setProgress(pct);
      }, total);
      timers.push(t);
      total += step.duration;
    });

    const final = setTimeout(() => setProgress(99), total);
    timers.push(final);

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full space-y-4 py-8">
      <div className="flex items-center justify-center gap-3">
        <svg className="w-5 h-5 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="text-sm text-white/60">{STEPS[stepIndex]?.label}</span>
      </div>

      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
        />
      </div>

      <div className="flex justify-between">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              i <= stepIndex ? "bg-blue-400" : "bg-white/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
