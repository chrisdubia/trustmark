"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("trustmarc_cookie_notice");
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  const handleDismiss = () => {
    localStorage.setItem("trustmarc_cookie_notice", "dismissed");
    setVisible(false);
  };

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      left: 40,
      right: 40,
      background: "#1C1C1A",
      borderRadius: 4,
      padding: "16px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 24,
      zIndex: 100,
    }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#D8D5CE", lineHeight: 1.6 }}>
        Trustmarc uses only essential cookies required to sign you in and process payments. We don&apos;t use tracking or advertising cookies.{" "}
        <Link href="/cookies" style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#A8C97E", textDecoration: "underline" }}>
          Cookie Policy
        </Link>
      </span>
      <button
        onClick={handleDismiss}
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          textTransform: "uppercase",
          background: "#F2F0EB",
          color: "#1C1C1A",
          borderRadius: 2,
          padding: "9px 18px",
          border: "none",
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        GOT IT
      </button>
    </div>
  );
}
