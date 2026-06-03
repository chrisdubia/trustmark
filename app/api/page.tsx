"use client";

import { useState } from "react";
import Link from "next/link";

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const epilogue = { fontFamily: "'Epilogue', sans-serif" } as const;

export default function ApiPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email.trim()) setSubmitted(true);
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F2F0EB", color: "#1C1C1A", ...epilogue }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #D8D5CE" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1px solid #1C1C1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#1C1C1A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ ...epilogue, fontWeight: 500, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#1C1C1A" }}>Trustmark</span>
        </Link>
        <div style={{ display: "flex", gap: 28 }}>
          {([["How it works", "/how-it-works", false], ["API", "/api", true], ["Status", "/status", false]] as [string, string, boolean][]).map(([label, href, active]) => (
            <Link key={label} href={href} style={{ ...mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: active ? "#1C1C1A" : "#A8A59E", textDecoration: "none" }}>{label}</Link>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "64px 40px 80px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%" }}>
        <div style={{ ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A8A59E", marginBottom: 20 }}>API · Private beta</div>
        <h1 style={{ ...epilogue, fontWeight: 300, fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#1C1C1A", marginBottom: 16, maxWidth: 480 }}>
          One call.<br />One <em style={{ fontStyle: "italic", color: "#6B8F4E" }}>verdict.</em>
        </h1>
        <p style={{ ...epilogue, fontWeight: 300, fontSize: 15, lineHeight: 1.75, color: "#5A5855", marginBottom: 48, maxWidth: 480 }}>
          The TrustMark API combines AI detection, provenance verification, metadata analysis, and human identity binding into a single trust verdict. Not a score. A conclusion — with receipts.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#D8D5CE", border: "1px solid #D8D5CE", borderRadius: 2, overflow: "hidden", width: "100%", marginBottom: 48, textAlign: "left" }}>
          {[
            { label: "What you get", title: "A verdict, not a number", desc: "Verified · Modified · Synthetic\nWith confidence score and full audit trail" },
            { label: "Five signals", title: "Combined automatically", desc: "C2PA · EXIF · AI detection\nELA · SHA-256 fingerprint" },
            { label: "Coming in Phase 2", title: "Identity binding", desc: "Verified sender + verified media\nin a single API call" },
            { label: "Built for", title: "Enterprise and developers", desc: "Newsrooms · Marketplaces\nLegal · Insurance · Finance" },
          ].map((f) => (
            <div key={f.title} style={{ background: "#F8F6F1", padding: 20 }}>
              <div style={{ ...mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6B8F4E", marginBottom: 6 }}>{f.label}</div>
              <div style={{ ...epilogue, fontWeight: 400, fontSize: 13, color: "#1C1C1A", marginBottom: 4, letterSpacing: "-0.01em" }}>{f.title}</div>
              <div style={{ ...mono, fontSize: 10, color: "#B0ADA6", lineHeight: 1.6, letterSpacing: "0.03em" }}>
                {f.desc.split("\n").map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ width: "100%", maxWidth: 420, background: "#F8F6F1", border: "1px solid #D8D5CE", borderRadius: 2, padding: 32 }}>
          <div style={{ ...epilogue, fontWeight: 400, fontSize: 16, color: "#1C1C1A", letterSpacing: "-0.01em", marginBottom: 8 }}>Join the waitlist</div>
          <div style={{ ...mono, fontSize: 10, color: "#B0ADA6", letterSpacing: "0.06em", marginBottom: 24, lineHeight: 1.6 }}>
            Private beta access is limited.<br />We will reach out when your spot is ready.
          </div>
          {submitted ? (
            <div style={{ ...mono, fontSize: 11, color: "#6B8F4E", letterSpacing: "0.08em", padding: "11px 0" }}>You&apos;re on the list. We&apos;ll be in touch.</div>
          ) : (
            <>
              <div style={{ display: "flex", border: "1px solid #C8C5BE", borderRadius: 2, overflow: "hidden", marginBottom: 12 }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{ flex: 1, background: "#fff", border: "none", padding: "11px 14px", ...mono, fontSize: 11, color: "#1C1C1A", outline: "none", letterSpacing: "0.04em" }}
                />
                <button
                  onClick={handleSubmit}
                  style={{ background: "#1C1C1A", color: "#F2F0EB", border: "none", padding: "11px 20px", ...mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}
                >Request access</button>
              </div>
              <div style={{ ...mono, fontSize: 10, color: "#C0BDB6", letterSpacing: "0.04em" }}>No spam. No sharing. Ever.</div>
            </>
          )}
        </div>

        <div style={{ marginTop: 32, ...mono, fontSize: 10, color: "#B0ADA6", letterSpacing: "0.06em", lineHeight: 1.8 }}>
          Currently in private beta · Pricing announced at launch<br />
          Questions? Write to api@trustmark.io
        </div>
      </div>

      <footer style={{ borderTop: "1px solid #D8D5CE", padding: "14px 40px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ ...mono, fontSize: 9, color: "#C0BDB6", letterSpacing: "0.08em", textTransform: "uppercase" }}>Trustmark · 2026 · API · Private beta</span>
        <span style={{ ...mono, fontSize: 9, color: "#C0BDB6", letterSpacing: "0.08em", textTransform: "uppercase" }}>One call · One verdict</span>
      </footer>
    </main>
  );
}
