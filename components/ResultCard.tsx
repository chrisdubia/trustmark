"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { VerificationResult } from "@/lib/types";
import ELAViewer from "./ELAViewer";

interface ResultCardProps {
  result: VerificationResult;
  previewUrl: string | null;
  onReset: () => void;
}

const VERDICT_CONFIG = {
  VERIFIED: {
    color: "#6B8F4E",
    title: "This media is authentic",
    subtitle: "Consistent with a real camera capture. No manipulation detected.",
  },
  MODIFIED: {
    color: "#C4882A",
    title: "This media has been altered",
    subtitle: "Evidence of post-processing, editing, or stripped provenance detected.",
  },
  SYNTHETIC: {
    color: "#B85050",
    title: "AI-generated content",
    subtitle: "High probability this media was created by an AI generator.",
  },
  UNKNOWN: {
    color: "#8A8880",
    title: "Authenticity undetermined",
    subtitle: "Insufficient signals to make a confident determination.",
  },
};

const STATUS_ICONS: Record<string, string> = {
  pass: "+",
  warn: "!",
  fail: "×",
  info: "·",
};

const STATUS_COLORS: Record<string, string> = {
  pass: "#6B8F4E",
  warn: "#C4882A",
  fail: "#B85050",
  info: "#B0ADA6",
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

const monoStyle = {
  fontFamily: "'DM Mono', monospace",
} as const;

const epilogueStyle = {
  fontFamily: "'Epilogue', sans-serif",
} as const;

function DataRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "9px 0",
      borderBottom: "1px solid #EBEBE5",
      gap: 12,
    }}>
      <span style={{ ...monoStyle, fontSize: 10, textTransform: "uppercase" as const, color: "#B0ADA6", letterSpacing: "0.08em", flexShrink: 0 }}>
        {label}
      </span>
      {href ? (
        <a
          href={href} target="_blank" rel="noopener noreferrer"
          style={{ ...monoStyle, fontSize: 11, color: "#4A7A9B", textAlign: "right" as const, wordBreak: "break-all" as const, textDecoration: "none" }}
        >
          {value} ↗
        </a>
      ) : (
        <span style={{ ...monoStyle, fontSize: 11, color: "#1C1C1A", textAlign: "right" as const, wordBreak: "break-all" as const }}>
          {value}
        </span>
      )}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ ...monoStyle, fontSize: 9, textTransform: "uppercase" as const, letterSpacing: "0.18em", color: "#B0ADA6", marginBottom: 16 }}>
      {children}
    </div>
  );
}

function RightSectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ ...monoStyle, fontSize: 9, textTransform: "uppercase" as const, letterSpacing: "0.18em", color: "#A8A59E", marginBottom: 12 }}>
      {children}
    </div>
  );
}

function RightDataRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", gap: 8 }}>
      <span style={{ ...monoStyle, fontSize: 10, color: "#B0ADA6" }}>{label}</span>
      <span style={{ ...monoStyle, fontSize: 11, color: valueColor ?? "#1C1C1A", textAlign: "right" as const }}>{value}</span>
    </div>
  );
}

const btnBase: React.CSSProperties = {
  ...monoStyle,
  fontSize: 9,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  padding: "10px 16px",
  borderRadius: 2,
  cursor: "pointer",
  width: "100%",
  textAlign: "center",
  textDecoration: "none",
  display: "block",
  boxSizing: "border-box",
  transition: "background 0.15s, color 0.15s, border-color 0.15s",
};

const btnOutline: React.CSSProperties = {
  ...btnBase,
  border: "1px solid #D8D5CE",
  background: "transparent",
  color: "#1C1C1A",
};

const btnSolid: React.CSSProperties = {
  ...btnBase,
  border: "1px solid #1C1C1A",
  background: "#1C1C1A",
  color: "#F2F0EB",
};

