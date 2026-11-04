'use client';

import { useState } from 'react';
import { WARDS } from '@/types';
import { IS_STATIC_DEMO } from '@/lib/siteMode';

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'demo';

const MODES = [
  { value: 'In person — 32 Road by 3rd Avenue, FESTAC Town', label: 'In person at 32 Road HQ' },
  { value: 'Virtual — open-door WhatsApp call', label: 'Virtual open-door call (WhatsApp)' },
];

const SLOTS = [
  'Weekday morning (9am – 12pm)',
  'Weekday afternoon (1pm – 4pm)',
  'Saturday morning (10am – 1pm)',
  'Evening (after 6pm)',
];

/**
 * Open-door booking request. The campaign runs a standing open-door policy at
 * 32 Road; this routes a request to the ward desk, which confirms the slot on
 * WhatsApp. Stored as a constituent inquiry of type "Office Hours Booking" —
 * no fake calendar, no auto-confirmation the campaign cannot honour.
 */
export default function MeetingRequestForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get('fullName') ?? '').trim();
    const phone = String(form.get('phoneNumber') ?? '').trim();
    const ward = String(form.get('ward') ?? '');
    const mode = String(form.get('mode') ?? '');
    const slot = String(form.get('slot') ?? '');
    const preferredDate = String(form.get('preferredDate') ?? '').trim();
    const topic = String(form.get('topic') ?? '').trim();

    if (!name || !phone || !topic) {
      setStatus('error');
      setMessage('Name, phone and what you want to discuss are required.');
      return;
    }

    if (IS_STATIC_DEMO) {
      setStatus('demo');
      return;
    }

    setStatus('submitting');
    try {
      const body = [
        `OPEN-DOOR BOOKING REQUEST`,
        `Mode: ${mode}`,
        `Preferred day: ${preferredDate || 'Flexible'}`,
        `Preferred window: ${slot}`,
        `Ward: ${ward || 'Not specified'}`,
        `Agenda: ${topic}`,
      ].join('\n');

      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name,
          phoneNumber: phone,
          ward,
          messageType: 'Office Hours Booking',
          messageBody: body,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Submission failed');
      setStatus('success');
      setMessage('Your request is with the ward desk. You will get a WhatsApp message confirming the slot.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  if (status === 'demo') {
    return (
      <div className="card border-amber-300 bg-amber-50 text-center">
        <p className="font-display text-lg font-bold text-amber-800">Preview build — bookings are not stored here</p>
        <p className="mt-2 text-sm text-amber-900">Request a slot directly on the campaign WhatsApp line and the desk will confirm it.</p>
        <a href="https://wa.me/2349041258180?text=Open-Door%20Booking" target="_blank" rel="noopener noreferrer" className="btn-primary mt-4">
          Book on WhatsApp
        </a>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="card border-brand-green bg-brand-green-light text-center">
        <p className="font-display text-xl font-bold text-brand-green">Request received</p>
        <p className="mt-2 text-sm text-brand-dark">{message}</p>
        <button type="button" onClick={() => setStatus('idle')} className="btn-secondary mt-4">
          Request another slot
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4" aria-label="Open-door meeting request">
      {IS_STATIC_DEMO && (
        <p className="rounded-lg bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-800">
          DEMO PREVIEW — this form validates exactly like production, but requests are not stored on this preview host.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="meetName">Your name *</label>
          <input id="meetName" name="fullName" required autoComplete="name" className="field-input" placeholder="e.g. Folake Adeyemi" />
        </div>
        <div>
          <label className="field-label" htmlFor="meetPhone">Phone (WhatsApp) *</label>
          <input id="meetPhone" name="phoneNumber" required type="tel" inputMode="tel" autoComplete="tel" className="field-input" placeholder="+234 80..." />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="meetWard">Ward</label>
          <select id="meetWard" name="ward" className="field-input" defaultValue="">
            <option value="">Select ward…</option>
            {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="meetDate">Preferred day (optional)</label>
          <input id="meetDate" name="preferredDate" type="date" className="field-input" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="meetMode">How do you want to meet? *</label>
          <select id="meetMode" name="mode" required className="field-input" defaultValue={MODES[0].value}>
            {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="meetSlot">Preferred window *</label>
          <select id="meetSlot" name="slot" required className="field-input" defaultValue={SLOTS[0]}>
            {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="meetTopic">What do you want to discuss? *</label>
        <textarea
          id="meetTopic"
          name="topic"
          required
          rows={3}
          maxLength={1200}
          className="field-input"
          placeholder="e.g. Street lighting on 5th Avenue, or my shop’s permit problem at Agboju market"
        />
      </div>

      {status === 'error' && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-brand-red">{message}</p>
      )}

      <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full disabled:opacity-60">
        {status === 'submitting' ? 'Sending…' : 'Request an open-door slot'}
      </button>
      <p className="text-xs text-gray-600">
        Requests are handled by your ward desk under the Nigeria Data Protection Act (NDPA) 2023 and used
        only to arrange and follow up this meeting.
      </p>
    </form>
  );
}
