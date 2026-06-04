import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Trustmarc — Media Authenticity Verification',
    short_name: 'Trustmarc',
    description: 'Verify whether any image, video, or document is authentic, edited, or AI-generated.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F2F0EB',
    theme_color: '#1C1C1A',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
