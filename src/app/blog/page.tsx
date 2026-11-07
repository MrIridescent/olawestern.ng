import type { Metadata } from 'next';
import Link from 'next/link';
import { listBlogPosts } from '@/lib/contentful';

export const metadata: Metadata = {
  title: 'Campaign Journal',
  description:
    'First-person notes and community stories from Hon. Ola Western’s campaign for Amuwo-Odofin.',
  alternates: { canonical: '/blog' },
};

function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPage() {
  const posts = await listBlogPosts();

  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-16 text-center">
          <p className="section-kicker !bg-white/10 !text-white/70">Campaign Trail</p>
          <h1 className="hero-title">Campaign Journal</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            First-person notes and community stories from the road to Amuwo-Odofin.
          </p>
        </div>
      </section>

      <section className="container-site py-14">
        {posts.length === 0 ? (
          <p className="rounded-xl bg-brand-light px-5 py-10 text-center text-sm text-brand-gray">
            No journal entries yet.
          </p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-all hover:border-brand-electric/40 hover:shadow-lg sm:p-8"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-brand-electric-dark">
                  {formatDay(post.date)} · {post.author}
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold leading-snug text-brand-navy">
                  <Link href={`/blog/${post.id}`} className="transition-colors hover:text-brand-electric-dark">
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-brand-gray">{post.summary}</p>
                <Link
                  href={`/blog/${post.id}`}
                  className="mt-5 inline-flex min-h-[44px] items-center text-sm font-bold text-brand-green underline underline-offset-4 hover:text-brand-green-dark"
                >
                  Read the full entry →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
