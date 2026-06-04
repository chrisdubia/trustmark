"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import NavAuth from "@/components/NavAuth";

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const epilogue = { fontFamily: "'Epilogue', sans-serif" } as const;

type ProductKey = "PRO_MONTHLY" | "TEAMS_MONTHLY" | "CREDIT_PACK";

function CheckoutButton({
  product,
  label,
  buttonStyle,
  email,
}: {
  product: ProductKey;
  label: string;
  buttonStyle: React.CSSProperties;
  email: string | undefined;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, email }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Checkout failed");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.7 : 1, cursor: loading ? "default" : "pointer" }}>
        {loading ? "Loading…" : label}
      </button>
      {error && (
        <div style={{ ...mono, fontSize: 9, color: "#B85050", marginTop: 4, textAlign: "center" }}>
          {error}
        </div>
      )}
    </div>
  );
}

const btnBase: React.CSSProperties = {
  width: "100%",
  padding: "11px 0",
  borderRadius: 2,
  fontFamily: "'DM Mono', monospace",
  fontSize: 9,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  textAlign: "center",
  border: "1px solid #1C1C1A",
  transition: "all 0.15s",
  display: "block",
};

const features = (items: string[], excluded?: string[]) => (
  <ul style={{ listStyle: "none", marginBottom: 24, flex: 1 }}>
    {items.map((f) => (
      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", fontSize: 12, fontWeight: 300, color: "#5A5855", lineHeight: 1.4, ...epilogue }}>
        <span style={{ ...mono, fontSize: 11, color: "#6B8F4E", flexShrink: 0, marginTop: 1 }}>+</span>{f}
      </li>
    ))}
    {(excluded ?? []).map((f) => (
      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", fontSize: 12, fontWeight: 300, color: "#B0ADA6", lineHeight: 1.4, ...epilogue }}>
        <span style={{ ...mono, fontSize: 11, color: "#C0BDB6", flexShrink: 0, marginTop: 1 }}>–</span>{f}
      </li>
    ))}
  </ul>
);

