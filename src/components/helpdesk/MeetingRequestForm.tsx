'use client';

import { useState } from 'react';
import { WARDS } from '@/types';

/**
 * @typedef {'idle' | 'submitting' | 'success' | 'error'} Status
 * Represents the current status of the form submission.
 */
type Status = 'idle' | 'submitting' | 'success' | 'error';

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
 * A form for constituents to request an open-door meeting with the campaign.
 * It captures personal details, meeting preferences, and the topic of discussion.
 * Submissions are sent to the /api/inquiry endpoint as an "Office Hours Booking" type.
 * This component handles its own state for submission status and displays appropriate
 * user feedback.
 * @returns {JSX.Element} The rendered meeting request form.
 */
export default function MeetingRequestForm() {
  // State for the form submission status.
  const [status, setStatus] = useState<Status>('idle');
  // State for the feedback message shown to the user.
  const [message, setMessage] = useState('');

  /**
   * Handles the form submission event.
   * It performs validation, constructs the request payload, and sends it to the API.
   * Updates the status and message states based on the API response.
   * @param {React.FormEvent<HTMLFormElement>} e The form submission event.
   */
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
      setMessage('Please fill out all required fields: Name, Phone, and what you want to discuss.');
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
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'An unexpected error occurred during submission.');
      }
      setStatus('success');
      setMessage('Your request has been received. The ward desk will contact you via WhatsApp to confirm your slot.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'An unknown error occurred. Please try again later.');
    }
  }

  if (status === 'success') {
    return (
      <div className="card border-brand-green bg-brand-green-light text-center">
        <p className="font-display text-xl font-bold text-brand-green">Request Received</p>
        <p className="mt-2 text-sm text-brand-dark">{message}</p>
        <button type="button" onClick={() => setStatus('idle')} className="btn-secondary mt-4">
          Request Another Slot
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4" aria-label="Open-door meeting request">
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
        Your personal information is collected and processed by your ward desk in accordance with the Nigeria Data Protection Act (NDPA) 2023.
        It will be used exclusively for the purpose of arranging and following up on this meeting.
      </p>
    </form>
  );
}