export default function ResultCard({ result, previewUrl, onReset }: ResultCardProps) {
  const cfg = VERDICT_CONFIG[result.verdict];
  const { exif, c2pa, aiDetection, forensics, fileInfo, confidence } = result;
  const [copied, setCopied] = useState(false);

  const mapsUrl = exif?.gps
    ? `https://maps.google.com/?q=${exif.gps.lat},${exif.gps.lon}`
    : null;

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/verify/${result.id}`;

  const hasExif = !!(exif?.make || exif?.model || exif?.dateTimeOriginal || exif?.gps);

  const originLabels: Record<string, string> = {
    camera: "Real camera capture",
    screenshot: "Screenshot",
    web: "Downloaded from web",
    ai_likely: "Likely AI-generated",
    unknown: "Unknown origin",
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const keyFindings = forensics?.signals
    .filter((s) => s.status === "pass" || s.status === "fail" || s.status === "warn")
    .slice(0, 3)
    .map((s) => `• ${s.label}: ${s.detail}`)
    .join("\n") ?? "";

  const emailBody = [
    `TrustMark Verification Result`,
    ``,
    `Verdict: ${result.verdict}`,
    `Confidence: ${confidence}%`,
    `File: ${fileInfo.name}`,
    ``,
    keyFindings ? `Key Findings:\n${keyFindings}` : "",
    ``,
    `View full report: ${shareUrl}`,
  ].filter((l) => l !== undefined).join("\n");

  const copyAsText = () => {
    const lines = [
      `TRUSTMARK VERIFICATION REPORT`,
      `================================`,
      `Verdict: ${result.verdict}`,
      `Confidence: ${confidence}%`,
      ``,
      `File: ${fileInfo.name}`,
      `Size: ${formatBytes(fileInfo.size)}`,
      `Type: ${fileInfo.type}`,
      `SHA-256: ${fileInfo.hash}`,
      ``,
      `Forensic Signals:`,
      ...(forensics?.signals.map((s) => `  [${s.status.toUpperCase()}] ${s.label}: ${s.detail}`) ?? []),
      ``,
      hasExif ? [
        `Capture Information:`,
        exif?.make || exif?.model ? `  Device: ${[exif?.make, exif?.model].filter(Boolean).join(" ")}` : null,
        exif?.dateTimeOriginal ? `  Captured: ${formatDate(exif.dateTimeOriginal)}` : null,
        exif?.gps ? `  GPS: ${exif.gps.lat.toFixed(5)}, ${exif.gps.lon.toFixed(5)}` : null,
      ].filter(Boolean).join("\n") : null,
      ``,
      `AI Detection:`,
      `  Probability: ${Math.round((aiDetection?.score ?? 0) * 100)}%`,
      ...(aiDetection?.signals.map((s) => `  ${s.name}: ${s.detected ? "Detected" : "Not detected"}`) ?? []),
      ``,
      `C2PA Provenance:`,
      `  Manifest: ${c2pa?.hasCertificate ? "Present" : "None"}`,
      `  Valid: ${c2pa?.valid ? "Yes" : "No"}`,
      ``,
      `Verification URL: ${shareUrl}`,
      `Verified at: ${formatDate(result.verifiedAt) ?? result.verifiedAt}`,
    ].filter(Boolean).join("\n");

    navigator.clipboard.writeText(lines);
  };

  const downloadPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = 595;
    let y = 40;

    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("TrustMark", 40, y);
    y += 20;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 157, 150);
    doc.text("trustmark-pearl.vercel.app · Stateless verification · No images stored", 40, y);
    y += 24;

    // Accent bar
    const accentHex = cfg.color;
    const r = parseInt(accentHex.slice(1, 3), 16);
    const g = parseInt(accentHex.slice(3, 5), 16);
    const b = parseInt(accentHex.slice(5, 7), 16);
    doc.setFillColor(r, g, b);
    doc.rect(40, y, 3, 48, "F");

    // Verdict block
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(r, g, b);
    doc.text(result.verdict, 52, y + 20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(28, 28, 26);
    doc.text(cfg.title, 52, y + 36);
    doc.setFontSize(9);
    doc.setTextColor(138, 136, 128);
    doc.text(`Confidence: ${confidence}%`, 52, y + 50);
    y += 72;

    // File info
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(176, 173, 166);
    doc.text("FILE INFORMATION", 40, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(28, 28, 26);
    doc.setFontSize(9);
    const fileLines = [
      `Name: ${fileInfo.name}`,
      `Size: ${formatBytes(fileInfo.size)}  ·  Type: ${fileInfo.type}`,
      `SHA-256: ${fileInfo.hash}`,
    ];
    fileLines.forEach((line) => { doc.text(line, 40, y); y += 14; });
    y += 8;

    // Forensics
    if (forensics && forensics.signals.length > 0) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(176, 173, 166);
      doc.text("FORENSIC ANALYSIS", 40, y);
      y += 14;
      forensics.signals.forEach((s) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(28, 28, 26);
        doc.text(`[${s.status.toUpperCase()}] ${s.label}`, 40, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(138, 136, 128);
        const wrapped = doc.splitTextToSize(s.detail, W - 80);
        wrapped.forEach((line: string) => { y += 12; doc.text(line, 48, y); });
        y += 10;
      });
    }

    // Capture info
    if (hasExif) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(176, 173, 166);
      doc.text("CAPTURE INFORMATION", 40, y);
      y += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(28, 28, 26);
      if (exif?.make || exif?.model) { doc.text(`Device: ${[exif?.make, exif?.model].filter(Boolean).join(" ")}`, 40, y); y += 14; }
      if (exif?.dateTimeOriginal) { doc.text(`Captured: ${formatDate(exif.dateTimeOriginal) ?? exif.dateTimeOriginal}`, 40, y); y += 14; }
      if (exif?.gps) { doc.text(`GPS: ${exif.gps.lat.toFixed(5)}, ${exif.gps.lon.toFixed(5)}`, 40, y); y += 14; }
      y += 4;
    }

    // AI Detection
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(176, 173, 166);
    doc.text("AI DETECTION", 40, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(28, 28, 26);
    doc.text(`AI Probability: ${Math.round((aiDetection?.score ?? 0) * 100)}%`, 40, y);
    y += 14;

    // C2PA
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(176, 173, 166);
    doc.text("C2PA PROVENANCE", 40, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(28, 28, 26);
    doc.text(`Manifest: ${c2pa?.hasCertificate ? "Present" : "None"}  ·  Valid: ${c2pa?.valid ? "Yes" : "No"}`, 40, y);
    y += 20;

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(160, 157, 150);
    doc.text(`Verification URL: ${shareUrl}`, 40, y);
    y += 12;
    doc.text(`Generated: ${formatDate(result.verifiedAt) ?? result.verifiedAt}  ·  Processing: ${result.processingMs} ms`, 40, y);
    y += 12;
    doc.text("Generated by TrustMark · trustmark-pearl.vercel.app · Stateless verification · No images stored", 40, y);

    doc.save(`trustmark-${result.verdict.toLowerCase()}-${fileInfo.name}.pdf`);
  };

  const tweetText = `I verified this image using @TrustMark. Verdict: ${result.verdict} (${confidence}% confidence). ${shareUrl}`;

  const aiScore = Math.round((aiDetection?.score ?? 0) * 100);
  const aiColor = aiScore > 60 ? "#B85050" : aiScore > 20 ? "#C4882A" : "#6B8F4E";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ width: "100%" }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          minHeight: 580,
        }}
        className="result-grid"
      >
        {/* LEFT COLUMN */}
        <div style={{ padding: 40, borderRight: "1px solid #D8D5CE" }}>

          {/* Verdict block */}
          <div style={{ borderBottom: "1px solid #D8D5CE", marginBottom: 32, paddingBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              {/* Vertical bar */}
              <div style={{
                width: 3, height: 64,
                background: cfg.color,
                flexShrink: 0,
                marginTop: 3,
                borderRadius: 0,
              }} />

              {/* Center */}
              <div style={{ flex: 1 }}>
                <div style={{
                  ...monoStyle,
                  fontSize: 10,
                  textTransform: "uppercase",
                  color: cfg.color,
                  letterSpacing: "0.18em",
                  marginBottom: 8,
                }}>{result.verdict}</div>
                <div style={{
                  ...epilogueStyle,
                  fontWeight: 300,
                  fontSize: 28,
                  letterSpacing: "-0.02em",
                  color: "#1C1C1A",
                  marginBottom: 6,
                }}>{cfg.title}</div>
                <div style={{
                  ...epilogueStyle,
                  fontWeight: 300,
                  fontSize: 13,
                  color: "#8A8880",
                  lineHeight: 1.5,
                }}>{cfg.subtitle}</div>
              </div>

              {/* Right: confidence */}
              <div style={{ marginLeft: "auto", textAlign: "right", flexShrink: 0 }}>
                <div style={{
                  ...monoStyle,
                  fontSize: 32,
                  fontWeight: 300,
                  color: cfg.color,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  marginBottom: 4,
                }}>{confidence}%</div>
                <div style={{
                  ...monoStyle,
                  fontSize: 9,
                  textTransform: "uppercase",
                  color: "#B0ADA6",
                  letterSpacing: "0.12em",
                }}>Confidence</div>
                {/* Bar */}
                <div style={{
                  width: 80, height: 2,
                  background: "#D8D5CE",
                  marginTop: 8,
                  marginLeft: "auto",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence}%` }}
                    transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
                    style={{ position: "absolute", left: 0, top: 0, height: "100%", background: cfg.color }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Image block */}
          {previewUrl && (
            <div style={{ borderBottom: "1px solid #D8D5CE", marginBottom: 32, paddingBottom: 32 }}>
              <div style={{
                background: "#1C1C1A",
                borderRadius: 2,
                overflow: "hidden",
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Uploaded file preview"
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }}
                />
                <div style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  ...monoStyle,
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: cfg.color,
                  background: "rgba(242,240,235,0.92)",
                  padding: "4px 8px",
                  borderRadius: 2,
                }}>{result.verdict}</div>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                ...monoStyle,
                fontSize: 10,
                color: "#B0ADA6",
              }}>
                <span>{fileInfo.name}</span>
                <span>{formatBytes(fileInfo.size)} · {fileInfo.type}</span>
              </div>
            </div>
          )}

          {/* Forensic Analysis */}
          {forensics && forensics.signals.length > 0 && (
            <div style={{ borderBottom: "1px solid #D8D5CE", marginBottom: 28, paddingBottom: 28 }}>
              <SectionHeader>Forensic Analysis</SectionHeader>
              {forensics.signals.map((signal) => (
                <div key={signal.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                  <span style={{
                    ...monoStyle,
                    fontSize: 11,
                    color: STATUS_COLORS[signal.status] ?? "#B0ADA6",
                    flexShrink: 0,
                    width: 12,
                    lineHeight: 1,
                    marginTop: 2,
                  }}>
                    {STATUS_ICONS[signal.status] ?? "·"}
                  </span>
                  <div>
                    <div style={{ ...epilogueStyle, fontWeight: 400, fontSize: 13, color: "#1C1C1A", marginBottom: 2 }}>
                      {signal.label}
                    </div>
                    <div style={{ ...monoStyle, fontSize: 10, color: "#A8A59E", letterSpacing: "0.04em" }}>
                      {signal.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Capture Information */}
          {hasExif && (
            <div style={{ borderBottom: "1px solid #D8D5CE", marginBottom: 28, paddingBottom: 28 }}>
              <SectionHeader>Capture Information</SectionHeader>
              {(exif?.make || exif?.model) && (
                <DataRow label="Device" value={[exif?.make, exif?.model].filter(Boolean).join(" ")} />
              )}
              {exif?.lensModel && <DataRow label="Lens" value={exif.lensModel} />}
              {exif?.dateTimeOriginal && (
                <DataRow label="Captured" value={formatDate(exif.dateTimeOriginal) ?? exif.dateTimeOriginal} />
              )}
              {exif?.dateTimeModified && exif.dateTimeModified !== exif.dateTimeOriginal && (
                <DataRow label="Last modified" value={formatDate(exif.dateTimeModified) ?? exif.dateTimeModified} />
              )}
              {exif?.width && exif?.height && (
                <DataRow label="Resolution" value={`${exif.width} × ${exif.height} px`} />
              )}
              {(exif?.aperture || exif?.shutterSpeed || exif?.iso || exif?.focalLength) && (
                <DataRow
                  label="Camera settings"
                  value={[
                    exif?.focalLength ? `${exif.focalLength}mm` : null,
                    exif?.aperture ? `f/${exif.aperture}` : null,
                    exif?.shutterSpeed ?? null,
                    exif?.iso ? `ISO ${exif.iso}` : null,
                  ].filter(Boolean).join("  ·  ")}
                />
              )}
              {exif?.gps && mapsUrl && (
                <DataRow
                  label="GPS coordinates"
                  value={`${exif.gps.lat.toFixed(5)}, ${exif.gps.lon.toFixed(5)}`}
                  href={mapsUrl}
                />
              )}
              {exif?.altitude !== null && exif?.altitude !== undefined && (
                <DataRow label="Altitude" value={`${exif.altitude} m`} />
              )}
              {exif?.software && <DataRow label="Software" value={exif.software} />}
            </div>
          )}

          {/* ELA Viewer — images only */}
          {previewUrl && fileInfo.type.startsWith("image/") && (
            <ELAViewer imageUrl={previewUrl} />
          )}
        </div>

        {/* RIGHT PANEL */}
        <div style={{ padding: "40px 32px", background: "#ECEAE4" }}>

          {/* C2PA */}
          <div style={{ borderBottom: "1px solid #D0CEC8", marginBottom: 24, paddingBottom: 24 }}>
            <RightSectionHeader>Provenance (C2PA)</RightSectionHeader>
            <RightDataRow
              label="Manifest present"
              value={c2pa?.hasCertificate ? "Yes" : "No"}
              valueColor={c2pa?.hasCertificate ? "#6B8F4E" : "#B85050"}
            />
            <RightDataRow
              label="Signature valid"
              value={c2pa?.valid ? "Yes" : "No"}
              valueColor={c2pa?.valid ? "#6B8F4E" : "#B85050"}
            />
            {c2pa?.issuer && <RightDataRow label="Issuer" value={c2pa.issuer} />}
            {c2pa?.claimGenerator && <RightDataRow label="Claim generator" value={c2pa.claimGenerator} />}
            {c2pa?.signingTime && (
              <RightDataRow label="Signed at" value={formatDate(c2pa.signingTime) ?? c2pa.signingTime} />
            )}
            <RightDataRow label="Edit count" value={String(c2pa?.editCount ?? 0)} />
            {(c2pa?.editHistory?.length ?? 0) > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ ...monoStyle, fontSize: 9, color: "#B0ADA6", marginBottom: 8 }}>Edit history</div>
                {c2pa!.editHistory.map((e, i) => (
                  <div key={i} style={{ ...monoStyle, fontSize: 10, color: "#8A8880", marginBottom: 6 }}>
                    → {e.action}
                    {e.softwareAgent && <span style={{ color: "#B0ADA6" }}> via {e.softwareAgent}</span>}
                    {e.when && <span style={{ color: "#B0ADA6" }}> · {formatDate(e.when) ?? e.when}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Detection */}
          <div style={{ borderBottom: "1px solid #D0CEC8", marginBottom: 24, paddingBottom: 24 }}>
            <RightSectionHeader>AI Detection</RightSectionHeader>
            {aiDetection?.unavailable ? (
              <div style={{ ...monoStyle, fontSize: 10, color: "#B0ADA6" }}>
                AI detection unavailable — set HIVE_API_KEY to enable
              </div>
            ) : (
              <>
                <RightDataRow
                  label="AI probability"
                  value={`${aiScore}%`}
                  valueColor={aiColor}
                />
                {aiDetection?.signals.map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", gap: 8 }}>
                    <span style={{ ...monoStyle, fontSize: 10, color: "#B0ADA6" }}>{s.name}</span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ ...monoStyle, fontSize: 11, color: s.detected ? "#B85050" : "#6B8F4E" }}>
                        {s.detected ? "Detected" : "Not detected"}
                      </span>
                      {s.detail && (
                        <div style={{ ...monoStyle, fontSize: 9, color: "#B0ADA6", marginTop: 2 }}>{s.detail}</div>
                      )}
                    </div>
                  </div>
                ))}
                <RightDataRow
                  label="Source"
                  value={aiDetection?.provider === "hive" ? "Hive AI API" : "Local heuristics"}
                />
              </>
            )}
          </div>

          {/* File Fingerprint */}
          <div style={{ borderBottom: "1px solid #D0CEC8", marginBottom: 24, paddingBottom: 24 }}>
            <RightSectionHeader>File Fingerprint</RightSectionHeader>
            <div style={{
              ...monoStyle,
              fontSize: 9,
              color: "#B0ADA6",
              wordBreak: "break-all",
              marginBottom: 16,
              lineHeight: 1.6,
            }}>
              {fileInfo.hash.slice(0, 32)}…
            </div>
            <RightDataRow label="Type" value={fileInfo.type} />
            <RightDataRow label="Size" value={formatBytes(fileInfo.size)} />
            <RightDataRow label="Verified at" value={formatDate(result.verifiedAt) ?? result.verifiedAt} />
            <RightDataRow label="Processing" value={`${result.processingMs} ms`} />
          </div>

          {/* Share */}
          <div>
            <RightSectionHeader>Share</RightSectionHeader>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button onClick={copyLink} style={btnOutline}>
                {copied ? "Copied!" : "Copy link"}
              </button>
              <a
                href={`mailto:?subject=${encodeURIComponent("TrustMark Verification Result")}&body=${encodeURIComponent(emailBody)}`}
                style={btnOutline}
              >
                Email
              </a>
              <button onClick={copyAsText} style={btnOutline}>
                Copy as text
              </button>
              <button onClick={downloadPdf} style={btnSolid}>
                Download PDF
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={btnOutline}
              >
                Post on X
              </a>
            </div>

            <button
              onClick={onReset}
              style={{
                ...btnSolid,
                marginTop: 20,
              }}
            >
              Verify another file
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .result-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </motion.div>
  );
}
