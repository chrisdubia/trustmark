"use client";

import QRCode from "react-qr-code";
import React from "react";

export interface CertificateProps {
  verificationId: string;
  filename: string;
  filesize: string;
  filetype: string;
  verdict: "VERIFIED" | "MODIFIED" | "SYNTHETIC" | "UNKNOWN";
  confidence: number;
  captureDevice?: string;
  lens?: string;
  capturedAt?: string;
  resolution?: string;
  cameraSettings?: string;
  gpsCoordinates?: string;
  altitude?: string;
  software?: string;
  forensicChecks: Array<{
    status: "pass" | "warn" | "info" | "fail";
    title: string;
    detail: string;
  }>;
  aiProbability: number;
  aiDetected: boolean;
  c2paManifest: boolean;
  c2paSignatureValid: boolean;
  c2paEditCount: number;
  sha256: string;
  verifiedAt: string;
  processingTime: number;
}

const VERDICT_COLOR: Record<string, string> = {
  VERIFIED: "#6B8F4E",
  MODIFIED: "#C4882A",
  SYNTHETIC: "#B85050",
  UNKNOWN: "#B85050",
};

const VERDICT_TITLE: Record<string, string> = {
  VERIFIED: "This media is authentic",
  MODIFIED: "This media has been altered",
  SYNTHETIC: "AI-generated content",
  UNKNOWN: "Authenticity undetermined",
};

const VERDICT_SUB: Record<string, string> = {
  VERIFIED: "C2PA signature intact · Camera metadata consistent · AI probability low",
  MODIFIED: "Original capture detected · Post-capture edits found",
  SYNTHETIC: "No authentic origin signature · Camera metadata absent",
  UNKNOWN: "Insufficient signals to make a confident determination",
};

const FLAG_COLOR: Record<string, string> = {
  pass: "#6B8F4E",
  warn: "#C4882A",
  info: "#B0ADA6",
  fail: "#B85050",
};

const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" };
const epilogue: React.CSSProperties = { fontFamily: "'Epilogue', sans-serif" };

function formatVerifiedAt(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return { date, time };
  } catch {
    return { date: iso, time: "" };
  }
}

function DataRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "5px 0", borderBottom: "1px solid #F4F2ED" }}>
      <span style={{ ...mono, fontSize: 8, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "#B0ADA6" }}>{label}</span>
      <span style={{ ...mono, fontSize: 9, color: valueColor ?? "#1C1C1A", textAlign: "right" as const, maxWidth: 160 }}>{value}</span>
    </div>
  );
}

function SectionHeader({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ ...mono, fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase" as const, color: "#B0ADA6", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #EBEBE5", ...style }}>
      {children}
    </div>
  );
}

