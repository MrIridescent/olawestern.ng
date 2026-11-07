import { getBlogPost, listBlogPosts } from '@/lib/contentful';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import SocialShare from '@/components/ui/SocialShare';

export async function generateStaticParams() {
  const posts = await listBlogPosts();
  return posts.map((post) => ({ id: post.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await getBlogPost(id);
  if (!post) {
    return {};
  }
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.id}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

function formatDay(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getBlogPost(id);

  if (!post) {
    notFound();
  }

  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-16 text-center">
          <p className="section-kicker !bg-white/10 !text-white/70">Campaign Journal</p>
          <h1 className="hero-title">{post.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-white/70">
            {formatDay(post.date)} · {post.author}
          </p>
        </div>
      </section>

      <section className="container-site py-12 sm:py-16">
        <article>
          <div className="article-body" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        <div className="mx-auto mt-12 max-w-3xl border-t border-[#E2E8F0] pt-8">
          <SocialShare title={post.title} />
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/blog" className="btn-secondary !min-h-[44px] !px-5 !py-2 text-sm">
              ← All journal entries
            </Link>
            <Link href="/news" className="text-sm font-bold text-brand-green underline underline-offset-4">
              Campaign press releases →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
