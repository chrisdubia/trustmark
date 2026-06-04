import { SignUp } from "@clerk/nextjs";

const mono = { fontFamily: "'DM Mono', monospace" } as const;
const epilogue = { fontFamily: "'Epilogue', sans-serif" } as const;

export default function SignUpPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#F2F0EB", display: "flex", flexDirection: "column", ...epilogue }}>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #D8D5CE" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 18, height: 18, borderRadius: "50%", border: "1px solid #1C1C1A", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="#1C1C1A" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ ...epilogue, fontWeight: 500, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "#1C1C1A" }}>TRUSTMARC</span>
        </a>
      </nav>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 40px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#A8A59E", marginBottom: 12 }}>Account</div>
            <h1 style={{ ...epilogue, fontWeight: 300, fontSize: 28, letterSpacing: "-0.02em", color: "#1C1C1A" }}>Create your account</h1>
          </div>
          <SignUp
            signInUrl="/sign-in"
            appearance={{
              variables: {
                colorPrimary: "#1C1C1A",
                colorBackground: "#F8F6F1",
                colorInputBackground: "#ffffff",
                colorInputText: "#1C1C1A",
                colorText: "#1C1C1A",
                colorTextSecondary: "#7A7870",
                borderRadius: "2px",
                fontFamily: "'Epilogue', sans-serif",
              },
              elements: {
                card: { boxShadow: "none", border: "1px solid #D8D5CE", borderRadius: "2px", background: "#F8F6F1" },
                headerTitle: { display: "none" },
                headerSubtitle: { display: "none" },
                socialButtonsBlockButton: { border: "1px solid #D8D5CE", background: "#fff", borderRadius: "2px" },
                formButtonPrimary: { background: "#1C1C1A", borderRadius: "2px", boxShadow: "none" },
                footerActionLink: { color: "#1C1C1A" },
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