const VerificationCertificate = React.forwardRef<HTMLDivElement, CertificateProps>(function VerificationCertificate(props, ref) {
  const {
    verificationId, filename, filesize, filetype, verdict, confidence,
    captureDevice, lens, capturedAt, resolution, cameraSettings,
    gpsCoordinates, altitude, software,
    forensicChecks, aiProbability, aiDetected,
    c2paManifest, c2paSignatureValid, c2paEditCount,
    sha256, verifiedAt, processingTime,
  } = props;

  const verdictColor = VERDICT_COLOR[verdict] ?? "#B85050";
  const certId = `TM-${new Date().getFullYear()}-${verificationId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
  const verifyUrl = `https://trustmark.io/verify/${verificationId}`;
  const { date: verifiedDate, time: verifiedTime } = formatVerifiedAt(verifiedAt);

  const aiColor = aiProbability > 60 ? "#B85050" : aiProbability > 20 ? "#C4882A" : "#6B8F4E";

  return (
    <div ref={ref} style={{ ...epilogue, background: "#E8E6E0", padding: 32, width: 784 }}>
      <div style={{ background: "#FFFFFF", border: "1.5px solid #B8B5AE", maxWidth: 720, margin: "0 auto", position: "relative" }}>
        {/* Background pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.015,
          backgroundImage: "repeating-linear-gradient(45deg, #1C1C1A 0px, #1C1C1A 1px, transparent 1px, transparent 10px)",
          pointerEvents: "none", zIndex: 0,
        }} />

        <div style={{ margin: 6, border: "0.5px solid #D8D5CE", display: "flex", flexDirection: "column", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <div style={{ padding: "20px 28px 18px", borderBottom: "1px solid #D8D5CE", display: "flex", justifyContent: "space-between", alignItems: "flex-start", background: "#FAFAF8" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, ...epilogue, fontSize: 11, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#1C1C1A", marginBottom: 3 }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1px solid #1C1C1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="7" height="7" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#1C1C1A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                Trustmark
              </div>
              <div style={{ ...mono, fontSize: 9, color: "#B0ADA6", letterSpacing: "0.08em" }}>Media Authenticity Certificate · trustmark.io</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ ...mono, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B0ADA6", marginBottom: 3 }}>Certificate ID</div>
              <div style={{ ...mono, fontSize: 13, color: "#1C1C1A", letterSpacing: "0.1em" }}>{certId}</div>
            </div>
          </div>

          {/* Rules */}
          <div style={{ height: 3, background: "#1C1C1A" }} />
          <div style={{ height: 0.5, background: "#D8D5CE" }} />

          {/* Statement */}
          <div style={{ padding: "14px 28px", borderBottom: "1px solid #D8D5CE", background: "#FAFAF8" }}>
            <div style={{ ...mono, fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: "#B0ADA6", marginBottom: 5 }}>Certification statement</div>
            <div style={{ ...epilogue, fontSize: 11, fontWeight: 300, color: "#5A5855", lineHeight: 1.75 }}>
              This document certifies that the file identified herein was independently analyzed by TrustMark&apos;s stateless verification system on {verifiedDate} at {verifiedTime} EST. Five independent forensic signals were applied. No file content was retained following analysis. The findings below constitute the complete and unaltered results of that examination.
            </div>
          </div>

          {/* Verdict block */}
          <div style={{ padding: "22px 28px", display: "flex", alignItems: "center", gap: 20, background: "#fff", borderBottom: "1px solid #D8D5CE" }}>
            <div style={{ width: 5, height: 88, background: verdictColor, flexShrink: 0 }} />
            <div>
              <div style={{ ...mono, fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: verdictColor, marginBottom: 6 }}>Verdict · {verdict.charAt(0) + verdict.slice(1).toLowerCase()}</div>
              <div style={{ ...epilogue, fontSize: 30, fontWeight: 300, letterSpacing: "-0.02em", color: "#1C1C1A", lineHeight: 1, marginBottom: 6 }}>{VERDICT_TITLE[verdict]}</div>
              <div style={{ ...epilogue, fontSize: 12, fontWeight: 300, color: "#8A8880" }}>{VERDICT_SUB[verdict]}</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              <div>
                <div style={{ ...mono, fontSize: 40, fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 2, color: verdictColor }}>{confidence}%</div>
                <div style={{ ...mono, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B0ADA6", textAlign: "right" }}>Confidence</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ width: 72, height: 72, border: "1px solid #D8D5CE", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 4 }}>
                  <QRCode value={verifyUrl} size={64} bgColor="#ffffff" fgColor="#1C1C1A" level="M" />
                </div>
                <div style={{ ...mono, fontSize: 7, color: "#B0ADA6", letterSpacing: "0.06em", textAlign: "center" }}>Scan to verify</div>
              </div>
            </div>
          </div>

          {/* Two-column body */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: "1px solid #D8D5CE" }}>
            {/* Left column */}
            <div style={{ padding: "18px 28px", borderRight: "1px solid #D8D5CE" }}>
              <SectionHeader>File information</SectionHeader>
              <DataRow label="Name" value={filename} />
              <DataRow label="Size" value={filesize} />
              <DataRow label="Type" value={filetype} />
              {resolution && <DataRow label="Dimensions" value={resolution} />}
              {(captureDevice) && <DataRow label="Device" value={captureDevice} />}
              {lens && <DataRow label="Lens" value={lens} />}
              {capturedAt && <DataRow label="Captured" value={capturedAt} />}
              {gpsCoordinates && <DataRow label="GPS" value={gpsCoordinates} />}
              {altitude && <DataRow label="Altitude" value={altitude} />}
              {cameraSettings && <DataRow label="Camera settings" value={cameraSettings} />}
              {software && <DataRow label="Software" value={software} />}
              <DataRow label="Processing" value={`${processingTime} ms`} />
              <DataRow label="Verified" value={`${verifiedDate} · ${verifiedTime}`} />

              <SectionHeader style={{ marginTop: 16 }}>AI detection · Hive API</SectionHeader>
              <DataRow label="AI probability" value={`${aiProbability}%`} valueColor={aiColor} />
              <DataRow label="AI generated" value={aiDetected ? "Detected" : "Not detected"} valueColor={aiDetected ? "#B85050" : "#6B8F4E"} />
              <DataRow label="Source" value="Hive AI API" />

              <SectionHeader style={{ marginTop: 16 }}>Provenance · C2PA</SectionHeader>
              <DataRow label="Manifest" value={c2paManifest ? "Present" : "Not present"} valueColor={c2paManifest ? "#6B8F4E" : "#B85050"} />
              <DataRow label="Signature valid" value={c2paSignatureValid ? "Yes" : "No"} valueColor={c2paSignatureValid ? "#6B8F4E" : "#B85050"} />
              <DataRow label="Edit count" value={String(c2paEditCount)} />
            </div>

            {/* Right column */}
            <div style={{ padding: "18px 28px" }}>
              <SectionHeader>Forensic analysis · {forensicChecks.length} checks</SectionHeader>
              {forensicChecks.map((check, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: i < forensicChecks.length - 1 ? "1px solid #F4F2ED" : "none" }}>
                  <div style={{ ...mono, fontSize: 8, letterSpacing: "0.1em", marginBottom: 2, color: FLAG_COLOR[check.status] ?? "#B0ADA6" }}>
                    {check.status.toUpperCase()} — {check.title}
                  </div>
                  <div style={{ ...mono, fontSize: 9, color: "#B0ADA6", letterSpacing: "0.03em", lineHeight: 1.5 }}>{check.detail}</div>
                </div>
              ))}
            </div>
          </div>

          {/* SHA-256 */}
          <div style={{ padding: "12px 28px", background: "#F8F6F1", borderBottom: "1px solid #D8D5CE" }}>
            <div style={{ ...mono, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B0ADA6", marginBottom: 4 }}>SHA-256 File Fingerprint · Tamper-evident identifier</div>
            <div style={{ ...mono, fontSize: 9, color: "#8A8880", letterSpacing: "0.05em", wordBreak: "break-all", lineHeight: 1.6 }}>{sha256}</div>
          </div>

          {/* Disclaimer */}
          <div style={{ padding: "12px 28px", background: "#FAFAF8", borderBottom: "1px solid #D8D5CE" }}>
            <div style={{ ...mono, fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B0ADA6", marginBottom: 4 }}>Limitations and disclaimer</div>
            <div style={{ ...mono, fontSize: 9, color: "#A8A59E", letterSpacing: "0.03em", lineHeight: 1.65 }}>
              This certificate reflects the forensic state of the submitted file at the time of analysis. TrustMark makes no representation as to the original source, intent, or downstream use of the content. AI detection models carry an inherent margin of error. A Synthetic verdict indicates high probability of AI generation based on available signals — it does not constitute a legal determination. This certificate should be considered one component of a broader evidentiary or editorial review process.
            </div>
          </div>

          {/* Rules (reversed) */}
          <div style={{ height: 0.5, background: "#D8D5CE" }} />
          <div style={{ height: 3, background: "#1C1C1A" }} />

          {/* Footer */}
          <div style={{ padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAFAF8" }}>
            <div>
              <div style={{ ...mono, fontSize: 9, color: "#4A7A9B", letterSpacing: "0.05em", marginBottom: 3 }}>{verifyUrl}</div>
              <div style={{ ...mono, fontSize: 8, color: "#C0BDB6", letterSpacing: "0.05em" }}>Generated {verifiedDate} · EST · Stateless · No images stored · TrustMark Phase 1</div>
            </div>
            <div style={{ ...mono, fontSize: 8, color: "#C0BDB6", letterSpacing: "0.1em", textTransform: "uppercase" }}>Page 1 of 1</div>
            <div style={{ width: 56, height: 56, border: "1px solid #C8C5BE", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <div style={{ ...mono, fontSize: 7, letterSpacing: "0.08em", textTransform: "uppercase", color: "#B0ADA6", textAlign: "center", lineHeight: 1.4 }}>Verified<br/>by</div>
              <div style={{ ...mono, fontSize: 8, color: "#1C1C1A", letterSpacing: "0.1em" }}>TM·2026</div>
              <div style={{ ...mono, fontSize: 6, letterSpacing: "0.06em", color: "#C0BDB6" }}>TRUSTMARK</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
});

export default VerificationCertificate;
