"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DropZone from "@/components/DropZone";
import ResultCard from "@/components/ResultCard";
import ProgressBar from "@/components/ProgressBar";
import type { VerificationResult } from "@/lib/types";

type AppState = "idle" | "verifying" | "result" | "error";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Compress image client-side to keep payload under 4MB (Vercel body limit).
// Reads EXIF via original file, sends compressed copy to API.
function compressImage(dataUrl: string, maxDimension = 2048, quality = 0.88): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl); // fallback to original
    img.src = dataUrl;
  });
}

export default function Home() {
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setState("verifying");
    setErrorMessage(null);

    let dataUrl: string;
    try {
      dataUrl = await fileToDataUrl(file);
    } catch {
      setState("error");
      setErrorMessage("Could not read the file. Please try again.");
      return;
    }

    // Show preview for images only
    if (file.type.startsWith("image/")) {
      setPreviewUrl(dataUrl);
      // Compress before sending to stay under Vercel's 4MB body limit
      dataUrl = await compressImage(dataUrl);
    } else {
      setPreviewUrl(null);
    }

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          dataUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      setResult(data);
      setState("result");
    } catch (e: unknown) {
      setState("error");
      setErrorMessage(
        e instanceof Error ? e.message : "Verification failed. Please try again."
      );
    }
  }, []);

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setPreviewUrl(null);
    setErrorMessage(null);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white tracking-tight">TrustMark</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/30">
          <span className="hidden sm:inline">Media authenticity verification</span>
          <a href="/api/health" className="hover:text-white/60 transition-colors">Status</a>
        </div>
      </header>

      {/* Hero */}
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.section
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-4 py-16"
          >
            <div className="w-full max-w-2xl mx-auto space-y-10">
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="inline-block text-xs font-semibold tracking-widest text-blue-400/80 uppercase bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-4">
                    Phase 1 · Media Verifier
                  </span>
                  <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
                    Is this image{" "}
                    <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                      real?
                    </span>
                  </h1>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg text-white/40 max-w-md mx-auto"
                >
                  Verify any image, video, or document in seconds. Check for AI generation,
                  provenance signatures, and metadata integrity.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <DropZone onFile={handleFile} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center gap-8 text-xs text-white/20"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  Never stored server-side
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  C2PA provenance check
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  AI generation detection
                </span>
              </motion.div>
            </div>
          </motion.section>
        )}

        {state === "verifying" && (
          <motion.section
            key="verifying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-4 py-16"
          >
            <div className="w-full max-w-md mx-auto space-y-6 text-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Verifying…</h2>
                <p className="text-white/40 text-sm mt-1">This usually takes under 3 seconds</p>
              </div>
              {previewUrl && (
                <div className="relative mx-auto w-32 h-32 rounded-xl overflow-hidden ring-1 ring-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <svg className="w-8 h-8 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  </div>
                </div>
              )}
              <ProgressBar />
            </div>
          </motion.section>
        )}

        {state === "error" && (
          <motion.section
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center px-4 py-16"
          >
            <div className="w-full max-w-md mx-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto">
                <span className="text-3xl font-black text-red-400">!</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Verification failed</h2>
                <p className="text-white/40 text-sm mt-2 max-w-sm mx-auto">
                  {errorMessage ?? "Something went wrong. Please try a different file."}
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-8 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors text-sm font-medium"
              >
                Try again
              </button>
            </div>
          </motion.section>
        )}

        {state === "result" && result && (
          <motion.section
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 px-4 py-10"
          >
            <div className="w-full max-w-2xl mx-auto">
              <ResultCard result={result} previewUrl={previewUrl} onReset={handleReset} />
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs text-white/20">
        <span>TrustMark · Stateless · Privacy-first</span>
        <span>No images stored · Ever</span>
      </footer>
    </main>
  );
}
