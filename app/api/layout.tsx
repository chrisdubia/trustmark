import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'API for Developers',
  description: 'Integrate media authenticity verification into your platform. The Trustmarc API combines AI detection, provenance, and forensic analysis into a single verdict.',
};
export default function ApiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
