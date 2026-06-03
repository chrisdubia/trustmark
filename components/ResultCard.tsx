"use client";

import { motion } from "framer-motion";
import type { VerificationResult } from "@/lib/types";

interface ResultCardProps {
  result: VerificationResult;
  previewUrl: string | null;
  onReset: () => void;
}

const VERDICT_CONFIG = {
  VERIFIED: {
    icon: "✓",
    label: "VERIFIED",
    sublabel: "Provenance intact",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    glow: "shadow-green-500/20",
    ring: "ring-green-500/20",
  },
  MODIFIED: {
    icon: "⚠",
    label: "MODIFIED",
    sublabel: "Edits detected",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    glow: "shadow-amber-500/20",
    ring: "ring-amber-500/20",
  },
  SYNTHETIC: {
    icon: "✕",
    label: "SYNTHETIC",
    sublabel: "AI-generated or no provenance",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    glow: "shadow-red-500/20",
    ring: "ring-red-500/20",
  },
  UNKNOWN: {
    icon: "?",
    label: "UNKNOWN",
    sublabel: "Cannot determine authenticity",
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
    glow: "shadow-gray-500/20",
    ring: "ring-gray-500/20",
  },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/40 shrink-0 w-40">{label}</span>
      {href ? (
        <a
          href={href} target="_blank" rel="noopener noreferrer"
          className="text-sm text-blue-400 hover:text-blue-300 text-right break-all"
        >
          {value} ↗
        </a>
      ) : (
        <span className="text-sm text-white/80 text-right break-all">{value}</span>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-1">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

export default function ResultCard({ result, previewUrl, onReset }: ResultCardProps) {
  const cfg = VERDICT_CONFIG[result.verdict];
  const { exif, c2pa, aiDetection, fileInfo, confidence } = result;

  const mapsUrl = exif?.gps
    ? `https://maps.google.com/?q=${exif.gps.lat},${exif.gps.lon}`
    : null;

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/verify/${result.id}`;

  const copyLink = () => navigator.clipboard.writeText(shareUrl);

  const shareText = `I verified this media with TrustMark — verdict: ${result.verdict}. ${shareUrl}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full space-y-4"
    >
      {/* Verdict hero */}
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={[
          "rounded-2xl border p-8 text-center",
          `shadow-2xl ${cfg.glow}`,
          cfg.bg, cfg.border,
        ].join(" ")}
      >
        <div className={`text-7xl font-black mb-2 ${cfg.color}`} aria-label={cfg.label}>
          {cfg.icon}
        </div>
        <h2 className={`text-4xl font-black tracking-tight ${cfg.color}`}>
          {cfg.label}
        </h2>
        <p className="text-white/50 mt-2 text-sm">{cfg.sublabel}</p>

        {/* Confidence bar */}
        <div className="mt-6 max-w-xs mx-auto">
          <div className="flex justify-between text-xs text-white/30 mb-2">
            <span>Confidence</span>
            <span className={`font-semibold ${cfg.color}`}>{confidence}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${cfg.color.replace("text-", "bg-")}`}
            />
          </div>
        </div>
      </motion.div>

      {/* Preview + file info */}
      {previewUrl && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="relative w-full max-h-64 bg-black flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Uploaded file preview"
              className="max-w-full max-h-64 object-contain"
            />
            <div className={[
              "absolute top-3 right-3 px-3 py-1.5 rounded-full",
              "text-xs font-bold tracking-wide",
              cfg.bg, cfg.border, cfg.color, "border",
            ].join(" ")}>
              {cfg.label}
            </div>
          </div>
          <div className="px-5 py-3 flex items-center justify-between text-xs text-white/30">
            <span>{fileInfo.name}</span>
            <span>{formatBytes(fileInfo.size)}</span>
          </div>
        </div>
      )}

      {/* Detail sections */}
      <div className="grid grid-cols-1 gap-4">

        {/* Device & capture */}
        {(exif?.make || exif?.model || exif?.dateTimeOriginal || exif?.gps) && (
          <Section title="Capture Info">
            {(exif.make || exif.model) && (
              <Row label="Device" value={[exif.make, exif.model].filter(Boolean).join(" ")} />
            )}
            {exif.lensModel && (
              <Row label="Lens" value={exif.lensModel} />
            )}
            {exif.dateTimeOriginal && (
              <Row label="Captured" value={formatDate(exif.dateTimeOriginal) ?? exif.dateTimeOriginal} />
            )}
            {exif.dateTimeModified && exif.dateTimeModified !== exif.dateTimeOriginal && (
              <Row label="Last modified" value={formatDate(exif.dateTimeModified) ?? exif.dateTimeModified} />
            )}
            {exif.width && exif.height && (
              <Row label="Resolution" value={`${exif.width} × ${exif.height} px`} />
            )}
            {(exif.aperture || exif.shutterSpeed || exif.iso || exif.focalLength) && (
              <Row
                label="Camera settings"
                value={[
                  exif.focalLength ? `${exif.focalLength}mm` : null,
                  exif.aperture ? `f/${exif.aperture}` : null,
                  exif.shutterSpeed ?? null,
                  exif.iso ? `ISO ${exif.iso}` : null,
                ].filter(Boolean).join("  ·  ")}
              />
            )}
            {exif.gps && mapsUrl && (
              <Row
                label="GPS coordinates"
                value={`${exif.gps.lat.toFixed(5)}, ${exif.gps.lon.toFixed(5)}`}
                href={mapsUrl}
              />
            )}
            {exif.altitude !== null && (
              <Row label="Altitude" value={`${exif.altitude} m`} />
            )}
            {exif.software && (
              <Row label="Software" value={exif.software} />
            )}
          </Section>
        )}

        {/* C2PA */}
        <Section title="Provenance (C2PA)">
          <Row label="Manifest present" value={c2pa?.hasCertificate ? "Yes" : "No"} />
          <Row label="Signature valid" value={c2pa?.valid ? "Yes" : "No"} />
          {c2pa?.issuer && <Row label="Issuer" value={c2pa.issuer} />}
          {c2pa?.claimGenerator && <Row label="Claim generator" value={c2pa.claimGenerator} />}
          {c2pa?.signingTime && <Row label="Signed at" value={formatDate(c2pa.signingTime) ?? c2pa.signingTime} />}
          <Row label="Edit count" value={String(c2pa?.editCount ?? 0)} />
          {(c2pa?.editHistory?.length ?? 0) > 0 && (
            <div className="pt-3">
              <p className="text-xs text-white/30 mb-2">Edit history</p>
              <ul className="space-y-1">
                {c2pa!.editHistory.map((e, i) => (
                  <li key={i} className="text-sm text-white/60 flex items-start gap-2">
                    <span className="text-amber-400 shrink-0">→</span>
                    <span>
                      {e.action}
                      {e.softwareAgent && <span className="text-white/30"> via {e.softwareAgent}</span>}
                      {e.when && <span className="text-white/30"> · {formatDate(e.when) ?? e.when}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>

        {/* AI Detection */}
        <Section title="AI Detection">
          {aiDetection?.unavailable ? (
            <p className="text-sm text-white/30 py-1">
              AI detection unavailable — set <code className="text-white/50">HIVE_API_KEY</code> to enable
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-sm text-white/40">AI probability</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(aiDetection?.score ?? 0) * 100}%` }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className={`h-full rounded-full ${
                        (aiDetection?.score ?? 0) > 0.6
                          ? "bg-red-400"
                          : (aiDetection?.score ?? 0) > 0.3
                          ? "bg-amber-400"
                          : "bg-green-400"
                      }`}
                    />
                  </div>
                  <span className="text-sm text-white/80 w-12 text-right">
                    {Math.round((aiDetection?.score ?? 0) * 100)}%
                  </span>
                </div>
              </div>
              {aiDetection?.signals.map((s, i) => (
                <div key={i} className="flex items-start justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-sm text-white/40">{s.name}</span>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${s.detected ? "text-red-400" : "text-green-400"}`}>
                      {s.detected ? "Detected" : "Not detected"}
                    </span>
                    {s.detail && (
                      <p className="text-xs text-white/30 mt-0.5">{s.detail}</p>
                    )}
                  </div>
                </div>
              ))}
              <Row label="Detection source" value={aiDetection?.provider === "hive" ? "Hive AI API" : "Local heuristics"} />
            </>
          )}
        </Section>

        {/* File fingerprint */}
        <Section title="File Fingerprint">
          <Row label="SHA-256" value={`${fileInfo.hash.slice(0, 16)}…${fileInfo.hash.slice(-8)}`} />
          <Row label="Type" value={fileInfo.type} />
          <Row label="Size" value={formatBytes(fileInfo.size)} />
          <Row label="Verified at" value={formatDate(result.verifiedAt) ?? result.verifiedAt} />
          <Row label="Processing time" value={`${result.processingMs} ms`} />
        </Section>
      </div>

      {/* Share card */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-white/30 uppercase tracking-widest">Share Verification</h3>

        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3">
          <span className="text-sm text-white/40 flex-1 truncate">{shareUrl}</span>
          <button
            onClick={copyLink}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors shrink-0 font-medium"
          >
            Copy
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-black hover:bg-zinc-900 border border-white/10 text-white transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Post on X
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 text-green-400 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 min-w-[100px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-700/20 hover:bg-blue-700/30 border border-blue-700/30 text-blue-400 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </a>
        </div>
      </div>

      {/* Verify another */}
      <button
        onClick={onReset}
        className="w-full py-4 rounded-2xl glass border border-white/10 hover:border-white/20 hover:bg-white/8 text-white/60 hover:text-white transition-all text-sm font-medium"
      >
        ← Verify another file
      </button>
    </motion.div>
  );
}
