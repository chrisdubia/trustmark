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
    <div style={{ width: "100%", paddingTop: 24, paddingBottom: 24 }}>
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 10,
        color: "#8A8880",
        textAlign: "center",
        marginBottom: 16,
      }}>
        {STEPS[stepIndex]?.label}
      </div>

      {/* Progress bar */}
      <div style={{
        height: 1,
        background: "#D8D5CE",
        position: "relative",
        overflow: "hidden",
      }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            background: "#1C1C1A",
          }}
        />
      </div>

      {/* Step squares */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: 12,
      }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: 6,
              height: 6,
              background: i <= stepIndex ? "#1C1C1A" : "#D8D5CE",
              transition: "background 0.3s",
              flexShrink: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}
