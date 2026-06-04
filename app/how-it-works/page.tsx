import Link from "next/link";
import NavAuth from "@/components/NavAuth";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How It Works — Five-Signal Verification',
  description: 'See how Trustmarc verifies media authenticity using C2PA provenance, EXIF metadata, AI generation detection, error level analysis, and cryptographic fingerprinting.',
};

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const epilogue = { fontFamily: "'Epilogue', sans-serif" } as const;

export default function HowItWorksPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F2F0EB", color: "#1C1C1A", ...epilogue }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "How do I check if an image is AI-generated?",
              "acceptedAnswer": { "@type": "Answer", "text": "Upload the image to Trustmarc. Our system runs five forensic signals including AI detection, C2PA provenance check, EXIF metadata analysis, error level analysis, and cryptographic fingerprinting to return a verdict within seconds." }
            },
            {
              "@type": "Question",
              "name": "What is C2PA?",
              "acceptedAnswer": { "@type": "Answer", "text": "C2PA (Coalition for Content Provenance and Authenticity) is an open standard that cryptographically signs media at the moment of capture. Trustmarc reads these signatures to verify if an image came from a certified camera or content tool." }
            },
            {
              "@type": "Question",
              "name": "Is my uploaded file stored or shared?",
              "acceptedAnswer": { "@type": "Answer", "text": "No. Trustmarc processes your file in memory and discards it immediately after generating the verification result. We store only a cryptographic hash for the known-fakes database — never the file itself." }
            },
            {
              "@type": "Question",
              "name": "Is Trustmarc free to use?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. The free tier includes 5 verifications per month with no account required. Pro plans with unlimited verifications start at $49/month." }
            }
          ]
        })}}
      />
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #D8D5CE" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1px solid #1C1C1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#1C1C1A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ ...epilogue, fontWeight: 500, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#1C1C1A" }}>TRUSTMARC</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {([["How it works", "/how-it-works", true], ["API", "/api", false], ["Status", "/status", false]] as [string, string, boolean][]).map(([label, href, active]) => (
            <Link key={label} href={href} style={{ ...mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: active ? "#1C1C1A" : "#A8A59E", textDecoration: "none" }}>{label}</Link>
          ))}
          <NavAuth />
        </div>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "64px 40px 80px", width: "100%" }}>
        <div style={{ ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A8A59E", marginBottom: 20 }}>How it works</div>
        <h1 style={{ ...epilogue, fontWeight: 300, fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#1C1C1A", marginBottom: 16 }}>Five signals.<br />One verdict.</h1>
        <p style={{ ...epilogue, fontWeight: 300, fontSize: 15, lineHeight: 1.75, color: "#5A5855", marginBottom: 56, maxWidth: 520 }}>
          Trustmarc runs every file through five independent checks and combines them into a single trust verdict. Here is exactly what happens when you drop a file.
        </p>

        {[
          {
            num: "01",
            title: "C2PA provenance check",
            desc: "We look for a C2PA cryptographic signature embedded at the moment of capture. If present and intact, we know the file has not been altered since it left the original device. If the signature is missing or broken, we flag it.",
            tag: "Coalition for Content Provenance and Authenticity",
          },
          {
            num: "02",
            title: "EXIF metadata analysis",
            desc: "Every real camera embeds metadata at capture — device model, lens data, timestamp, GPS coordinates, camera settings. We extract and cross-reference these fields. Inconsistencies between them are a strong signal of manipulation.",
            tag: "Exchangeable image file format",
          },
          {
            num: "03",
            title: "AI generation detection",
            desc: "We run the file through Hive AI's detection model, which scores the probability that the image was generated by an AI system such as Midjourney, DALL-E, or Stable Diffusion. The score is one input — not the final verdict.",
            tag: "Hive AI API · Independent model",
          },
          {
            num: "04",
            title: "Error level analysis",
            desc: "We generate a compression anomaly heatmap. Genuine photographs show uniform compression throughout. Images that have been composited or edited show bright regions where the compression signature changes — a reliable indicator of manipulation.",
            tag: "ELA · Compression forensics",
          },
          {
            num: "05",
            title: "File fingerprint",
            desc: "We generate a SHA-256 hash of the file. This creates a unique permanent identifier. If the file is ever submitted again by anyone we can confirm it is the identical file with an identical result. Useful for legal and editorial audit trails.",
            tag: "SHA-256 · Cryptographic hash",
          },
        ].map((step, i) => (
          <div key={step.num} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 24, padding: "32px 0", borderBottom: "1px solid #D8D5CE", ...(i === 0 ? { borderTop: "1px solid #D8D5CE" } : {}) }}>
            <div style={{ ...mono, fontSize: 11, letterSpacing: "0.1em", color: "#B0ADA6", paddingTop: 3 }}>{step.num}</div>
            <div>
              <div style={{ ...epilogue, fontWeight: 400, fontSize: 16, color: "#1C1C1A", letterSpacing: "-0.01em", marginBottom: 8 }}>{step.title}</div>
              <div style={{ ...epilogue, fontWeight: 300, fontSize: 13, lineHeight: 1.75, color: "#7A7870", marginBottom: 12 }}>{step.desc}</div>
              <span style={{ ...mono, fontSize: 10, letterSpacing: "0.08em", color: "#A8A59E", background: "#ECEAE4", border: "1px solid #D8D5CE", borderRadius: 2, padding: "3px 8px", display: "inline-block" }}>{step.tag}</span>
            </div>
          </div>
        ))}

        <div style={{ ...mono, fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#B0ADA6", margin: "56px 0 20px" }}>The three verdicts</div>

        {[
          { color: "#6B8F4E", label: "Verified", title: "This media is authentic", desc: "C2PA signature intact · EXIF data consistent · AI probability low\nNo post-capture modification detected · Origin confirmed" },
          { color: "#C4882A", label: "Modified", title: "This media has been altered", desc: "Original capture detected · Post-capture edits found\nSoftware used, edit count, and modification timestamps shown" },
          { color: "#B85050", label: "Synthetic", title: "Likely AI generated", desc: "No origin signature · High AI generation probability · No camera metadata\nDimensions consistent with known AI output sizes" },
        ].map((v, i) => (
          <div key={v.label} style={{ display: "grid", gridTemplateColumns: "3px 1fr", gap: 20, padding: "20px 0", borderBottom: "1px solid #EBEBE5", alignItems: "start", ...(i === 0 ? { borderTop: "1px solid #EBEBE5" } : {}) }}>
            <div style={{ width: 3, minHeight: 60, background: v.color }} />
            <div>
              <div style={{ ...mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: v.color, marginBottom: 4 }}>{v.label}</div>
              <div style={{ ...epilogue, fontWeight: 400, fontSize: 14, color: "#1C1C1A", marginBottom: 4 }}>{v.title}</div>
              <div style={{ ...mono, fontSize: 10, color: "#B0ADA6", lineHeight: 1.7, letterSpacing: "0.04em" }}>{v.desc.split("\n").map((line, j) => <span key={j}>{line}{j === 0 && <br />}</span>)}</div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: 48, padding: 24, background: "#ECEAE4", border: "1px solid #D8D5CE", borderRadius: 2 }}>
          <div style={{ ...mono, fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A8A59E", marginBottom: 10 }}>A note on privacy</div>
          <div style={{ ...epilogue, fontWeight: 300, fontSize: 13, lineHeight: 1.75, color: "#7A7870" }}>
            Trustmarc never stores your files. Verification is stateless — your file is processed in memory and immediately discarded. We retain only the SHA-256 fingerprint and the verdict, never the file itself. No account is required.
          </div>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid #D8D5CE", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ ...mono, fontSize: 9, color: "#C0BDB6", letterSpacing: "0.08em", textTransform: "uppercase" }}>Trustmarc · 2026 · Stateless · No images stored</span>
        <div style={{ display: "flex", gap: 16 }}>
          {([["Privacy", "/privacy"], ["Terms", "/terms"], ["Cookies", "/cookies"]] as [string, string][]).map(([label, href]) => (
            <Link key={label} href={href} style={{ ...mono, fontSize: 9, color: "#C0BDB6", textDecoration: "none" }}>{label}</Link>
          ))}
        </div>
      </footer>
    </main>
  );
}
