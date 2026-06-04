"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import DropZone from "@/components/DropZone";
import ResultCard from "@/components/ResultCard";
import ProgressBar from "@/components/ProgressBar";
import NavAuth from "@/components/NavAuth";
import type { VerificationResult } from "@/lib/types";

type AppState = "idle" | "verifying" | "result" | "error";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Compress image client-side to keep payload under 4MB (Vercel body limit).
// Reads EXIF via original file, sends compressed copy to API.
function compressImage(dataUrl: string, maxDimension = 2048, quality = 0.88): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl); // fallback to original
    img.src = dataUrl;
  });
}

function PrivacyExpander() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: "1px solid #E0DDD6", paddingTop: 14, marginTop: 10 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7A7870" }}
      >
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="#7A7870" strokeWidth="1.5" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
          <path d="M2 3.5l3 3 3-3"/>
        </svg>
        What happens to my file?
      </button>
      {open && (
        <div style={{ fontFamily: "'Epilogue', sans-serif", fontWeight: 300, fontSize: 13, lineHeight: 1.75, color: "#7A7870", marginTop: 12, maxWidth: 440 }}>
          When you upload a file, it is processed in memory to run our verification checks.{" "}
          <span style={{ fontWeight: 400, color: "#1C1C1A" }}>The file itself is never written to disk and never saved.</span>{" "}
          To detect AI generation, a resized copy of the image is sent to our detection partner, Hive AI, whose own privacy policy governs that processing. The moment your result is generated, the file is discarded on our end. We retain only a SHA-256 fingerprint — a one-way signature that cannot reconstruct your image — along with the filename and verdict. No account is required to verify a file.
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { user } = useUser();
  const [state, setState] = useState<AppState>("idle");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setState("verifying");
    setErrorMessage(null);

    let dataUrl: string;
    try {
      dataUrl = await fileToDataUrl(file);
    } catch {
      setState("error");
      setErrorMessage("Could not read the file. Please try again.");
      return;
    }

    // Extract EXIF from original file BEFORE canvas compression strips all metadata
    let clientExif: Record<string, unknown> | null = null;
    if (file.type.startsWith("image/")) {
      try {
        const exifr = (await import("exifr")).default;
        clientExif = await exifr.parse(file, {
          tiff: true, xmp: false, icc: false, iptc: false,
          gps: true, translateKeys: true, translateValues: true, reviveValues: true,
        }) ?? null;
      } catch { /* ignore — server will attempt extraction from dataUrl */ }
    }

    // Show preview for images only
    if (file.type.startsWith("image/")) {
      setPreviewUrl(dataUrl);
      // Compress before sending to stay under Vercel's 4MB body limit
      dataUrl = await compressImage(dataUrl);
    } else {
      setPreviewUrl(null);
    }

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          dataUrl,
          clientExif,
          userEmail: user?.primaryEmailAddress?.emailAddress ?? "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Server error ${res.status}`);
      }

      setResult(data);
      setState("result");
    } catch (e: unknown) {
      setState("error");
      setErrorMessage(
        e instanceof Error ? e.message : "Verification failed. Please try again."
      );
    }
  }, []);

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setPreviewUrl(null);
    setErrorMessage(null);
  };

  return (
    <main style={{ display: "flex", flexDirection: "column" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Trustmarc",
          "applicationCategory": "SecurityApplication",
          "operatingSystem": "Any",
          "description": "Verify whether any image, video, or document is authentic, edited, or AI-generated.",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
          "url": "https://trustmarc.io"
        })}}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Trustmarc",
          "url": "https://trustmarc.io",
          "logo": "https://trustmarc.io/og-image.png",
          "contactPoint": { "@type": "ContactPoint", "email": "hello@trustmarc.io", "contactType": "customer support" }
        })}}
      />
      {/* Header */}
      <header style={{
        background: "#F2F0EB",
        borderBottom: "1px solid #D8D5CE",
        padding: "20px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 18, height: 18,
            border: "1px solid #1C1C1A",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5.2L4 7.5L8 3" stroke="#1C1C1A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{
            fontFamily: "'Epilogue', sans-serif",
            fontWeight: 500,
            fontSize: 12,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#1C1C1A",
          }}>TRUSTMARC</span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {([["How it works", "/how-it-works"], ["API", "/api"], ["Status", "/status"]] as [string, string][]).map(([label, href]) => (
            <a key={label} href={href} style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#A8A59E",
              textDecoration: "none",
            }}>{label}</a>
          ))}
          <NavAuth />
        </nav>
      </header>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            {/* Two-column landing */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 340px",
              borderBottom: "1px solid #D8D5CE",
            }} className="landing-grid">
              {/* Left column */}
              <div style={{
                padding: 40,
                borderRight: "1px solid #D8D5CE",
              }}>
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "#B0ADA6",
                  marginBottom: 24,
                }}>Media authenticity · Phase 1</div>

                <h1 style={{
                  fontFamily: "'Epilogue', sans-serif",
                  fontWeight: 300,
                  fontSize: 44,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  color: "#1C1C1A",
                }}>
                  Is what you see<br />
                  <em style={{ fontStyle: "italic", color: "#6B8F4E" }}>real?</em>
                </h1>

                <p style={{
                  fontFamily: "'Epilogue', sans-serif",
                  fontWeight: 300,
                  fontSize: 15,
                  color: "#5A5855",
                  maxWidth: 400,
                  marginTop: 16,
                  lineHeight: 1.6,
                }}>
                  Drop any image, video, or document. We check for AI generation, hidden edits, and origin signatures. Results in under three seconds.
                </p>

                <div style={{ marginTop: 32 }}>
                  <DropZone onFile={handleFile} />
                </div>

                {/* Privacy micro-note */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#6B8F4E", letterSpacing: "0.04em", marginTop: 10, marginBottom: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B8F4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Your file is analyzed in memory and never stored on our servers
                </div>

                {/* Expandable privacy detail */}
                <PrivacyExpander />


                <div style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 24,
                  marginTop: 16,
                }}>
                  {["Never stored", "Privacy first"].map((tag, i) => (
                    <span key={tag} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {i > 0 && <span style={{ color: "#D8D5CE", fontSize: 10 }}>·</span>}
                      <span style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 11,
                        color: "#7A7870",
                      }}>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Right column */}
              <div style={{
                padding: "40px 32px",
                background: "#ECEAE4",
              }}>
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                  color: "#A8A59E",
                  marginBottom: 12,
                }}>What you will receive</div>
                <div style={{ height: 1, background: "#D8D5CE", marginBottom: 0 }} />

                {[
                  {
                    color: "#6B8F4E",
                    state: "VERIFIED",
                    title: "Authentic",
                    detail: "Camera metadata, origin signatures, and AI checks all pass",
                  },
                  {
                    color: "#C4882A",
                    state: "MODIFIED",
                    title: "Altered",
                    detail: "Real content with evidence of post-processing or stripped provenance",
                  },
                  {
                    color: "#B85050",
                    state: "SYNTHETIC",
                    title: "AI generated",
                    detail: "High probability of synthetic or AI-generated content",
                  },
                ].map((item) => (
                  <div key={item.state} style={{
                    padding: "20px 0",
                    borderBottom: "1px solid #D8D5CE",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}>
                    <div style={{
                      width: 8, height: 8,
                      borderRadius: "50%",
                      background: item.color,
                      flexShrink: 0,
                      marginTop: 3,
                    }} />
                    <div>
                      <div style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 10,
                        textTransform: "uppercase",
                        color: item.color,
                        letterSpacing: "0.1em",
                        marginBottom: 4,
                      }}>{item.state}</div>
                      <div style={{
                        fontFamily: "'Epilogue', sans-serif",
                        fontWeight: 400,
                        fontSize: 15,
                        color: "#1C1C1A",
                        marginBottom: 4,
                      }}>{item.title}</div>
                      <div style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 12,
                        color: "#5A5855",
                        lineHeight: 1.5,
                      }}>{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {state === "verifying" && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 40px",
              textAlign: "center",
            }}
          >
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "#B0ADA6",
              marginBottom: 12,
            }}>Analyzing</div>
            <div style={{
              fontFamily: "'Epilogue', sans-serif",
              fontWeight: 300,
              fontSize: 28,
              color: "#1C1C1A",
              marginBottom: 24,
            }}>Verifying authenticity...</div>
            {previewUrl && (
              <div style={{ marginBottom: 24 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: 96, height: 96,
                    borderRadius: 2,
                    objectFit: "cover",
                    border: "1px solid #D8D5CE",
                    margin: "0 auto",
                    display: "block",
                  }}
                />
              </div>
            )}
            <div style={{ width: "100%", maxWidth: 400 }}>
              <ProgressBar />
            </div>
          </motion.div>
        )}

        {state === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px 40px",
            }}
          >
            <div style={{
              border: "1px solid #B85050",
              borderRadius: 2,
              maxWidth: 400,
              width: "100%",
              padding: 32,
              background: "#F8F6F1",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#B85050",
                marginBottom: 12,
              }}>Error</div>
              <div style={{
                fontFamily: "'Epilogue', sans-serif",
                fontWeight: 300,
                fontSize: 20,
                color: "#1C1C1A",
                marginBottom: 8,
              }}>Verification failed</div>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                color: "#8A8880",
              }}>{errorMessage ?? "Something went wrong. Please try a different file."}</div>
              <button
                onClick={handleReset}
                style={{
                  marginTop: 20,
                  fontFamily: "'Epilogue', sans-serif",
                  fontWeight: 400,
                  fontSize: 13,
                  border: "1px solid #D8D5CE",
                  background: "transparent",
                  padding: "10px 24px",
                  borderRadius: 2,
                  color: "#1C1C1A",
                  cursor: "pointer",
                }}
              >Try again</button>
            </div>
          </motion.div>
        )}

        {state === "result" && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ flex: 1 }}
          >
            <ResultCard result={result} previewUrl={previewUrl} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #D8D5CE",
        padding: "14px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#C0BDB6" }}>
          Trustmarc · Stateless · Privacy-first
        </span>
        <div style={{ display: "flex", gap: 16 }}>
          {([["Privacy", "/privacy"], ["Terms", "/terms"], ["Cookies", "/cookies"]] as [string, string][]).map(([label, href]) => (
            <Link key={label} href={href} style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: "#C0BDB6", textDecoration: "none" }}>{label}</Link>
          ))}
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .landing-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
