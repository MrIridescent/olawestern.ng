'use client';

import { useState } from 'react';
import { WARDS } from '@/types';

const CONCERNS = [
  'Road Infrastructure',
  'Drainage & Flooding',
  'Market & SME Support',
  'Community Security',
  'Youth & Sports',
  'Street Lighting',
];

/**
 * @typedef {'idle' | 'submitting' | 'success' | 'error'} Status
 * Represents the current status of the form submission.
 */
type Status = 'idle' | 'submitting' | 'success' | 'error';

/**
 * A form for users to sign up as volunteers for the campaign.
 * It collects contact information, location details, and primary concerns.
 * Submissions are sent to the /api/volunteer endpoint.
 * This component manages its own submission state and provides user feedback.
 * @returns {JSX.Element} The rendered volunteer sign-up form.
 */
export default function VolunteerForm() {
  // State for the form submission status.
  const [status, setStatus] = useState<Status>('idle');
  // State for the feedback message shown to the user.
  const [message, setMessage] = useState('');

  /**
   * Handles the form submission event.
   * It validates the form data, checks for consent, and sends the data to the /api/volunteer endpoint.
   * Updates the status and message states based on the API response.
   * @param {React.FormEvent<HTMLFormElement>} e The form submission event.
   */
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
      setMessage('To proceed, you must agree to the data protection consent.');
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
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'An unexpected error occurred during submission.');
      }
      setStatus('success');
      setMessage('Welcome to the movement! Our team will reach out to you shortly via WhatsApp.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'An unknown error occurred. Please try again later.');
    }
  }

  if (status === 'success') {
    return (
      <div className="card border-brand-green bg-brand-green-light text-center">
        <p className="font-display text-xl font-bold text-brand-green">You&rsquo;re In! 🇳🇬</p>
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
          I consent to the Ola Western Campaign Organization storing and processing my contact details for
          volunteer coordination, in accordance with the Nigeria Data Protection Act (NDPA) 2023. My data may be
          used by the campaign CRM and automated WhatsApp assistant for communication purposes.
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