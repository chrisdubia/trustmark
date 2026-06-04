import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://trustmarc.io';
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/api`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/status`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ];
}
