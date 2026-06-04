import Link from "next/link";
import NavAuth from "@/components/NavAuth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const epilogue = { fontFamily: "'Epilogue', sans-serif" } as const;

const toc = [
  { id: "s01", label: "Files you upload" },
  { id: "s02", label: "What we retain" },
  { id: "s03", label: "Accounts" },
  { id: "s04", label: "Payments" },
  { id: "s05", label: "Third parties" },
  { id: "s06", label: "Your rights" },
  { id: "s07", label: "Data retention and security" },
  { id: "s08", label: "Children's privacy" },
  { id: "s09", label: "Changes to this policy" },
  { id: "s10", label: "Contact" },
];

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F2F0EB", color: "#1C1C1A", ...epilogue }}>
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
          <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", color: "#A8A59E", marginBottom: 12 }}>Legal</div>
          <h1 style={{ ...epilogue, fontWeight: 300, fontSize: 36, letterSpacing: "-0.02em", color: "#1C1C1A", marginBottom: 10 }}>Privacy Policy</h1>
          <div style={{ ...mono, fontSize: 10, color: "#B0ADA6" }}>Effective June 4, 2026 · Trustmarc</div>
        </div>

        {/* TOC */}
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 7, padding: "22px 0" }}>
          {toc.map((item) => (
            <a key={item.id} href={`#${item.id}`} style={{ ...mono, fontSize: 10, color: "#7A7870", border: "1px solid #D8D5CE", borderRadius: 2, padding: "5px 11px", textDecoration: "none" }}>{item.label}</a>
          ))}
        </div>

        {/* Section 01 */}
        <section id="s01" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>01</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", color: "#1C1C1A", marginBottom: 11 }}>Files you upload</h2>
            <div style={{ background: "#ECEAE4", borderLeft: "2px solid #6B8F4E", padding: "15px 17px", borderRadius: "0 2px 2px 0", marginBottom: 11 }}>
              <p style={{ ...epilogue, fontWeight: 300, fontSize: 13, lineHeight: 1.8, color: "#5A5855", margin: 0 }}>
                &ldquo;Your file is never written to disk and never stored as a file. It is processed entirely in memory to run our verification checks, then discarded the moment your result is generated.&rdquo;
              </p>
            </div>
            <p style={{ ...epilogue, fontWeight: 300, fontSize: 13, lineHeight: 1.8, color: "#5A5855", margin: 0 }}>
              To detect AI generation, a resized copy of your image is sent to our detection partner, Hive AI, whose own privacy policy governs that processing. We do not retain the file itself in any form after your result is produced.
            </p>
          </div>
        </section>

        {/* Section 02 */}
        <section id="s02" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>02</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", color: "#1C1C1A", marginBottom: 11 }}>What we retain</h2>
            <p style={{ ...epilogue, fontWeight: 300, fontSize: 13, lineHeight: 1.8, color: "#5A5855", margin: 0 }}>
              We keep only a <strong style={{ color: "#1C1C1A", fontWeight: 400 }}>SHA-256 fingerprint</strong> — a one-way mathematical signature that cannot be reversed to reconstruct your image — along with the filename, the verdict, the confidence score, and timestamps. If you are signed in, this verification history is stored in our database so you can access it later.
            </p>
          </div>
        </section>

        {/* Section 03 */}
        <section id="s03" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>03</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", color: "#1C1C1A", marginBottom: 11 }}>Account information</h2>
            <p style={{ ...epilogue, fontWeight: 300, fontSize: 13, lineHeight: 1.8, color: "#5A5855", margin: 0 }}>
              If you create an account, we use <strong style={{ color: "#1C1C1A", fontWeight: 400 }}>Clerk</strong> to manage authentication and store your email address. You can request deletion of your account and associated data at any time.
            </p>
          </div>
        </section>

        {/* Section 04 */}
        <section id="s04" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>04</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", color: "#1C1C1A", marginBottom: 11 }}>Payments</h2>
            <p style={{ ...epilogue, fontWeight: 300, fontSize: 13, lineHeight: 1.8, color: "#5A5855", margin: 0 }}>
              Payments are processed by <strong style={{ color: "#1C1C1A", fontWeight: 400 }}>Stripe</strong>. We never see or store your full payment card details — these are handled entirely by Stripe under their own security standards.
            </p>
          </div>
        </section>

        {/* Section 05 */}
        <section id="s05" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>05</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", color: "#1C1C1A", marginBottom: 11 }}>Third-party services we use</h2>
            <p style={{ ...epilogue, fontWeight: 300, fontSize: 13, lineHeight: 1.8, color: "#5A5855", marginBottom: 11 }}>
              We rely on trusted providers to operate Trustmarc. Each processes data under its own privacy policy.
            </p>
            {/* Provider grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "#D8D5CE", border: "1px solid #D8D5CE", borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
              {[
                { name: "Hive AI", role: "AI generation detection" },
                { name: "Clerk", role: "Account authentication" },
                { name: "Stripe", role: "Payment processing" },
                { name: "Vercel", role: "Hosting" },
                { name: "Upstash", role: "Data storage" },
              ].map((p) => (
                <div key={p.name} style={{ background: "#F8F6F1", padding: "11px 13px" }}>
                  <div style={{ ...epilogue, fontWeight: 400, fontSize: 12, color: "#1C1C1A", marginBottom: 2 }}>{p.name}</div>
                  <div style={{ ...mono, fontSize: 9, color: "#B0ADA6", letterSpacing: "0.03em" }}>{p.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 06 */}
        <section id="s06" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>06</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", color: "#1C1C1A", marginBottom: 11 }}>Your rights</h2>
            <p style={{ ...epilogue, fontWeight: 300, fontSize: 13, lineHeight: 1.8, color: "#5A5855", margin: 0 }}>
              You may request access to, correction of, or deletion of your data at any time. EU and UK users have rights under the <strong style={{ color: "#1C1C1A", fontWeight: 400 }}>GDPR</strong>; California residents have rights under the <strong style={{ color: "#1C1C1A", fontWeight: 400 }}>CCPA</strong>. To exercise any of these, email hello@trustmarc.io.
            </p>
          </div>
        </section>

        {/* Section 07 */}
        <section id="s07" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>07</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", color: "#1C1C1A", marginBottom: 11 }}>Data retention and security</h2>
            <p style={{ ...epilogue, fontWeight: 300, fontSize: 13, lineHeight: 1.8, color: "#5A5855", margin: 0 }}>
              We retain fingerprints and verdicts to power the known-fakes database and your history. We use industry-standard measures to protect stored data. No method of transmission or storage is perfectly secure, and we cannot guarantee absolute security.
            </p>
          </div>
        </section>

        {/* Section 08 */}
        <section id="s08" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>08</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", color: "#1C1C1A", marginBottom: 11 }}>Children&apos;s privacy</h2>
            <p style={{ ...epilogue, fontWeight: 300, fontSize: 13, lineHeight: 1.8, color: "#5A5855", margin: 0 }}>
              Trustmarc is not directed at children under 13, and we do not knowingly collect personal information from them.
            </p>
          </div>
        </section>

        {/* Section 09 */}
        <section id="s09" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0", borderBottom: "1px solid #EBEBE5" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>09</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", color: "#1C1C1A", marginBottom: 11 }}>Changes to this policy</h2>
            <p style={{ ...epilogue, fontWeight: 300, fontSize: 13, lineHeight: 1.8, color: "#5A5855", margin: 0 }}>
              We may update this policy from time to time. Material changes will be reflected in the effective date above and, where appropriate, communicated to you directly.
            </p>
          </div>
        </section>

        {/* Section 10 */}
        <section id="s10" style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 18, padding: "26px 0" }}>
          <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", paddingTop: 3 }}>10</div>
          <div>
            <h2 style={{ ...epilogue, fontWeight: 400, fontSize: 16, letterSpacing: "-0.01em", color: "#1C1C1A", marginBottom: 11 }}>Contact</h2>
            <p style={{ ...epilogue, fontWeight: 300, fontSize: 13, lineHeight: 1.8, color: "#5A5855", margin: 0 }}>
              Questions about this policy or your data? Email <strong style={{ color: "#1C1C1A", fontWeight: 400 }}>hello@trustmarc.io</strong>.
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #D8D5CE", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...mono, fontSize: 9, color: "#C0BDB6" }}>Trustmarc · 2026</span>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/privacy" style={{ ...mono, fontSize: 9, color: "#C0BDB6", textDecoration: "none" }}>Privacy</Link>
          <Link href="/terms" style={{ ...mono, fontSize: 9, color: "#C0BDB6", textDecoration: "none" }}>Terms</Link>
          <Link href="/cookies" style={{ ...mono, fontSize: 9, color: "#C0BDB6", textDecoration: "none" }}>Cookies</Link>
        </div>
      </footer>
    </main>
  );
}
