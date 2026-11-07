'use client';

import { useState } from 'react';
import { WARDS } from '@/types';
import { SITE } from '@/lib/content';

export default function VolunteerForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successNote, setSuccessNote] = useState('Thank you for your submission!');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/volunteer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, address, ward, message, consent }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccessNote(data.message || 'Thank you for your submission!');
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setWard('');
      setMessage('');
      setConsent(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      <div>
        <label htmlFor="name" className="field-label">
          Full Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="name"
            id="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="field-input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="field-label">
          Email Address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="field-label">
          Phone Number
        </label>
        <div className="mt-1">
          <input
            type="tel"
            name="phone"
            id="phone"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="field-input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="address" className="field-label">
          Residential Address
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="address"
            id="address"
            autoComplete="street-address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="field-input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="ward" className="field-label">
          Ward
        </label>
        <div className="mt-1">
          <select
            name="ward"
            id="ward"
            required
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            className="field-input"
          >
            <option value="" disabled>
              Select your ward
            </option>
            {WARDS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="field-label">
          Why do you want to volunteer?
        </label>
        <div className="mt-1">
          <textarea
            id="message"
            name="message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="field-input"
          />
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-brand-navy/10 bg-brand-navy/[0.03] p-4">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-none accent-brand-electric"
        />
        <label htmlFor="consent" className="text-xs leading-relaxed text-brand-navy/75">
          I agree to the campaign storing these details under the Nigeria Data Protection Act 2023, solely so
          the ward team can contact me about volunteering. I can ask for my data to be removed at any time.
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="btn-accent w-full"
        >
          {submitting ? 'Submitting...' : 'Become a Volunteer'}
        </button>
      </div>

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successNote}</p>
              <a
                href={SITE.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs font-bold text-brand-green underline underline-offset-2"
              >
                Introduce yourself to the ward desk on WhatsApp ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}