"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { VerificationResult } from "@/lib/types";

interface ShareCardProps {
  result: VerificationResult;
  previewUrl: string | null;
}

const VERDICT_COLORS = {
  VERIFIED: { text: "text-green-400", bg: "bg-green-500/15", border: "border-green-500/30" },
  MODIFIED: { text: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30" },
  SYNTHETIC: { text: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30" },
  UNKNOWN: { text: "text-gray-400", bg: "bg-gray-500/15", border: "border-gray-500/30" },
};

const VERDICT_ICONS = { VERIFIED: "✓", MODIFIED: "⚠", SYNTHETIC: "✕", UNKNOWN: "?" };

export default function ShareCard({ result, previewUrl }: ShareCardProps) {
  const [copied, setCopied] = useState(false);
  const colors = VERDICT_COLORS[result.verdict];
  const icon = VERDICT_ICONS[result.verdict];
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/verify/${result.id}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl border ${colors.bg} ${colors.border} overflow-hidden`}
    >
      <div className="flex items-stretch">
        {previewUrl && (
          <div className="w-24 shrink-0 bg-black/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Verified media thumbnail"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-2xl font-black ${colors.text}`}>{icon}</span>
            <span className={`text-lg font-black tracking-tight ${colors.text}`}>
              {result.verdict}
            </span>
            <span className="text-white/30 text-sm ml-auto">{result.confidence}% confidence</span>
          </div>

          <p className="text-xs text-white/40 mb-3">
            {result.fileInfo.name} · verified by TrustMark
          </p>

          <div className="flex items-center gap-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 text-xs px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white/50 truncate"
            />
            <button
              onClick={handleCopy}
              className={[
                "px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0",
                copied
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-white/10 text-white/60 hover:text-white border border-white/10",
              ].join(" ")}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
