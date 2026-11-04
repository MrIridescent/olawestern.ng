'use client';

import { useState } from 'react';
import { ISSUE_CATEGORIES, WARDS } from '@/types';
import { IS_STATIC_DEMO } from '@/lib/siteMode';

type Status = 'idle' | 'submitting' | 'success' | 'error' | 'demo';

/**
 * IssueReportForm — the public front door of the Constituent Help Desk.
 * Reports are stored campaign-side and appear on the public dashboard only
 * after the ward team verifies and publishes them.
 */
export default function IssueReportForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      title: String(form.get('title') ?? ''),
      ward: String(form.get('ward') ?? ''),
      category: String(form.get('category') ?? ''),
      detail: String(form.get('detail') ?? ''),
      reporter_name: String(form.get('reporter_name') ?? ''),
      reporter_phone: String(form.get('reporter_phone') ?? ''),
      consent: form.get('consent') === 'on',
    };

    if (!payload.consent) {
      setStatus('error');
      setMessage('Please accept the data-protection consent so the desk can act on your report.');
      return;
    }

    if (IS_STATIC_DEMO) {
      setStatus('demo');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? 'Submission failed');
      setStatus('success');
      setMessage(json.message ?? 'Report received — your ward team will verify it and publish the status.');
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
          This frozen preview validates exactly like the live desk, but issue capture runs only on the
          production site. To report a neighbourhood issue right now, message the campaign on WhatsApp.
        </p>
        <a href="https://wa.me/2349041258180?text=Issue%20Report" target="_blank" rel="noopener noreferrer" className="btn-primary mt-4">
          Report via WhatsApp instead
        </a>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="card border-brand-green bg-brand-green-light text-center">
        <p className="font-display text-xl font-bold text-brand-green">Report logged</p>
        <p className="mt-2 text-sm text-brand-dark">{message}</p>
        <p className="mt-3 text-xs text-brand-gray">
          Keep the reference below if you follow up by phone — the ward desk works by list, not by memory.
        </p>
        <button type="button" onClick={() => setStatus('idle')} className="btn-secondary mt-4">
          Report another issue
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4" aria-label="Report a neighbourhood issue">
      {IS_STATIC_DEMO && (
        <p className="rounded-lg bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-800">
          DEMO PREVIEW — this form validates exactly like production, but submissions are not stored on this preview host.
        </p>
      )}
      <div>
        <label className="field-label" htmlFor="issueTitle">What is the problem? *</label>
        <input
          id="issueTitle"
          name="title"
          required
          minLength={8}
          maxLength={160}
          className="field-input"
          placeholder="e.g. Drainage at 23 Road junction is blocked again"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="issueWard">Ward *</label>
          <select id="issueWard" name="ward" required className="field-input" defaultValue="">
            <option value="" disabled>Select your ward…</option>
            {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div>
          <label className="field-label" htmlFor="issueCategory">Category *</label>
          <select id="issueCategory" name="category" required className="field-input" defaultValue="">
            <option value="" disabled>Select a category…</option>
            {ISSUE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="field-label" htmlFor="issueDetail">Details (street, landmark, how long it has been like this)</label>
        <textarea
          id="issueDetail"
          name="detail"
          rows={4}
          maxLength={2000}
          className="field-input"
          placeholder="Where exactly, and what happens because of it?"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label" htmlFor="issueName">Your name</label>
          <input id="issueName" name="reporter_name" autoComplete="name" className="field-input" placeholder="Optional — ward teams call back faster with a name" />
        </div>
        <div>
          <label className="field-label" htmlFor="issuePhone">Phone (WhatsApp) *</label>
          <input
            id="issuePhone"
            name="reporter_phone"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="field-input"
            placeholder="+234 80..."
          />
        </div>
      </div>

      <label className="flex items-start gap-3 text-xs text-brand-gray">
        <input type="checkbox" name="consent" required className="mt-0.5 h-5 w-5 shrink-0 accent-brand-green" />
        <span>
          I consent to the Ola Western Campaign Organization storing this report and my contact number so
          the ward desk can investigate and follow up, in line with the Nigeria Data Protection Act (NDPA) 2023.
          My name and number are never published on the dashboard.
        </span>
      </label>

      {status === 'error' && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-brand-red">{message}</p>
      )}

      <button type="submit" disabled={status === 'submitting'} className="btn-primary w-full disabled:opacity-60">
        {status === 'submitting' ? 'Sending to the desk…' : 'Submit to the Help Desk'}
      </button>
    </form>
  );
}
