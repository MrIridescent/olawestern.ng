'use client';

import { useState } from 'react';

/**
 * Stage 1 of the supporter journey: one field, one dominant action.
 * The number is handed to the campaign's WhatsApp desk with a prefilled
 * message, so the constituent lands in a real conversation rather than a
 * dead “thanks” screen.
 */
export default function JoinMovementForm({ whatsappNumber }: { whatsappNumber: string }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    const local = digits.startsWith('234') ? digits.slice(3) : digits.replace(/^0/, '');

    if (local.length < 10) {
      setError('Enter a valid Nigerian WhatsApp number, e.g. 0803 400 5708.');
      return;
    }

    setError(null);
    const international = `234${local}`;
    const text = encodeURIComponent(
      `Hello OlaWestern campaign. I want to join the movement in Amuwo-Odofin Constituency 1. My WhatsApp number is +${international}.`,
    );
    const href = `https://wa.me/${whatsappNumber}?text=${text}`;
    // Some mobile browsers block window.open from a submit handler. Keep the
    // link on screen so the handoff is never a dead end.
    setWaLink(href);
    window.open(href, '_blank', 'noopener,noreferrer');
    setPhone('');
  }

  return (
    <form onSubmit={submit} className="w-full" noValidate>
      <label htmlFor="join-whatsapp" className="sr-only">
        Your WhatsApp number
      </label>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div className="flex min-h-[54px] flex-1 items-center rounded-lg border border-white/20 bg-white px-3 shadow-sm focus-within:border-brand-electric focus-within:ring-2 focus-within:ring-brand-electric/40">
          <span className="mr-2 border-r border-gray-200 pr-2 text-sm font-bold text-brand-navy">+234</span>
          <input
            id="join-whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="803 400 5708"
            aria-describedby={error ? 'join-error' : undefined}
            aria-invalid={!!error}
            className="min-h-[52px] w-full bg-transparent text-base font-semibold text-brand-navy outline-none placeholder:font-normal placeholder:text-gray-400"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-lg bg-brand-electric px-7 text-sm font-extrabold text-brand-navy shadow-[0_4px_14px_rgba(255,87,34,0.45)] transition-all hover:bg-brand-electric-dark hover:text-white active:scale-[0.99]"
        >
          Join the Movement <span aria-hidden>→</span>
        </button>
      </div>
      {error ? (
        <p id="join-error" role="alert" className="mt-2 text-xs font-semibold text-brand-electric-bright">
          {error}
        </p>
      ) : waLink ? (
        <p className="mt-2 text-[11px] leading-relaxed text-white/75">
          WhatsApp should open in a new tab. If it did not,{' '}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-brand-electric-bright underline underline-offset-2 hover:text-white"
          >
            tap here to reach the campaign desk
          </a>
          .
        </p>
      ) : (
        <p className="mt-2 text-[11px] leading-relaxed text-white/75">
          Your number reaches the campaign desk on WhatsApp. No public posting, no spam.
        </p>
      )}
    </form>
  );
}
