import { getBlogPost, listBlogPosts } from '@/lib/contentful';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const posts = await listBlogPosts();
  return posts.map((post) => ({ id: post.id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await getBlogPost(params.id);
  if (!post) {
    return {};
  }
  return { title: post.title, description: post.summary };
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const post = await getBlogPost(params.id);

  if (!post) {
    notFound();
  }

  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-16 text-center">
          <h1 className="hero-title">{post.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-brand-green-light">
            {post.date} by {post.author}
          </p>
        </div>
      </section>

      <section className="container-site py-14">
        <div className="prose mx-auto" dangerouslySetInnerHTML={{ __html: post.content }} />
      </section>
    </>
  );
}