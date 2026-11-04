import Link from 'next/link';
import { SITE } from '@/lib/content';

export default function NotFound() {
  return (
    <section className="hero-gradient">
      <div className="container-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="font-display text-7xl font-bold text-white">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-brand-green-light">
          This street hasn&rsquo;t been mapped yet.
        </h1>
        <p className="mt-3 max-w-md text-sm text-gray-200">
          The page you were looking for isn&rsquo;t in {SITE.constituency}. Head back to the
          campaign homepage or ask the AI Campaign Assistant directly.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn-primary">Back to Home</Link>
          <Link href="/news" className="btn-secondary !border-white !text-white hover:!bg-white hover:!text-brand-dark">
            Visit the Newsroom
          </Link>
          <a href={SITE.whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-blue">
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
