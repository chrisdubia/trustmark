import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'System Status',
  description: 'Real-time operational status for Trustmarc verification services.',
};
export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
