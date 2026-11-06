import type { Metadata } from 'next';
import Link from 'next/link';
import { listBlogPosts } from '@/lib/contentful';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'The latest news, updates, and stories from the campaign trail.',
};

export default async function BlogPage() {
  const posts = await listBlogPosts();

  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-16 text-center">
          <p className="section-kicker !bg-white/10 !text-white/70">Campaign Trail</p>
          <h1 className="hero-title">Blog</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            The latest news, updates, and stories from the campaign trail.
          </p>
        </div>
      </section>

      <section className="container-site py-14">
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.id}>
              <h2 className="font-display text-2xl font-bold">
                <Link href={`/blog/${post.id}`}>{post.title}</Link>
              </h2>
              <p className="text-sm text-gray-600">{post.date} by {post.author}</p>
              <p className="mt-2">{post.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}