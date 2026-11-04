import type { Metadata } from 'next';
import Link from 'next/link';
import IssueBoard from '@/components/helpdesk/IssueBoard';
import IssueReportForm from '@/components/helpdesk/IssueReportForm';
import MeetingRequestForm from '@/components/helpdesk/MeetingRequestForm';
import { listPublicIssues } from '@/lib/store';
import { SITE } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Constituent Help Desk — Report an Issue, Book Open-Door Hours',
  description:
    'The Ola Western Constituent Help Desk: report drainage, roads, water, security, sanitation or market problems in Festac I–III and Mile 2, follow the public progress dashboard, and book a slot at the open-door office hours.',
};

export const revalidate = 300;

export default async function HelpDeskPage() {
  const issues = await listPublicIssues();
  const open = issues.filter((i) => i.status !== 'resolved').length;
  const closed = issues.filter((i) => i.status === 'resolved').length;

  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-14 text-center sm:py-16">
          <p className="section-kicker !bg-white/10 !text-brand-green-light">The Department of Community Engagement</p>
          <h1 className="hero-title">The Constituent Help Desk</h1>
          <p className="mx-auto mt-4 max-w-2xl text-brand-green-light">
            A blocked drain should not have to wait for an election. Report what is broken on your
            street, watch the status move in public, and book time at the open door — the same desk
            run from 32 Road for years, pledged to become a permanent office of a Constituency I lawmaker.
          </p>
          <dl className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-2 sm:gap-4">
            {[
              { k: 'Open', v: open },
              { k: 'Resolved', v: closed },
              { k: 'Published', v: issues.length },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl bg-white/10 px-2 py-4 ring-1 ring-white/15">
                <dd className="font-display text-2xl font-bold text-white sm:text-3xl">{s.v}</dd>
                <dt className="mt-1 text-[11px] font-bold uppercase tracking-wider text-brand-green-light">{s.k}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── PUBLIC PROGRESS DASHBOARD ─────────────────────────── */}
      <section id="dashboard" className="container-site py-14">
        <p className="section-kicker">Public Progress Dashboard</p>
        <h2 className="section-title">Every report the desk has published — and where it stands</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-gray">
          Residents&rsquo; reports appear here only after the ward team verifies them, and a reporter&rsquo;s name
          and number are never published. Progress notes are written in plain language by the desk, not by a bot.
        </p>
        <div className="mt-8">
          <IssueBoard issues={issues} />
        </div>
      </section>

      {/* ── REPORT + BOOK (stacked on phones) ─────────────────── */}
      <section className="bg-brand-light py-14">
        <div className="container-site grid gap-10 lg:grid-cols-2">
          <div id="report">
            <p className="section-kicker">Report an Issue</p>
            <h2 className="section-title text-2xl sm:text-3xl">Tell the desk what is broken</h2>
            <p className="mt-2 text-sm text-brand-gray">
              Drainage, roads and street lighting, boreholes, security, waste and markets — say where it
              is and what it does to your street. Your ward team picks it up from there.
            </p>
            <div className="mt-6">
              <IssueReportForm />
            </div>
          </div>

          <div id="open-door">
            <p className="section-kicker">Open-Door Hours</p>
            <h2 className="section-title text-2xl sm:text-3xl">Book a sitting at 32 Road</h2>
            <p className="mt-2 text-sm text-brand-gray">
              Constituents, youth representatives, estate associations and business owners can request a
              physical meeting at the FESTAC Town office or a virtual open-door call. The ward desk
              confirms your slot on WhatsApp — no request goes into a void.
            </p>
            <div className="mt-6">
              <MeetingRequestForm />
            </div>
          </div>
        </div>
      </section>



      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-brand-green">
        <div className="container-site flex flex-col items-center gap-5 py-12 text-center">
          <h2 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
            This is what accessible representation looks like — before office.
          </h2>
          <p className="max-w-2xl text-sm text-brand-green-light">
            The desk at {SITE.hq} is the same office that cleared drains, sank boreholes and rebuilt
            roads. Keep it permanently in the House of Assembly — add your name to the movement.
          </p>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Link href="/join" className="btn-secondary w-full !border-white !text-white hover:!bg-white hover:!text-brand-green sm:w-auto">
              Join the Movement
            </Link>
            <Link href="/impact" className="btn w-full bg-white text-brand-green hover:bg-brand-green-light sm:w-auto">
              See the record he already delivered
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}