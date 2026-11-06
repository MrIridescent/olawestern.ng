import type { Metadata } from 'next';
import { SITE } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Privacy Policy (NDPA 2023)',
  description:
    'How the Ola Western Campaign Organization collects, uses, protects and retains your personal data under the Nigeria Data Protection Act (NDPA) 2023.',
};

export default function PrivacyPage() {
  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-14 text-center">
          <p className="section-kicker !bg-white/10 !text-white/70">Data Protection</p>
          <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Privacy Policy</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/70">
            Under the Nigeria Data Protection Act (NDPA) 2023 · Last updated: November 2026
          </p>
        </div>
      </section>

      <section className="container-site max-w-3xl py-12">
        <div className="space-y-8 text-sm leading-relaxed text-brand-gray">
          <div>
            <h2 className="mb-2 font-display text-xl font-bold text-brand-dark">1. Who we are</h2>
            <p>
              This website is operated by the {SITE.brandName} Campaign Organization
              (&ldquo;the Campaign&rdquo;), the campaign body of {SITE.candidateName}, candidate of the{' '}
              {SITE.party} for the {SITE.office}, {SITE.constituency}. Data enquiries: {SITE.email}.
            </p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xl font-bold text-brand-dark">2. What we collect</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Volunteer registration:</strong> name, phone number, optional email, ward, street, polling unit code, your top community concern, and your consent record.</li>
              <li><strong>Ask Ola / rumor reports:</strong> name, phone, ward, message type and the text you submit.</li>
              <li><strong>WhatsApp assistant chats:</strong> your phone number and the messages you choose to send us.</li>
              <li><strong>Basic analytics:</strong> aggregate, non-identifying usage statistics for campaign reporting.</li>
            </ul>
            <p className="mt-2">We do not collect your PVC number, NIN, BVN, religion, or any sensitive personal data as defined by the NDPA.</p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xl font-bold text-brand-dark">3. Why we collect it (lawful basis)</h2>
            <p>
              With your explicit consent at each form, we use this data only to: coordinate volunteering and
              ward canvassing; respond to your questions; understand constituent concerns; and measure campaign
              outreach. We do not sell voter data, and we do not share it with any third party except the
              campaign&rsquo;s contracted service processors bound by written confidentiality and data-processing terms.
            </p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xl font-bold text-brand-dark">4. Storage &amp; security</h2>
            <p>
              Records are stored in an access-controlled database with encryption at rest and row-level security
              policies; only authorised campaign personnel with unique credentials can access them. All access is
              logged. Communications are transmitted over HTTPS.
            </p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xl font-bold text-brand-dark">5. Retention</h2>
            <p>
              Volunteer and enquiry records are retained for the duration of the 2026/2027 electoral cycle and
              no longer than 24 months after the last general election in which the Campaign participates,
              unless you ask us to remove you sooner.
            </p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xl font-bold text-brand-dark">6. Your rights</h2>
            <p>
              Under the NDPA 2023 you may request a copy of your data, correction of inaccuracies, deletion,
              or withdrawal of consent at any time, and you may object to direct marketing. To exercise any of
              these rights, WhatsApp or email us using the details on this page; we respond within 30 days.
            </p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xl font-bold text-brand-dark">7. Children</h2>
            <p>
              This site is not directed at children. Registration forms are for supporters aged 18 and above;
              if we learn a child&rsquo;s data was submitted, we delete it promptly.
            </p>
          </div>

          <div>
            <h2 className="mb-2 font-display text-xl font-bold text-brand-dark">8. Changes &amp; contact</h2>
            <p>
              Material changes to this policy will be announced on this page and in the Newsroom.
              Data Protection enquiries: {SITE.email} · WhatsApp {`+${SITE.whatsappNumber}`} · {SITE.hq}.
            </p>
          </div>

          <p className="rounded-xl bg-brand-light px-5 py-4 text-xs italic text-gray-500">
            Note for the campaign team: this template is drafted to NDPA 2023 principles but has not been
            reviewed by a licensed Nigerian data-protection counsel. Legal review before go-live is part of
            the launch checklist.
          </p>
        </div>
      </section>
    </>
  );
}
