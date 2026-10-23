import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const paths = ['', '/calculate', '/compare', '/quotes', '/dealers', '/learn'];
  return paths.map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path === '' ? 'hourly' : 'weekly', priority: path === '' ? 1 : 0.7 }));
}
