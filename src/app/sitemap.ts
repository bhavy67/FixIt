import type { MetadataRoute } from 'next';
import { TOOLS_META } from '@/tools/meta';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://fixit.local';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/tools`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = TOOLS_META.map((t) => ({
    url: `${BASE_URL}/tools/${t.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...toolRoutes];
}
