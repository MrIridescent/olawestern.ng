import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/content';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/about',
    '/impact',
    '/blueprint',
    '/help-desk',
    '/truth-room',
    '/news',
    '/gallery',
    '/contact',
    '/join',
    '/privacy',
  ];
  return routes.map((r) => ({
    url: `${SITE.siteUrl}${r}`,
    lastModified: new Date(),
    changeFrequency: r === '/help-desk' ? 'daily' : 'weekly',
    priority: r === '' ? 1 : 0.8,
  }));
}
