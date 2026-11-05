
import type { Metadata } from 'next';
import { listPress } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Media Kit',
  description: 'Downloadable assets for the campaign of Hon. Ola Western.',
};

function fmtDate(iso: string | null): string {
  const d = new Date(iso ?? Date.now());
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function MediaKitPage() {
  const items = await listPress({ publishedOnly: true });

  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-16 text-center">
          <p className="section-kicker !bg-white/10 !text-brand-green-light">Official Assets</p>
          <h1 className="hero-title">Media Kit</h1>
          <p className="mx-auto mt-4 max-w-2xl text-brand-green-light">
            Download official campaign assets, including photos, logos, and press materials.
          </p>
        </div>
      </section>

      <section className="container-site py-14">
        <h2 className="section-title">Logos</h2>
        <p className="mt-2 text-sm text-brand-gray">
          Download official campaign logos. Please do not alter the logos in any way.
        </p>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <img src="/images/logos/slogan.png" alt="Ola Western Slogan" className="h-40 w-full object-contain" />
            <a href="/images/logos/slogan.png" download className="btn-primary mt-4 w-full text-center">Download</a>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <img src="/images/logos/pillars.png" alt="Ola Western Pillars" className="h-40 w-full object-contain" />
            <a href="/images/logos/pillars.png" download className="btn-primary mt-4 w-full text-center">Download</a>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <img src="/images/logos/mandate.png" alt="Ola Western Mandate" className="h-40 w-full object-contain" />
            <a href="/images/logos/mandate.png" download className="btn-primary mt-4 w-full text-center">Download</a>
          </div>
        </div>
      </section>

      <section className="bg-brand-light py-14">
        <div className="container-site">
          <h2 className="section-title">Shareable Media</h2>
          <p className="mt-2 text-sm text-brand-gray">
            Download and share these images on social media.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <img src="/images/media_kit/community-first.jpg" alt="Community First" className="h-40 w-full object-cover" />
              <h3 className="mt-4 font-bold">Community First.</h3>
              <a href="/images/media_kit/community-first.jpg" download className="btn-primary mt-2 w-full text-center">Download</a>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <img src="/images/media_kit/a-leader-you-can-trust.jpg" alt="A Leader You Can Trust" className="h-40 w-full object-cover" />
              <h3 className="mt-4 font-bold">A Leader You Can Trust.</h3>
              <a href="/images/media_kit/a-leader-you-can-trust.jpg" download className="btn-primary mt-2 w-full text-center">Download</a>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-md">
              <img src="/images/media_kit/proven-results.jpg" alt="Proven Results" className="h-40 w-full object-cover" />
              <h3 className="mt-4 font-bold">Proven Results.</h3>
              <a href="/images/media_kit/proven-results.jpg" download className="btn-primary mt-2 w-full text-center">Download</a>
            </div>
          </div>
        </div>
      </section>

      <section className="container-site py-14">
        <h2 className="section-title">Press Releases</h2>
        <p className="mt-2 text-sm text-brand-gray">
          Download official press releases from the campaign.
        </p>
        <div className="mt-8 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="rounded-lg bg-white p-6 shadow-md flex justify-between items-center">
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="text-sm text-gray-600">{fmtDate(item.published_at)}</p>
              </div>
              <a href={item.pdf_url ?? undefined} download className="btn-primary">Download PDF</a>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}