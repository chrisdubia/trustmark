"use client";

import Link from "next/link";
import NavAuth from "@/components/NavAuth";
import { useState } from "react";

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const epilogue = { fontFamily: "'Epilogue', sans-serif" } as const;

type ProductKey = "PRO_MONTHLY" | "PRO_ANNUAL" | "CREDIT_PACK";

function useCheckout() {
  const [loading, setLoading] = useState<ProductKey | null>(null);

  const checkout = async (product: ProductKey) => {
    setLoading(product);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Checkout failed. Please try again.");
      }
    } catch {
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return { checkout, loading };
}

export default function UpgradePage() {
  const { checkout, loading } = useCheckout();

  const plans = [
    {
      key: "PRO_MONTHLY" as ProductKey,
      label: "Pro",
      period: "Monthly",
      price: "$29",
      per: "/ month",
      highlight: false,
      features: [
        "Unlimited verifications",
        "Unlimited certificates",
        "500-item history",
        "JSON export",
        "Priority processing",
      ],
      cta: "Start Pro — $29/month",
    },
    {
      key: "PRO_ANNUAL" as ProductKey,
      label: "Pro",
      period: "Annual",
      price: "$249",
      per: "/ year",
      badge: "Save $99",
      highlight: true,
      features: [
        "Unlimited verifications",
        "Unlimited certificates",
        "500-item history",
        "JSON export",
        "Priority processing",
      ],
      cta: "Start Pro Annual — $249/year",
    },
    {
      key: "CREDIT_PACK" as ProductKey,
      label: "Credit Pack",
      period: "",
      price: "$15",
      per: "10 credits",
      highlight: false,
      features: [
        "No subscription required",
        "Pay as you go",
        "Credits never expire",
        "Use for certificates & exports",
      ],
      cta: "Buy 10 credits — $15",
      note: "No subscription. Pay as you go.",
    },
  ];

  return (
    <main style={{ display: "flex", flexDirection: "column", background: "#F2F0EB", color: "#1C1C1A", ...epilogue }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #D8D5CE" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1px solid #1C1C1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#1C1C1A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ ...epilogue, fontWeight: 500, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#1C1C1A" }}>TRUSTMARC</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {([["How it works", "/how-it-works"], ["API", "/api"], ["Status", "/status"]] as [string, string][]).map(([label, href]) => (
            <Link key={label} href={href} style={{ ...mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A8A59E", textDecoration: "none" }}>{label}</Link>
          ))}
          <NavAuth />
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "64px 40px 80px", width: "100%" }}>
        <div style={{ ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A8A59E", marginBottom: 20 }}>Pricing</div>
        <h1 style={{ ...epilogue, fontWeight: 300, fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#1C1C1A", marginBottom: 16 }}>
          Simple, honest pricing.
        </h1>
        <p style={{ ...epilogue, fontWeight: 300, fontSize: 15, lineHeight: 1.75, color: "#5A5855", marginBottom: 48, maxWidth: 480 }}>
          Free for the first 5 verifications. No account required. Upgrade for unlimited access.
        </p>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "#D8D5CE", border: "1px solid #D8D5CE", borderRadius: 2, overflow: "hidden", marginBottom: 40 }}>
          {plans.map((plan) => (
            <div key={plan.key} style={{
              background: "#F8F6F1",
              padding: 28,
              display: "flex",
              flexDirection: "column",
              outline: plan.highlight ? "2px solid #6B8F4E" : "none",
              outlineOffset: -2,
              position: "relative",
            }}>
              {plan.badge && (
                <div style={{ position: "absolute", top: 16, right: 16, ...mono, fontSize: 8, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B8F4E", background: "#EEF5E8", border: "1px solid #6B8F4E", borderRadius: 2, padding: "2px 6px" }}>
                  {plan.badge}
                </div>
              )}

              <div style={{ ...mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: plan.highlight ? "#6B8F4E" : "#B0ADA6", marginBottom: 6 }}>
                {plan.label}{plan.period ? ` · ${plan.period}` : ""}
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ ...epilogue, fontWeight: 300, fontSize: 36, letterSpacing: "-0.02em", color: "#1C1C1A", lineHeight: 1 }}>{plan.price}</span>
                <span style={{ ...mono, fontSize: 10, color: "#B0ADA6" }}>{plan.per}</span>
              </div>

              {plan.note && (
                <div style={{ ...mono, fontSize: 9, color: "#B0ADA6", letterSpacing: "0.04em", marginBottom: 20 }}>{plan.note}</div>
              )}

              <div style={{ height: 1, background: "#D8D5CE", margin: "16px 0" }} />

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ ...mono, fontSize: 10, color: "#6B8F4E", flexShrink: 0, marginTop: 1 }}>+</span>
                    <span style={{ ...epilogue, fontWeight: 300, fontSize: 13, color: "#5A5855", lineHeight: 1.5 }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => checkout(plan.key)}
                disabled={loading === plan.key}
                style={{
                  ...mono,
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "12px 16px",
                  borderRadius: 2,
                  cursor: loading === plan.key ? "default" : "pointer",
                  background: plan.highlight ? "#1C1C1A" : "transparent",
                  color: plan.highlight ? "#F2F0EB" : "#1C1C1A",
                  border: "1px solid #1C1C1A",
                  opacity: loading === plan.key ? 0.6 : 1,
                  width: "100%",
                }}
              >
                {loading === plan.key ? "Redirecting…" : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Free tier note */}
        <div style={{ borderTop: "1px solid #D8D5CE", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ ...mono, fontSize: 9, letterSpacing: "0.14em", textTransform: "uppercase", color: "#B0ADA6", marginBottom: 6 }}>Free tier</div>
            <div style={{ ...epilogue, fontWeight: 300, fontSize: 13, color: "#7A7870" }}>5 verifications · 2 certificate downloads · No account required</div>
          </div>
          <div style={{ ...mono, fontSize: 10, color: "#B0ADA6", letterSpacing: "0.04em", textAlign: "right" }}>
            Education pricing available at $9/month<br />
            for verified .edu accounts.<br />
            <a href="mailto:hello@trustmarc.io" style={{ color: "#B0ADA6" }}>hello@trustmarc.io</a>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid #D8D5CE", padding: "14px 40px", display: "flex", justifyContent: "space-between" }}>
        <span style={{ ...mono, fontSize: 9, color: "#C0BDB6", letterSpacing: "0.08em", textTransform: "uppercase" }}>Trustmarc · 2026</span>
        <span style={{ ...mono, fontSize: 9, color: "#C0BDB6", letterSpacing: "0.08em", textTransform: "uppercase" }}>Secure checkout via Stripe</span>
      </footer>

      <style>{`
        @media (max-width: 680px) {
          .upgrade-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