export default function UpgradePage() {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <div style={{ ...epilogue, background: "#F2F0EB", color: "#1C1C1A", minHeight: "100vh" }}>
      {/* Nav */}
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
        <NavAuth />
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "52px 40px 64px" }}>
        {/* TODO: remove test banner before launch */}
        <div style={{ background: "#FFF8EC", border: "1px solid #C4882A", borderRadius: 2, padding: "10px 16px", marginBottom: 30, textAlign: "center", ...mono, fontSize: 10, letterSpacing: "0.06em", color: "#92570a" }}>
          ⚠ TEST MODE — Stripe checkout in test mode · Use card 4242 4242 4242 4242
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{ ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A8A59E", marginBottom: 16 }}>
            Pricing
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.1, color: "#1C1C1A", marginBottom: 14 }}>
            Verify with <em style={{ fontStyle: "italic", color: "#6B8F4E" }}>confidence</em>
          </h1>
          <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.7, color: "#7A7870", maxWidth: 480, margin: "0 auto" }}>
            Start free. Upgrade for unlimited verifications, certificates, and enterprise-grade tools. Cancel anytime.
          </p>
        </div>

        {/* 4-column plan grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>

          {/* Free */}
          <div style={{ background: "#F8F6F1", border: "1px solid #D8D5CE", borderRadius: 3, padding: "26px 20px", display: "flex", flexDirection: "column" }}>
            <div style={{ ...mono, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#A8A59E", marginBottom: 14 }}>Free</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 4 }}>
              <span style={{ fontSize: 34, fontWeight: 300, letterSpacing: "-0.02em", color: "#1C1C1A", lineHeight: 1 }}>$0</span>
            </div>
            <div style={{ ...mono, fontSize: 9, color: "transparent", marginBottom: 22, minHeight: 12, userSelect: "none" }}>.</div>
            {features(
              ["5 verifications / month", "2 certificate downloads", "Known-fakes check", "Last 5 history"],
              ["JSON export"]
            )}
            <button disabled style={{ ...btnBase, background: "transparent", color: "#B0ADA6", borderColor: "#D8D5CE", cursor: "default" }}>
              Current plan
            </button>
          </div>

          {/* Pro — featured */}
          <div style={{ background: "#F8F6F1", border: "1.5px solid #6B8F4E", borderRadius: 3, padding: "26px 20px", display: "flex", flexDirection: "column", position: "relative" }}>
            <div style={{ position: "absolute", top: -1, right: 16, background: "#6B8F4E", color: "#F2F0EB", ...mono, fontSize: 8, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 9px", borderRadius: "0 0 3px 3px" }}>
              Most popular
            </div>
            <div style={{ ...mono, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#A8A59E", marginBottom: 14 }}>Pro</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 4 }}>
              <span style={{ fontSize: 34, fontWeight: 300, letterSpacing: "-0.02em", color: "#1C1C1A", lineHeight: 1 }}>$49</span>
              <span style={{ ...mono, fontSize: 10, color: "#B0ADA6" }}>/mo</span>
            </div>
            <div style={{ ...mono, fontSize: 9, color: "#6B8F4E", marginBottom: 22, minHeight: 12 }}>or $399/year — save $189</div>
            {features(["Unlimited verifications", "Unlimited certificates", "JSON export", "Full history — 500", "Priority processing"])}
            <CheckoutButton
              product="PRO_MONTHLY"
              label="Start Pro"
              email={email}
              buttonStyle={{ ...btnBase, background: "#6B8F4E", color: "#F2F0EB", borderColor: "#6B8F4E" }}
            />
          </div>

          {/* Teams */}
          <div style={{ background: "#F8F6F1", border: "1px solid #D8D5CE", borderRadius: 3, padding: "26px 20px", display: "flex", flexDirection: "column" }}>
            <div style={{ ...mono, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#A8A59E", marginBottom: 14 }}>Teams</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 4 }}>
              <span style={{ fontSize: 34, fontWeight: 300, letterSpacing: "-0.02em", color: "#1C1C1A", lineHeight: 1 }}>$149</span>
              <span style={{ ...mono, fontSize: 10, color: "#B0ADA6" }}>/mo</span>
            </div>
            <div style={{ ...mono, fontSize: 9, color: "#6B8F4E", marginBottom: 22, minHeight: 12 }}>up to 5 users</div>
            {features(["Everything in Pro", "5 team members", "Shared history", "Team dashboard", "Branded certificates"])}
            <CheckoutButton
              product="TEAMS_MONTHLY"
              label="Start Teams"
              email={email}
              buttonStyle={{ ...btnBase, background: "#1C1C1A", color: "#F2F0EB" }}
            />
          </div>

          {/* Enterprise */}
          <div style={{ background: "#F8F6F1", border: "1px solid #D8D5CE", borderRadius: 3, padding: "26px 20px", display: "flex", flexDirection: "column" }}>
            <div style={{ ...mono, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#A8A59E", marginBottom: 14 }}>Enterprise</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 4 }}>
              <span style={{ fontSize: 34, fontWeight: 300, letterSpacing: "-0.02em", color: "#1C1C1A", lineHeight: 1 }}>Custom</span>
            </div>
            <div style={{ ...mono, fontSize: 9, color: "#6B8F4E", marginBottom: 22, minHeight: 12 }}>volume &amp; API pricing</div>
            {features(["API access", "Bulk verification", "Compliance exports", "SLA & support", "Dedicated onboarding"])}
            <a
              href="mailto:hello@trustmarc.io?subject=Enterprise%20inquiry"
              style={{ ...btnBase, background: "transparent", color: "#1C1C1A", textDecoration: "none", lineHeight: "normal", padding: "11px 0" }}
            >
              Contact sales
            </a>
          </div>
        </div>

        {/* Credit pack row */}
        <div style={{ background: "#ECEAE4", border: "1px solid #D8D5CE", borderRadius: 3, padding: "22px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 400, color: "#1C1C1A", marginBottom: 4 }}>Credit pack</div>
            <div style={{ ...mono, fontSize: 11, color: "#B0ADA6", letterSpacing: "0.04em" }}>No subscription · Pay as you go · For occasional certificates</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ fontSize: 22, fontWeight: 300, color: "#1C1C1A" }}>
              $15 <span style={{ ...mono, fontSize: 11, color: "#B0ADA6" }}>/ 10 credits</span>
            </div>
            <CheckoutButton
              product="CREDIT_PACK"
              label="Buy credits"
              email={email}
              buttonStyle={{ padding: "10px 22px", background: "transparent", border: "1px solid #1C1C1A", borderRadius: 2, ...mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap", transition: "all 0.15s", color: "#1C1C1A", width: "auto" }}
            />
          </div>
        </div>

        {/* Education note */}
        <div style={{ textAlign: "center", ...mono, fontSize: 11, color: "#B0ADA6", letterSpacing: "0.04em", lineHeight: 1.7 }}>
          Education pricing available at $19/month for verified .edu accounts.<br />
          Contact{" "}
          <a href="mailto:hello@trustmarc.io" style={{ color: "#4A7A9B" }}>
            hello@trustmarc.io
          </a>
        </div>
      </div>
    </div>
  );
}
