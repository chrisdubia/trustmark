import type { Metadata } from "next";
import Link from "next/link";
import NavAuth from "@/components/NavAuth";

export const metadata: Metadata = { title: "Terms of Service" };

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const epilogue = { fontFamily: "'Epilogue', sans-serif" } as const;

const toc = [
  { label: "Acceptance", id: "s01" },
  { label: "Service", id: "s02" },
  { label: "Verification results", id: "s03" },
  { label: "Liability", id: "s04" },
  { label: "Acceptable use", id: "s05" },
  { label: "Payment", id: "s06" },
  { label: "Governing law", id: "s07" },
];

function P({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <p style={{ ...epilogue, fontWeight: 300, fontSize: 13, lineHeight: 1.8, color: "#5A5855", marginBottom: last ? 0 : 10 }}>
      {children}
    </p>
  );
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#ECEAE4", borderLeft: "2px solid #6B8F4E", padding: "15px 17px", borderRadius: "0 2px 2px 0", marginBottom: 11 }}>
      <p style={{ ...epilogue, fontWeight: 300, fontSize: 13, lineHeight: 1.8, color: "#5A5855", margin: 0 }}>{children}</p>
    </div>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: "#1C1C1A", fontWeight: 400 }}>{children}</strong>;
}

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F2F0EB", color: "#1C1C1A" }}>
      {/* Nav */}
      <header style={{ background: "#F2F0EB", borderBottom: "1px solid #D8D5CE", padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 18, height: 18, border: "1px solid #1C1C1A", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5.2L4 7.5L8 3" stroke="#1C1C1A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ ...epilogue, fontWeight: 500, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#1C1C1A" }}>TRUSTMARC</span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {([["How it works", "/how-it-works"], ["API", "/api"], ["Status", "/status"]] as [string, string][]).map(([label, href]) => (
            <Link key={label} href={href} style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#A8A59E", textDecoration: "none" }}>{label}</Link>
          ))}
          <NavAuth />
        </nav>
      </header>

      {/* Body */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "52px 40px 64px", width: "100%" }}>
        {/* Document header */}
        <div style={{ paddingBottom: 26, borderBottom: "1px solid #D8D5CE" }}>
          <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#A8A59E", marginBottom: 12 }}>Legal</div>
          <h1 style={{ ...epilogue, fontWeight: 300, fontSize: 36, letterSpacing: "-0.02em", color: "#1C1C1A", marginBottom: 12 }}>Terms of Service</h1>
          <div style={{ ...mono, fontSize: 10, color: "#B0ADA6" }}>Effective June 4, 2026 · Trustmarc</div>
        </div>

        {/* TOC */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, padding: "22px 0" }}>
          {toc.map((item) => (
            <a key={item.id} href={`#${item.id}`} style={{ ...mono, fontSize: 10, color: "#7A7870", border: "1px solid #D8D5CE", borderRadius: 2, padding: "5px 11px", textDecoration: "none" }}>{item.label}</a>
          ))}
        </div>

        {/* Sections */}
        <section id="s01" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>01</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Acceptance of terms</h2>
            <P last>By accessing or using Trustmarc, you agree to be bound by these Terms of Service. If you do not agree, please do not use the service.</P>
          </div>
        </section>

        <section id="s02" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>02</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Service description</h2>
            <P last>Trustmarc is a media authenticity verification tool that analyzes uploaded images, videos, and documents using multiple forensic signals and returns a verdict with a confidence score and supporting details.</P>
          </div>
        </section>

        <section id="s03" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>03</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Nature of verification results</h2>
            <Highlight>"Trustmarc verdicts are probabilistic assessments based on available signals, not legal determinations or guarantees of authenticity. AI detection carries an inherent margin of error."</Highlight>
            <P last>Verification results should be treated as one component of a broader review process. They are not a substitute for professional, legal, journalistic, or editorial judgment, and should not be relied upon as the sole basis for any consequential decision.</P>
          </div>
        </section>

        <section id="s04" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>04</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Limitation of liability</h2>
            <P last>The service is provided <Strong>&ldquo;as is&rdquo;</Strong> and &ldquo;as available&rdquo; without warranties of any kind. To the maximum extent permitted by law, Trustmarc shall not be liable for any decisions made, actions taken, or damages arising from reliance on verification results or use of the service.</P>
          </div>
        </section>

        <section id="s05" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>05</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Acceptable use</h2>
            <P last>You agree not to misuse the service, including attempting to disrupt it, circumvent usage limits, reverse-engineer it, or use it for any unlawful purpose.</P>
          </div>
        </section>

        <section id="s06" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>06</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Account responsibilities</h2>
            <P last>If you create an account, you are responsible for maintaining the confidentiality of your credentials and for all activity under your account.</P>
          </div>
        </section>

        <section id="s07" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>07</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Subscriptions, payment, and refunds</h2>
            <P last>Paid plans are billed in advance on a recurring basis. Credit packs are charged once at purchase. Fees are non-refundable except where required by law. You may cancel a subscription at any time; access continues through the end of the current billing period.</P>
          </div>
        </section>

        <section id="s08" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>08</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Cancellation</h2>
            <P last>You may cancel your subscription at any time from your account. Cancellation stops future billing; it does not retroactively refund the current period.</P>
          </div>
        </section>

        <section id="s09" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>09</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Intellectual property</h2>
            <P last>Trustmarc, its design, and its underlying technology are owned by us. These terms grant you no ownership rights in the service. You retain all rights to the files you upload.</P>
          </div>
        </section>

        <section id="s10" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>10</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Modifications to the service</h2>
            <P last>We may modify, suspend, or discontinue any part of the service at any time. We may also update these terms; continued use after changes constitutes acceptance.</P>
          </div>
        </section>

        <section id="s11" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>11</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Governing law</h2>
            <P last>These terms are governed by the laws of the <Strong>Commonwealth of Virginia</Strong>, United States, without regard to conflict-of-law principles.</P>
          </div>
        </section>

        <section id="s12" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>12</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Contact</h2>
            <P last>Questions about these terms? Email <Strong>hello@trustmarc.io</Strong>.</P>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #D8D5CE", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...mono, fontSize: 9, color: "#C0BDB6" }}>Trustmarc · 2026</span>
        <div style={{ display: "flex", gap: 16 }}>
          {([["Privacy", "/privacy"], ["Terms", "/terms"], ["Cookies", "/cookies"]] as [string, string][]).map(([label, href]) => (
            <Link key={label} href={href} style={{ ...mono, fontSize: 9, color: "#C0BDB6", textDecoration: "none" }}>{label}</Link>
          ))}
        </div>
      </footer>
    </main>
  );
}
