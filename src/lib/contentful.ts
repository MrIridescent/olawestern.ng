import { createClient, type ContentfulClientApi } from 'contentful';

const space = process.env.CONTENTFUL_SPACE_ID;
const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN;

if (!space || !accessToken) {
  throw new Error('Contentful space ID and access token must be provided.');
}

const client: ContentfulClientApi<any> = createClient({
  space,
  accessToken,
});

export interface BlogPost {
  id: string;
  title: string;
  date: string;
  author: string;
  summary: string;
  content: string;
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
  const entries = await client.getEntries({
    content_type: 'blogPost',
    order: ['-fields.date'],
  });
  return entries.items.map(parseBlogPost);
}

export async function getBlogPost(id: string): Promise<BlogPost | null> {
  const entries = await client.getEntries({
    content_type: 'blogPost',
    'fields.slug': id,
    limit: 1,
  });
  if (entries.items.length > 0) {
    return parseBlogPost(entries.items[0]);
  }
  return null;
}