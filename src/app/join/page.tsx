import type { Metadata } from 'next';
import VolunteerForm from '@/components/forms/VolunteerForm';
import { SITE } from '@/lib/content';
import SlotImage from '@/components/ui/SlotImage';
import { slots } from '@/lib/slots';

export const metadata: Metadata = {
  title: 'Join the Movement — Volunteer & Canvass',
  description:
    'Register as an Ola Western volunteer across Festac I, II, III and Mile 2. Your sign-up routes directly to your ward team via the campaign CRM.',
};

export default async function JoinPage() {
  const media = await slots();
  return (
    <>
      <section className="hero-gradient">
        <div className="container-site py-16 text-center">
          <p className="section-kicker !bg-white/10 !text-white/70">Constituent Portal</p>
          <h1 className="hero-title">Join the Movement</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            One form. One ward captain. One street at a time — from 1st Avenue to Mile 2.
          </p>
        </div>
      </section>

      <section className="container-site grid gap-10 py-16 lg:grid-cols-2">
        <div>
          <p className="section-kicker">How it works</p>
          <h2 className="section-title text-2xl sm:text-3xl">From sign-up to street-level impact in three steps</h2>
          <ol className="mt-8 space-y-6">
            {[
              {
                title: 'Register in 60 seconds',
                body: 'Your name, ward, street and primary concern go straight into the campaign CRM — mapped to your polling unit.',
              },
              {
                title: 'Meet your ward team',
                body: 'APC ward coordinators for Festac I, II, III and Mile 2 receive verified volunteer lists and route you to your street captain.',
              },
              {
                title: 'Continue on WhatsApp',
                body: 'The campaign desk (+234 803 400 5708) answers policy questions, logs ward issues and keeps you updated on events and GOTV drives.',
              },
            ].map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green font-display font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg font-bold">{s.title}</h3>
                  <p className="mt-1 text-sm text-brand-gray">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8">
            <SlotImage slots={media} slot="primary-victory" reuse />
          </div>

          <div className="card mt-8 border-brand-green/20 bg-brand-light">
            <h3 className="font-display text-base font-bold text-brand-green-dark">Already a supporter? Skip the form.</h3>
            <p className="mt-1 text-sm text-brand-gray">
              Message <strong>SupportOlaWestern</strong> on WhatsApp and the desk takes it from there.
            </p>
            <a href={SITE.whatsappLink} target="_blank" rel="noopener noreferrer" className="btn-blue mt-4">
              Open WhatsApp desk
            </a>
          </div>
        </div>

        <div>
          <VolunteerForm />
          <p className="mt-4 text-xs text-gray-600">
            By submitting, you agree that the Ola Western Campaign Organization may contact you
            about volunteering. Data is stored per the Nigeria Data Protection Act (NDPA) 2023 and
            shared only with authorized ward-level campaign coordinators. Email{' '}
            <a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a> to request removal.
          </p>
        </div>
      </section>
    </>
  );
}
