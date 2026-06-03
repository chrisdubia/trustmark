import type { Metadata } from "next";

interface Props {
  params: { id: string };
}

export function generateMetadata({ params }: Props): Metadata {
  return {
    title: `Verification ${params.id.slice(0, 8)} — TrustMark`,
    description: "View this media verification result on TrustMark.",
  };
}

// Permalink pages are stateless — verification results are not stored server-side.
// This page explains that and lets the user verify a new file.
export default function VerifyPage({ params }: Props) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-white">TrustMark Verification</h1>
          <p className="text-white/40 text-sm mt-2">
            Verification ID: <code className="text-white/60">{params.id}</code>
          </p>
        </div>

        <div className="glass rounded-2xl p-5 text-left space-y-3">
          <p className="text-sm text-white/60">
            TrustMark is <strong className="text-white">stateless by design</strong> —
            files and results are never stored on our servers. Shared links
            represent a verification event, not stored data.
          </p>
          <p className="text-sm text-white/40">
            To verify the same file, the original sender needs to re-upload it.
            This protects privacy while enabling shared verdicts.
          </p>
        </div>

        <a
          href="/"
          className="inline-block w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors"
        >
          Verify a file now →
        </a>
      </div>
    </main>
  );
}
