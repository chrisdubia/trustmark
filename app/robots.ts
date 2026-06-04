import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/verify/', '/api/', '/upgrade', '/sign-in', '/sign-up', '/history'],
    },
    sitemap: 'https://trustmarc.io/sitemap.xml',
  };
}
