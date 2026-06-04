import Link from "next/link";

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const epilogue = { fontFamily: "'Epilogue', sans-serif" } as const;

export default function UpgradeSuccessPage() {
  return (
    <main style={{ display: "flex", flexDirection: "column", background: "#F2F0EB", color: "#1C1C1A", ...epilogue }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #D8D5CE" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1px solid #1C1C1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#1C1C1A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ ...epilogue, fontWeight: 500, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#1C1C1A" }}>TRUSTMARC</span>
        </Link>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "80px 40px", width: "100%", textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid #6B8F4E", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5L6.5 12L13 5" stroke="#6B8F4E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div style={{ ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#6B8F4E", marginBottom: 16 }}>Payment confirmed</div>
        <h1 style={{ ...epilogue, fontWeight: 300, fontSize: 32, letterSpacing: "-0.02em", color: "#1C1C1A", marginBottom: 16 }}>
          Welcome to Pro.
        </h1>
        <p style={{ ...epilogue, fontWeight: 300, fontSize: 15, lineHeight: 1.75, color: "#5A5855", marginBottom: 40 }}>
          Your account has been upgraded. Unlimited verifications, certificates, and history are now active.
        </p>

        <div style={{ background: "#F8F6F1", border: "1px solid #D8D5CE", borderRadius: 2, padding: 24, marginBottom: 32, textAlign: "left" }}>
          <div style={{ ...mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B0ADA6", marginBottom: 12 }}>What&apos;s unlocked</div>
          {[
            "Unlimited verifications",
            "Unlimited PDF certificates",
            "500-item verification history",
            "JSON export on every result",
          ].map((item) => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #EBEBE5" }}>
              <span style={{ ...mono, fontSize: 10, color: "#6B8F4E" }}>+</span>
              <span style={{ ...epilogue, fontWeight: 300, fontSize: 13, color: "#5A5855" }}>{item}</span>
            </div>
          ))}
        </div>

        <Link href="/" style={{
          display: "inline-block",
          background: "#1C1C1A",
          color: "#F2F0EB",
          border: "1px solid #1C1C1A",
          borderRadius: 2,
          padding: "12px 32px",
          ...mono,
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          textDecoration: "none",
        }}>
          Start verifying
        </Link>
      </div>

      <footer style={{ borderTop: "1px solid #D8D5CE", padding: "14px 40px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ ...mono, fontSize: 9, color: "#C0BDB6", letterSpacing: "0.08em", textTransform: "uppercase" }}>Trustmarc · 2026</span>
        <span style={{ ...mono, fontSize: 9, color: "#C0BDB6", letterSpacing: "0.08em", textTransform: "uppercase" }}>Questions? hello@trustmarc.io</span>
      </footer>
    </main>
  );
}
