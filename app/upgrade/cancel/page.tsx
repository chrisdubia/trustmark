import Link from "next/link";

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const epilogue = { fontFamily: "'Epilogue', sans-serif" } as const;

export default function UpgradeCancelPage() {
  return (
    <div style={{ ...epilogue, background: "#F2F0EB", color: "#1C1C1A", minHeight: "100vh" }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #D8D5CE" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1px solid #1C1C1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 4l2 2 4-4" stroke="#1C1C1A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ ...mono, fontWeight: 500, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#1C1C1A" }}>
            Trustmarc
          </span>
        </Link>
      </nav>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 40px", textAlign: "center" }}>
        <div style={{ ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#B0ADA6", marginBottom: 20 }}>
          Checkout cancelled
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 300, letterSpacing: "-0.02em", color: "#1C1C1A", marginBottom: 14 }}>
          No charge was made.
        </h1>
        <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: "#7A7870", marginBottom: 40 }}>
          You can upgrade anytime. Your account is unchanged.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link
            href="/upgrade"
            style={{ padding: "11px 24px", background: "#1C1C1A", color: "#F2F0EB", border: "1px solid #1C1C1A", borderRadius: 2, ...mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}
          >
            View plans
          </Link>
          <Link
            href="/"
            style={{ padding: "11px 24px", background: "transparent", color: "#1C1C1A", border: "1px solid #1C1C1A", borderRadius: 2, ...mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
