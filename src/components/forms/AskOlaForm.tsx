'use client';

import { useState } from 'react';
import { WARDS } from '@/types';
import { IS_STATIC_DEMO } from '@/lib/siteMode';

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'demo';

const TYPES = ['Policy Inquiry', 'Rumor Verification', 'General Support'] as const;

/**
 * "Ask Ola" — Truth Room submission channel. Questions and rumor reports go
 * to constituent_inquiries for review by the campaign media team.
 */
export default function AskOlaForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      fullName: String(form.get('fullName') ?? '').trim(),
      phoneNumber: String(form.get('phoneNumber') ?? '').trim(),
      ward: String(form.get('ward') ?? ''),
      messageType: String(form.get('messageType') ?? ''),
      messageBody: String(form.get('messageBody') ?? '').trim(),
    };

    if (IS_STATIC_DEMO) {
      setStatus('demo');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Submission failed');
      setStatus('success');
      setMessage('Sent. The campaign media team reviews every submission — follow up on WhatsApp for a faster answer.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  

  if (status === 'success') {
    return <p className="rounded-lg bg-brand-green-light px-4 py-3 text-sm font-semibold text-brand-green">{message}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4" aria-label="Ask Ola submission form">
      {IS_STATIC_DEMO && (
        <p className="rounded-lg bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-800">
          DEMO PREVIEW — submissions are disabled on this preview host; production routes them to the media team.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="askName">Your Name *</label>
          <input id="askName" name="fullName" required className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="askPhone">Phone (WhatsApp) *</label>
          <input id="askPhone" name="phoneNumber" required type="tel" className="field-input" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="askWard">Ward *</label>
          <select id="askWard" name="ward" required className="field-input" defaultValue="">
            <option value="" disabled>Select ward…</option>
            {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="askType">Type *</label>
          <select id="askType" name="messageType" required className="field-input" defaultValue="">
            <option value="" disabled>Select type…</option>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="field-label" htmlFor="askBody">Your question or rumor to verify *</label>
        <textarea id="askBody" name="messageBody" required rows={4} className="field-input"
          placeholder="e.g. I heard on WhatsApp that… — is this true?" />
      </div>
      {status === 'error' && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-brand-red">{message}</p>
      )}
      <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full disabled:opacity-60">
        {status === 'submitting' ? 'Sending…' : 'Submit to the Media Team'}
      </button>
    </form>
  );
}