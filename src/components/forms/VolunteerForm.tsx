'use client';

import { useState } from 'react';
import { WARDS } from '@/types';
import { IS_STATIC_DEMO } from '@/lib/siteMode';

const CONCERNS = [
  'Road Infrastructure',
  'Drainage & Flooding',
  'Market & SME Support',
  'Community Security',
  'Youth & Sports',
  'Street Lighting',
];

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'demo';

export default function VolunteerForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      fullName: String(form.get('fullName') ?? '').trim(),
      phoneNumber: String(form.get('phoneNumber') ?? '').trim(),
      email: String(form.get('email') ?? '').trim() || undefined,
      wardLocation: String(form.get('wardLocation') ?? ''),
      addressStreet: String(form.get('addressStreet') ?? '').trim() || undefined,
      pollingUnitCode: String(form.get('pollingUnitCode') ?? '').trim() || undefined,
      primaryConcern: String(form.get('primaryConcern') ?? ''),
      consent: form.get('consent') === 'on',
    };

    if (!payload.consent) {
      setStatus('error');
      setMessage('Please accept the data-protection consent to continue.');
      return;
    }

    if (IS_STATIC_DEMO) {
      // Frozen preview build: no server exists, so nothing is recorded.
      setStatus('demo');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Submission failed');
      setStatus('success');
      setMessage('Welcome to the movement! Our team (and the AI Campaign Assistant on WhatsApp) will reach out shortly.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  if (status === 'demo') {
    return (
      <div className="card border-amber-300 bg-amber-50 text-center">
        <p className="font-display text-lg font-bold text-amber-800">Preview build — nothing was recorded</p>
        <p className="mt-2 text-sm text-amber-900">
          This is the frozen pitch preview of the volunteer flow: validation works, but lead capture
          (Supabase CRM + WhatsApp welcome + War Room sync) runs only on the production site.
          To register for real right now, use the campaign WhatsApp line.
        </p>
        <a
          href="https://wa.me/2349041258180?text=SupportOlaWestern"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-4"
        >
          Join via WhatsApp instead
        </a>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="card border-brand-green bg-brand-green-light text-center">
        <p className="font-display text-xl font-bold text-brand-green">You&rsquo;re in! 🇳🇬</p>
        <p className="mt-2 text-sm text-brand-dark">{message}</p>
        <a
          href="https://wa.me/2349041258180?text=SupportOlaWestern"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-4"
        >
          Continue on WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4" aria-label="Volunteer registration form">
      {IS_STATIC_DEMO && (
        <p className="rounded-lg bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-800">
          DEMO PREVIEW — this form validates exactly like production, but submissions are not stored on this preview host.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="fullName">Full Name *</label>
          <input id="fullName" name="fullName" required autoComplete="name" className="field-input" placeholder="e.g. Emeka Okonkwo" />
        </div>
        <div>
          <label className="field-label" htmlFor="phoneNumber">Phone Number * (WhatsApp)</label>
          <input id="phoneNumber" name="phoneNumber" required type="tel" inputMode="tel" autoComplete="tel" className="field-input" placeholder="+234 80..." />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="email">Email (optional)</label>
          <input id="email" name="email" type="email" autoComplete="email" className="field-input" placeholder="you@example.com" />
        </div>
        <div>
          <label className="field-label" htmlFor="wardLocation">Ward *</label>
          <select id="wardLocation" name="wardLocation" required className="field-input" defaultValue="">
            <option value="" disabled>Select your ward…</option>
            {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="addressStreet">Street / Estate</label>
          <input id="addressStreet" name="addressStreet" className="field-input" placeholder="e.g. 23 Road, FESTAC Town" />
        </div>
        <div>
          <label className="field-label" htmlFor="pollingUnitCode">Polling Unit Code (if known)</label>
          <input id="pollingUnitCode" name="pollingUnitCode" className="field-input" placeholder="e.g. PU 014 — 23 Road Junction" />
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="primaryConcern">Your Primary Concern for Constituency I *</label>
        <select id="primaryConcern" name="primaryConcern" required className="field-input" defaultValue="">
          <option value="" disabled>Select an issue…</option>
          {CONCERNS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <label className="flex items-start gap-3 text-xs text-brand-gray">
        <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5 shrink-0 accent-brand-green" />
        <span>
          I consent to the Ola Western Campaign Organization storing my contact details for volunteer
          coordination, in line with the Nigeria Data Protection Act (NDPA) 2023. My data may be routed to
          the campaign CRM and WhatsApp assistant.
        </span>
      </label>

      {status === 'error' && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-brand-red">{message}</p>
      )}

      <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full disabled:opacity-60">
        {status === 'submitting' ? 'Registering…' : 'Join the Movement'}
      </button>
    </form>
  );
}
