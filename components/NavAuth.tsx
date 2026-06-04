"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

const mono = { fontFamily: "'DM Mono', monospace" } as const;

export default function NavAuth() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isLoaded) return null;

  // TODO: re-enable sign-in when Clerk production keys are configured and monetization is ready
  if (!isSignedIn) {
    return null;
  }

  const email = user.primaryEmailAddress?.emailAddress ?? "";
  const initials = (user.firstName?.[0] ?? user.username?.[0] ?? email[0] ?? "?").toUpperCase();

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.imageUrl}
            alt={email}
            style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover", border: "1px solid #D8D5CE" }}
          />
        ) : (
          <div style={{
            width: 22, height: 22, borderRadius: "50%",
            background: "#1C1C1A", color: "#F2F0EB",
            display: "flex", alignItems: "center", justifyContent: "center",
            ...mono, fontSize: 9, letterSpacing: 0,
          }}>
            {initials}
          </div>
        )}
        <span style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#A8A59E", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {email}
        </span>
      </button>

      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 10 }}
          />
          <div style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            background: "#F8F6F1",
            border: "1px solid #D8D5CE",
            borderRadius: 2,
            zIndex: 20,
            minWidth: 160,
            overflow: "hidden",
          }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid #D8D5CE" }}>
              <div style={{ ...mono, fontSize: 9, color: "#B0ADA6", letterSpacing: "0.08em", marginBottom: 2 }}>Signed in as</div>
              <div style={{ ...mono, fontSize: 10, color: "#1C1C1A", letterSpacing: "0.04em", wordBreak: "break-all" }}>{email}</div>
            </div>
            <SignOutButton>
              <button
                onClick={() => setMenuOpen(false)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 14px",
                  ...mono,
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "#B85050",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                Sign out
              </button>
            </SignOutButton>
          </div>
        </>
      )}
    </div>
  );
}
