import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://trustmarc.io'),
  title: {
    default: 'Trustmarc — Check if any image is real or AI-generated',
    template: '%s | Trustmarc',
  },
  description: 'Instantly verify whether any image, video, or document is authentic, edited, or AI-generated. Free media authenticity checker with C2PA provenance, AI detection, and forensic analysis. No account required, privacy-first.',
  keywords: ['AI image detector', 'is this image AI generated', 'verify image authenticity', 'deepfake detector', 'C2PA verification', 'check if photo is real', 'AI content detection', 'fake image checker', 'image provenance', 'photo authenticity checker', 'synthetic media detection', 'image forensics tool', 'verify photo not edited', 'detect AI generated images'],
  authors: [{ name: 'Trustmarc' }],
  creator: 'Trustmarc',
  publisher: 'Trustmarc',
  applicationName: 'Trustmarc',
  referrer: 'origin-when-cross-origin',
  formatDetection: { telephone: false, email: false, address: false },
  verification: {
    google: 'PLACEHOLDER_REPLACE_WITH_GOOGLE_VERIFICATION_CODE',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://trustmarc.io',
    siteName: 'Trustmarc',
    title: 'Trustmarc — Check if any image is real or AI-generated',
    description: 'Instantly verify whether any image, video, or document is authentic, edited, or AI-generated. Free, private, no account required.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Trustmarc — Media Authenticity Verification' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@trustmarc',
    creator: '@trustmarc',
    title: 'Trustmarc — Check if any image is real or AI-generated',
    description: 'Instantly verify whether any image, video, or document is authentic, edited, or AI-generated. Free and private.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: 'https://trustmarc.io' },
  category: 'technology',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Epilogue:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet" />
        </head>
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
