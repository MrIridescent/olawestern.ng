import Link from 'next/link';

/**
 * PoliticalWisdom — the civic brief, on the page rather than only in the model.
 *
 * Everything here is checkable: the election date is INEC's published calendar,
 * the office and its four wards come from the state's own records, and the local
 * context is attributed to the outlet that reported it. The section explains the
 * office and the tests this desk applies; it does not rank anyone or tell a
 * visitor how to vote.
 */

const INEC_CALENDAR = 'https://www.inecnigeria.org/elections/calendar';
const INEC_REPS_LIST =
  'https://inecnigeria.org/documents/uploads/2026/10/b7e9758b-56ae-4068-89c0-8a4b38dd5d35-final-list-lagos-house-of-representatives.pdf';

const TESTS = [
  {
    q: 'Does the candidate know the place?',
    a: 'Ask them to name the ward, the estate, the road or the drainage channel — without a aide whispering the answer.',
  },
  {
    q: 'What did they do before asking for your vote?',
    a: 'Look for a dated, photographed, credited record. A flyer is a promise; a receipt, a report and a photograph are evidence.',
  },
  {
    q: 'Can you reach them between elections?',
    a: 'A representative who is only visible at election time is a stranger with a banner. Ask for an office, a phone line and a town hall date.',
  },
  {
    q: 'Do they understand what the office can do?',
    a: 'A state lawmaker makes laws, scrutinises the budget and oversees agencies. They do not control federal roads or FHA housing alone.',
  },
];

export default function PoliticalWisdom() {
  return (
    <section className="bg-brand-light py-14" id="political-wisdom">
      <div className="container-site">
        <p className="section-kicker">Political Wisdom · Amuwo-Odofin 2027</p>
        <h2 className="section-title text-2xl sm:text-3xl">
          Know the office before anyone tells you how to vote
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-brand-gray">
          The Truth Room is a civic desk, not a cheerleader. It explains the seat, the wards that
          elect it, the date it is decided, and the tests this desk uses when anyone — including the
          campaign — makes a claim. Check every line against the original source.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-brand-navy p-5 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-electric-bright">
              Election day
            </p>
            <p className="mt-3 font-display text-2xl font-black leading-tight">6 Feb 2027</p>
            <p className="mt-2 text-xs leading-relaxed text-white/65">
              Governorship and State Houses of Assembly. The National Assembly election is 16
              January 2027.
            </p>
            <a
              href={INEC_CALENDAR}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[11px] font-bold text-brand-electric-bright underline underline-offset-2"
            >
              INEC calendar ↗
            </a>
          </div>

          <div className="rounded-2xl bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-electric">
              One seat
            </p>
            <p className="mt-3 font-display text-2xl font-black text-brand-navy">Constituency I</p>
            <p className="mt-2 text-xs leading-relaxed text-brand-gray">
              Four wards — Amuwo-Odofin Housing Estate, Mile 2; Festac I; Festac II; Festac III —
              elect one member to the 40-seat Lagos State House of Assembly.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-electric">
              Three seats
            </p>
            <p className="mt-3 font-display text-2xl font-black text-brand-navy">1 LGA, 3 seats</p>
            <p className="mt-2 text-xs leading-relaxed text-brand-gray">
              One House of Representatives seat, two Lagos State House of Assembly seats — plus the
              council and councillors under LASIEC.
            </p>
            <a
              href={INEC_REPS_LIST}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-[11px] font-bold text-brand-electric underline underline-offset-2"
            >
              INEC Reps list ↗
            </a>
          </div>

          <div className="rounded-2xl bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-electric">
              Local race
            </p>
            <p className="mt-3 font-display text-2xl font-black text-brand-navy">Settled at home</p>
            <p className="mt-2 text-xs leading-relaxed text-brand-gray">
              In April 2026, Amuwo-Odofin APC stakeholders publicly backed Moses Olanrewaju for the
              House of Representatives and Ola Western for Constituency I. Both primaries were held
              locally.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-brand-navy/10 bg-white p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-electric">
              The local test
            </p>
            <h3 className="mt-2 font-display text-lg font-bold text-brand-navy">
              Four questions that survive any campaign season
            </h3>
            <dl className="mt-4 space-y-4">
              {TESTS.map((t) => (
                <div key={t.q}>
                  <dt className="text-sm font-bold text-brand-navy">{t.q}</dt>
                  <dd className="mt-1 text-xs leading-relaxed text-brand-gray">{t.a}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl bg-brand-navy p-6 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-electric-bright">
              Why it matters here
            </p>
            <h3 className="mt-2 font-display text-lg font-bold">
              This race is settled at home
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              The people asking for your vote in Amuwo-Odofin live with the result. They use the same
              roads, the same drains and the same markets. That makes local knowledge a fair test —
              and it makes a sourced record more useful than a slogan.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              This desk will not attack another candidate or tell you how to vote. It will show you
              what Ola Western has published, what the office can actually do, and where to verify
              every claim for yourself.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/impact"
                className="rounded-full bg-white px-3.5 py-2 text-[11px] font-bold text-brand-navy transition hover:bg-brand-electric-bright hover:text-white"
              >
                The dated record
              </Link>
              <Link
                href="/blueprint"
                className="rounded-full border border-white/25 px-3.5 py-2 text-[11px] font-bold text-white transition hover:border-white/60"
              >
                The legislative plan
              </Link>
              <a
                href="#truth-desk"
                className="rounded-full border border-white/25 px-3.5 py-2 text-[11px] font-bold text-white transition hover:border-white/60"
              >
                Ask the desk
              </a>
            </div>
          </div>
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-brand-gray">
          Sources: INEC’s published 2027 calendar and final candidate lists; Vanguard (28 April 2026)
          and The Nation (26 April 2026) on the Amuwo-Odofin APC consensus; NAN (18 May 2026) and
          Festac Online (22 May 2026) on the primaries. If INEC publishes a revised list, this page
          and the desk’s brief will be updated to match it.
        </p>
      </div>
    </section>
  );
}
