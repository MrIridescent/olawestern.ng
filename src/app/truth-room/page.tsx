import type { Metadata } from 'next';
import Link from 'next/link';
import AskOlaForm from '@/components/forms/AskOlaForm';
import FactCard from '@/components/truth/FactCard';
import PoliticalWisdom from '@/components/truth/PoliticalWisdom';
import PressArchive from '@/components/truth/PressArchive';
import TruthDesk from '@/components/truth/TruthDesk';
import TruthLedger from '@/components/truth/TruthLedger';
import ReferenceLibrary from '@/components/impact/ReferenceLibrary';
import { listFactChecks, listReferences } from '@/lib/store';
import { FEATURED_ARCHIVE } from '@/lib/pressArchive';

export const metadata: Metadata = {
  title: 'Truth Room — Fact Check & Reputation Defense',
  description:
    'The official fact-checking and civic desk of the Ola Western campaign: verified facts, debunked claims, every published mention, and sourced answers on Amuwo-Odofin Constituency I and the Lagos State House of Assembly.',
};

export const revalidate = 900;

export default async function TruthRoomPage() {
  const [facts, references] = await Promise.all([
    listFactChecks(),
    listReferences(),
  ]);
  const featured = facts.filter((f) => f.is_featured);

  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-16 text-center">
          <p className="section-kicker !bg-white/10 !text-white/70">Reputation Defense Desk</p>
          <h1 className="hero-title">The Truth Room</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            Every claim checked. Every mention linked to its source. Ask the live desk below, or work
            through the ledger of official rulings, the press record and the civic brief on
            Amuwo-Odofin Constituency I, the Lagos State House of Assembly and Amuwo politics.
          </p>
        </div>
      </section>

      <section className="container-site pt-10" id="truth-desk">
        <TruthDesk factCount={facts.length} />
      </section>

      <PoliticalWisdom />

      {featured.length > 0 && (
        <section className="container-site pt-14">
          <h2 className="section-title text-2xl">Featured rulings</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {featured.map((f) => <FactCard key={f.id} fact={f} />)}
          </div>
        </section>
      )}

      <section className="container-site py-14">
        <h2 className="section-title text-2xl">The fact-check ledger</h2>
        <p className="mt-2 text-sm text-brand-gray">
          Search every ruling by keyword or verdict. Entries are published by the media desk from
          the campaign CMS and the AI War Room sync — always after executive approval.
        </p>
        <TruthLedger facts={facts} />
      </section>

      {/* What the record looks like when it is photographed and published. */}
      <PressArchive
        photos={FEATURED_ARCHIVE}
        heading="Documented, dated and credited"
        intro="Press photographs of the events the campaign stands on — each one carries the outlet that took it, the date and the report it ran in, so a claim can be checked instead of argued about. The full archive is on the gallery page."
        id="photographic-record"
      />

      {/* Every independent mention, linked to the outlet that published it. */}
      <section className="bg-brand-light py-14" id="every-mention">
        <div className="container-site">
          <p className="section-kicker">Every Mention</p>
          <h2 className="section-title text-2xl">Check the source, not a screenshot</h2>
          <p className="mt-2 max-w-2xl text-sm text-brand-gray">
            If Ola Western has been named in the press, the report is listed here with its outlet and
            date, linked straight to the published page. Anyone can open the original, read it in
            full and judge for themselves.
          </p>
          <ReferenceLibrary links={references} />
          <p className="mt-10 rounded-2xl bg-white px-6 py-5 text-sm text-brand-gray">
            Campaign-issued statements are in the{' '}
            <Link href="/news" className="font-bold text-brand-green underline underline-offset-2">
              newsroom
            </Link>
            , and the dated service record behind the rulings is on the{' '}
            <Link href="/impact" className="font-bold text-brand-green underline underline-offset-2">
              Impact page
            </Link>
            . If a mention is missing, send it through Ask Ola and the media desk will check it.
          </p>
        </div>
      </section>

      <section className="bg-brand-light py-14">
        <div className="container-site grid gap-8 lg:grid-cols-2">
          <div>
            <p className="section-kicker">Ask Ola</p>
            <h2 className="section-title text-2xl">Submit a question or report a rumor</h2>
            <p className="mt-3 text-sm text-brand-gray">
              Heard something circulating on WhatsApp or Nairaland? Send it to the campaign media
              team — every submission is reviewed and, when significant, published here with sources.
            </p>
            <div className="card mt-6 space-y-3">
              <h3 className="font-display text-base font-bold text-brand-green">Official documents</h3>
              <p className="text-sm text-brand-gray">
                Press releases and executive statements issued from 32 Road HQ are attached to their
                rulings in the ledger above.
              </p>
              <ul className="space-y-2">
                {facts
                  .filter((f) => f.official_document_url)
                  .slice(0, 4)
                  .map((f) => (
                    <li key={f.id}>
                      <a href={f.official_document_url!} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-blue underline">
                        {f.claim_summary}
                      </a>
                    </li>
                  ))}
                {!facts.some((f) => f.official_document_url) && (
                  <li className="text-sm text-gray-600">Documents appear here as the media desk attaches them.</li>
                )}
              </ul>
            </div>
          </div>
          <AskOlaForm />
        </div>
      </section>
    </>
  );
}
