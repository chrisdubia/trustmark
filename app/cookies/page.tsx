import type { Metadata } from "next";
import Link from "next/link";
import NavAuth from "@/components/NavAuth";

export const metadata: Metadata = { title: "Cookie Policy" };

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const epilogue = { fontFamily: "'Epilogue', sans-serif" } as const;

const toc = [
  { label: "Our approach", id: "s01" },
  { label: "Essential cookies", id: "s02" },
  { label: "What we don't use", id: "s03" },
  { label: "Managing cookies", id: "s04" },
  { label: "Contact", id: "s05" },
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

export default function CookiesPage() {
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
          <h1 style={{ ...epilogue, fontWeight: 300, fontSize: 36, letterSpacing: "-0.02em", color: "#1C1C1A", marginBottom: 12 }}>Cookie Policy</h1>
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
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Our approach</h2>
            <Highlight>"Trustmarc uses only essential cookies required for the service to function. We do not use analytics, advertising, or tracking cookies."</Highlight>
            <P last>Essential cookies are necessary for core features like signing in and processing payments. Because they are strictly necessary to provide the service you request, they do not require consent — but we disclose them here in full.</P>
          </div>
        </section>

        <section id="s02" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>02</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Essential cookies we use</h2>
            {/* Provider grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#D8D5CE", border: "1px solid #D8D5CE", borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
              {[
                { name: "Clerk", role: "Keeps you signed in" },
                { name: "Stripe", role: "Checkout & fraud prevention" },
              ].map((p) => (
                <div key={p.name} style={{ background: "#F8F6F1", padding: "11px 13px" }}>
                  <div style={{ ...epilogue, fontWeight: 400, fontSize: 12, color: "#1C1C1A", marginBottom: 2 }}>{p.name}</div>
                  <div style={{ ...mono, fontSize: 9, color: "#B0ADA6", letterSpacing: "0.03em" }}>{p.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="s03" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>03</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>What we don&apos;t use</h2>
            <P last>We do not use <Strong>analytics, advertising, tracking, or third-party marketing cookies</Strong>. We do not build advertising profiles, and we do not sell your data.</P>
          </div>
        </section>

        <section id="s04" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>04</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Managing cookies</h2>
            <P last>You can control or delete cookies through your browser settings. Please note that disabling essential cookies may prevent you from signing in or completing payments, as these features depend on them.</P>
          </div>
        </section>

        <section id="s05" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>05</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", marginBottom: 11, color: "#1C1C1A" }}>Contact</h2>
            <P last>Questions about our use of cookies? Email <Strong>hello@trustmarc.io</Strong>.</P>
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
