import { createClient, type ContentfulClientApi } from 'contentful';
import { getBlogPost as getLocalBlogPost, listBlogPosts as listLocalBlogPosts } from './blog';

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  author: string;
  summary: string;
  content: string;
}

/**
 * Contentful is the editorial source of truth once credentials are present.
 * Until then — and if the API is unreachable — the site serves the authored
 * posts in `src/lib/blog.ts`, so the newsroom never 500s for a missing key.
 */
const space = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

const client: ContentfulClientApi<any> | null =
  space && accessToken ? createClient({ space, accessToken }) : null;

export function contentfulConfigured(): boolean {
  return client !== null;
}

function parseBlogPost(entry: any): BlogPost {
  return {
    id: entry.fields.slug,
    title: entry.fields.title,
    date: entry.fields.date,
    author: entry.fields.author,
    summary: entry.fields.summary,
    content: entry.fields.content,
  };
}

export async function listBlogPosts(): Promise<BlogPost[]> {
  if (!client) return listLocalBlogPosts();

  try {
    const entries = await client.getEntries({
      content_type: 'blogPost',
      order: ['-fields.date'],
    });
    if (!entries.items.length) return listLocalBlogPosts();
    return entries.items.map(parseBlogPost);
  } catch (err) {
    console.error('[contentful] listBlogPosts failed, serving local posts:', err);
    return listLocalBlogPosts();
  }
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  if (!client) return getLocalBlogPost(id) ?? null;

  try {
    const entries = await client.getEntries({
      content_type: 'blogPost',
      'fields.slug': id,
      limit: 1,
    });
    if (entries.items.length > 0) {
      return parseBlogPost(entries.items[0]);
    }
    return getLocalBlogPost(id) ?? null;
  } catch (err) {
    console.error('[contentful] getBlogPost failed, serving local post:', err);
    return getLocalBlogPost(id) ?? null;
  }
}
