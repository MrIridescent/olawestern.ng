'use client';

import { useState } from 'react';
import { WARDS } from '@/types';

// Define the possible statuses of the form submission.
type Status = 'idle' | 'submitting' | 'success' | 'error';

// Define the allowed message types for inquiries.
const TYPES = ['Policy Inquiry', 'Rumor Verification', 'General Support'] as const;

/**
 * @summary "Ask Ola" form component.
 * @description This component renders a form that allows users to submit inquiries to the campaign media team.
 * It handles form submission, validation, and displays success or error messages to the user.
 */
export default function AskOlaForm() {
  // State for the form submission status.
  const [status, setStatus] = useState<Status>('idle');
  // State for the message to be displayed to the user.
  const [message, setMessage] = useState('');

  /**
   * @summary Handles the form submission.
   * @param {React.FormEvent<HTMLFormElement>} e - The form submission event.
   */
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

    setStatus('submitting');
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'An unknown error occurred.');
      setStatus('success');
      setMessage('Your message has been sent successfully. The campaign media team reviews every submission.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
    }
  }

  // If the form was submitted successfully, display a success message.
  if (status === 'success') {
    return <p className="rounded-lg bg-brand-green-light px-4 py-3 text-sm font-semibold text-brand-green">{message}</p>;
  }

  // Render the form.
  return (
    <form onSubmit={onSubmit} className="card space-y-4" aria-label="Ask Ola submission form">
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