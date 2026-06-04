"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import type { VerificationResult } from "@/lib/types";
import ELAViewer from "./ELAViewer";
import VerificationCertificate from "./VerificationCertificate";
import { generateCertificatePDF } from "@/lib/generateCertificate";
import { exportVerificationJSON } from "@/lib/exportJson";

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
          style={{ ...monoStyle, fontSize: 11, color: "#7A7870", textAlign: "right" as const, wordBreak: "break-all" as const, textDecoration: "none" }}
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
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

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
    `Trustmarc Verification Result`,
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
      `TRUSTMARC VERIFICATION REPORT`,
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
    if (!certRef.current || generatingPdf) return;
    setGeneratingPdf(true);
    try {
      const certId = `TM-${new Date().getFullYear()}-${result.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
      await generateCertificatePDF(certRef.current, certId, fileInfo.name);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const tweetText = `I verified this image using @Trustmarc. Verdict: ${result.verdict} (${confidence}% confidence). ${shareUrl}`;

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
        }}
        className="result-grid"
      >
        {/* LEFT COLUMN */}
        <div style={{ padding: 40, borderRight: "1px solid #D8D5CE" }}>

          {/* Known fake warning banner */}
          {result.knownFakeFlag && (
            <div style={{
              background: "#FFF8EC",
              border: "1px solid #C4882A",
              borderRadius: 2,
              padding: "12px 16px",
              marginBottom: 24,
            }}>
              <div style={{ ...monoStyle, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: "#C4882A", marginBottom: 6 }}>Previously flagged</div>
              <div style={{ ...epilogueStyle, fontWeight: 300, fontSize: 13, color: "#5A5855", lineHeight: 1.6 }}>
                {result.knownFakeMessage} It has been submitted {(result.previouslySeenCount ?? 0) + 1} times total.
              </div>
            </div>
          )}

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
                  fontSize: 14,
                  color: "#5A5855",
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
                fontSize: 12,
                color: "#7A7870",
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
                    <div style={{ ...epilogueStyle, fontWeight: 300, fontSize: 13, color: "#5A5855", lineHeight: 1.5 }}>
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
                        <div style={{ ...monoStyle, fontSize: 10, color: "#7A7870", marginTop: 2 }}>{s.detail}</div>
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
                href={`mailto:?subject=${encodeURIComponent("Trustmarc Verification Result")}&body=${encodeURIComponent(emailBody)}`}
                style={btnOutline}
              >
                Email
              </a>
              <button onClick={copyAsText} style={btnOutline}>
                Copy as text
              </button>
              <button
                onClick={() => {
                  setExportingJson(true);
                  exportVerificationJSON(result);
                  setTimeout(() => setExportingJson(false), 500);
                }}
                disabled={exportingJson}
                style={{ ...btnOutline, opacity: exportingJson ? 0.6 : 1 }}
              >
                {exportingJson ? "Exporting…" : "Export JSON"}
              </button>
              <button onClick={downloadPdf} disabled={generatingPdf} style={{ ...btnSolid, opacity: generatingPdf ? 0.6 : 1 }}>
                {generatingPdf ? "Generating certificate…" : "Download PDF"}
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

      {/* Off-screen certificate for PDF capture */}
      <div style={{ position: "absolute", left: -9999, top: -9999, pointerEvents: "none" }}>
        <VerificationCertificate
          ref={certRef}
          verificationId={result.id}
          filename={fileInfo.name}
          filesize={formatBytes(fileInfo.size)}
          filetype={fileInfo.type}
          verdict={result.verdict}
          confidence={confidence}
          captureDevice={[exif?.make, exif?.model].filter(Boolean).join(" ") || undefined}
          lens={exif?.lensModel ?? undefined}
          capturedAt={exif?.dateTimeOriginal ? (formatDate(exif.dateTimeOriginal) ?? exif.dateTimeOriginal) : undefined}
          resolution={exif?.width && exif?.height ? `${exif.width} × ${exif.height} px` : undefined}
          cameraSettings={[
            exif?.focalLength ? `${exif.focalLength}mm` : null,
            exif?.aperture ? `f/${exif.aperture}` : null,
            exif?.shutterSpeed ?? null,
            exif?.iso ? `ISO ${exif.iso}` : null,
          ].filter(Boolean).join("  ·  ") || undefined}
          gpsCoordinates={exif?.gps ? `${exif.gps.lat.toFixed(5)}, ${exif.gps.lon.toFixed(5)}` : undefined}
          altitude={exif?.altitude != null ? `${exif.altitude} m` : undefined}
          software={exif?.software ?? undefined}
          forensicChecks={(forensics?.signals ?? []).map((s) => ({
            status: s.status as "pass" | "warn" | "info" | "fail",
            title: s.label,
            detail: s.detail,
          }))}
          aiProbability={aiScore}
          aiDetected={!!(aiDetection?.signals?.some((s) => s.name.toLowerCase().includes("ai generated") && s.detected))}
          c2paManifest={!!(c2pa?.hasCertificate)}
          c2paSignatureValid={!!(c2pa?.valid)}
          c2paEditCount={c2pa?.editCount ?? 0}
          sha256={fileInfo.hash}
          verifiedAt={result.verifiedAt}
          processingTime={result.processingMs}
          knownFakeFlag={result.knownFakeFlag}
          knownFakeMessage={result.knownFakeMessage}
          previouslySeenCount={result.previouslySeenCount}
        />
      </div>
    </motion.div>
  );
}
