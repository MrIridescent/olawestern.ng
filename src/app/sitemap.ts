import type { MetadataRoute } from 'next';
import { listPress } from '@/lib/store';
import { listBlogPosts } from '@/lib/contentful';
import { SITE } from '@/lib/content';

export const dynamic = 'force-static';

const STATIC_ROUTES = [
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE.siteUrl}${r}`,
    lastModified: new Date(),
    changeFrequency: r === '/help-desk' || r === '/news' ? 'daily' : 'weekly',
    priority: r === '' ? 1 : 0.8,
  }));

  // Releases and blog posts are real pages; leaving them out of the sitemap made
  // every share link invisible to search. A CMS outage must never break the file,
  // so both fetches are best-effort.
  let releases: MetadataRoute.Sitemap = [];
  try {
    releases = (await listPress({ publishedOnly: true })).map((release) => ({
      url: `${SITE.siteUrl}/news/${release.slug}`,
      lastModified: release.published_at ? new Date(release.published_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error('[sitemap] press releases unavailable:', err);
  }

  let posts: MetadataRoute.Sitemap = [];
  try {
    posts = (await listBlogPosts()).map((post) => ({
      url: `${SITE.siteUrl}/blog/${post.id}`,
      lastModified: post.date ? new Date(post.date) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }));
  } catch (err) {
    console.error('[sitemap] blog posts unavailable:', err);
  }

  return [...base, ...releases, ...posts];
}
