import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrustMark — Verify Media Authenticity",
  description:
    "Instantly verify whether any image, video, or document is real, edited, or AI-generated. Check provenance signatures, EXIF metadata, and AI detection in seconds.",
  keywords: ["deepfake detection", "image verification", "C2PA", "media authenticity", "AI detection"],
  openGraph: {
    title: "TrustMark — Verify Media Authenticity",
    description: "Know in seconds if an image is real, edited, or AI-generated.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrustMark",
    description: "Verify any image's authenticity in seconds.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen relative z-10">{children}</body>
    </html>
  );
}
