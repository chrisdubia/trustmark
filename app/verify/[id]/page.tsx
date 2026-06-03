import type { Metadata } from "next";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: `Verification ${params.id.slice(0, 8)} — TrustMark`,
    description: "View this media verification result on TrustMark.",
  };
}

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const epilogue = { fontFamily: "'Epilogue', sans-serif" } as const;

export default function VerifyPage({ params }: Props) {
  return (
    <main style={{ display: "flex", flexDirection: "column", background: "#F2F0EB", color: "#1C1C1A", ...epilogue }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #D8D5CE" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1px solid #1C1C1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#1C1C1A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ ...epilogue, fontWeight: 500, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#1C1C1A" }}>Trustmark</span>
        </Link>
        <div style={{ display: "flex", gap: 28 }}>
          {([["How it works", "/how-it-works"], ["API", "/api"], ["Status", "/status"]] as [string, string][]).map(([label, href]) => (
            <Link key={label} href={href} style={{ ...mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A8A59E", textDecoration: "none" }}>{label}</Link>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "64px 40px 80px", width: "100%" }}>
        <div style={{ ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A8A59E", marginBottom: 20 }}>Verification result</div>
        <h1 style={{ ...epilogue, fontWeight: 300, fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#1C1C1A", marginBottom: 16 }}>
          Results are not stored.
        </h1>
        <p style={{ ...epilogue, fontWeight: 300, fontSize: 15, lineHeight: 1.75, color: "#5A5855", marginBottom: 40 }}>
          TrustMark is stateless by design. Files and results are never stored on our servers. Shared links represent a verification event, not persisted data.
        </p>

        <div style={{ background: "#F8F6F1", border: "1px solid #D8D5CE", borderRadius: 2, padding: 24, marginBottom: 32 }}>
          <div style={{ ...mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B0ADA6", marginBottom: 10 }}>Verification ID</div>
          <div style={{ ...mono, fontSize: 11, color: "#7A7870", letterSpacing: "0.06em", wordBreak: "break-all" }}>{params.id}</div>
        </div>

        <p style={{ ...epilogue, fontWeight: 300, fontSize: 14, lineHeight: 1.75, color: "#7A7870", marginBottom: 32 }}>
          To verify the same file, the original sender needs to re-upload it. This protects privacy while enabling shared verdicts.
        </p>

        <Link href="/" style={{
          display: "block",
          background: "#1C1C1A",
          color: "#F2F0EB",
          border: "1px solid #1C1C1A",
          borderRadius: 2,
          padding: "12px 24px",
          ...mono,
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          textDecoration: "none",
          textAlign: "center",
        }}>Verify a file now</Link>
      </div>

      <footer style={{ borderTop: "1px solid #D8D5CE", padding: "14px 40px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ ...mono, fontSize: 9, color: "#C0BDB6", letterSpacing: "0.08em", textTransform: "uppercase" }}>Trustmark · 2026 · Stateless · No images stored</span>
        <span style={{ ...mono, fontSize: 9, color: "#C0BDB6", letterSpacing: "0.08em", textTransform: "uppercase" }}>Five signals · One verdict</span>
      </footer>
    </main>
  );
}
