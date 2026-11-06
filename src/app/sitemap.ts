import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/content';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/hq',
    '/about',
    '/impact',
    '/blueprint',
    '/help-desk',
    '/truth-room',
    '/news',
    '/gallery',
    '/contact',
    '/join',
    '/blog',
    '/media-kit',
    '/privacy',
    '/terms',
  ];
  return routes.map((r) => ({
    url: `${SITE.siteUrl}${r}`,
    lastModified: new Date(),
    changeFrequency: r === '/help-desk' ? 'daily' : 'weekly',
    priority: r === '' ? 1 : 0.8,
  }));
}