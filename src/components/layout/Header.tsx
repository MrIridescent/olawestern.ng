'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SITE } from '@/lib/content';

/** Desktop keeps the six decisions a voter makes most often. The full map
 *  (Help Desk, Gallery, Blog, Volunteer) stays in the mobile drawer and footer. */
const PRIMARY_NAV = [
  { href: '/about', label: 'About' },
  { href: '/impact', label: 'Track Record' },
  { href: '/blueprint', label: 'Legislative Agenda' },
  { href: '/#ward-impact', label: 'Ward Projects' },
  { href: '/truth-room', label: 'Truth Room' },
  { href: '/news', label: 'Media' },
  { href: '/contact', label: 'Contact' },
];

const ALL_NAV = [
  { href: '/hq', label: 'Digital Campaign HQ' },
  { href: '/about', label: 'About Ola Western' },
  { href: '/impact', label: 'Track Record' },
  { href: '/blueprint', label: 'Legislative Agenda' },
  { href: '/#ward-impact', label: 'Ward Projects' },
  { href: '/help-desk', label: 'Constituent Help Desk' },
  { href: '/truth-room', label: 'Truth Room' },
  { href: '/news', label: 'Newsroom' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog', label: 'Blog' },
  { href: '/media-kit', label: 'Media Kit' },
  { href: '/contact', label: 'Contact' },
  { href: '/join', label: 'Volunteer' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-navy/95 text-white shadow-[0_10px_30px_rgba(3,7,18,0.18)] backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-brand-electric focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>

      {/* Signal rule — orange is the conversion thread, white is the calm. */}
      <div className="h-[3px] w-full bg-gradient-to-r from-brand-electric via-brand-electric-bright to-brand-electric" aria-hidden />

      <div className="container-site flex h-[68px] items-center justify-between gap-4">
        <Link href="/" className="flex min-h-[48px] items-center gap-3" aria-label="OlaWestern — home">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path
                d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 4.5c6.351 0 11.5 5.149 11.5 11.5S22.351 27.5 16 27.5 4.5 22.351 4.5 16 9.649 4.5 16 4.5z"
                fill="#FF5722"
              />
              <path
                d="M16 6.5c-5.24 0-9.5 4.26-9.5 9.5s4.26 9.5 9.5 9.5 9.5-4.26 9.5-9.5-4.26-9.5-9.5-9.5zm0 2c4.148 0 7.5 3.352 7.5 7.5s-3.352 7.5-7.5 7.5-7.5-3.352-7.5-7.5 3.352-7.5 7.5-7.5z"
                fill="#FFFFFF"
              />
            </svg>
          </span>
          <span className="leading-none">
            <span className="block font-display text-[19px] font-extrabold tracking-tight">
              <span className="text-white">Ola</span><span className="text-brand-electric">Western</span>
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {PRIMARY_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative whitespace-nowrap px-2 py-2 text-[12.5px] font-semibold tracking-wide transition-colors after:absolute after:bottom-0.5 after:left-2 after:right-2 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-brand-electric after:transition-transform hover:text-white hover:after:scale-x-100 ${
                  active ? 'text-white after:scale-x-100' : 'text-white/70'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/hq"
            aria-label="Digital Campaign HQ"
            title="Digital Campaign HQ"
            className={`ml-2 inline-flex min-h-[44px] items-center gap-2 rounded-full border px-3 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors ${
              pathname.startsWith('/hq')
                ? 'border-brand-electric/70 bg-brand-electric/15 text-white'
                : 'border-white/20 text-white/80 hover:border-brand-electric/60 hover:text-white'
            }`}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-emerald opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-emerald" />
            </span>
            HQ
          </Link>
          <Link
            href="/join"
            className="btn ml-3 min-h-[44px] whitespace-nowrap rounded-full bg-brand-electric px-5 py-2 text-[13px] text-brand-navy shadow-[0_4px_14px_rgba(255,87,34,0.35)] hover:bg-brand-electric-dark hover:text-white"
          >
            Join Movement
            <span aria-hidden>→</span>
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-12 w-12 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-brand-navy px-4 pb-6 pt-3 lg:hidden" aria-label="Mobile">
          <div className="grid gap-1">
            {ALL_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-[48px] items-center rounded-lg border-l-2 px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-brand-electric bg-white/10 text-white'
                      : 'border-transparent text-white/75 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
          <Link href="/join" className="btn mt-4 w-full rounded-full bg-brand-electric text-brand-navy shadow-[0_4px_14px_rgba(255,87,34,0.35)] hover:bg-brand-electric-dark hover:text-white">
            Join OlaWestern&rsquo;s Movement <span aria-hidden>→</span>
          </Link>
          <a
            href={SITE.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn mt-2 w-full rounded-full border border-white/25 text-white hover:bg-white/10"
          >
            WhatsApp the campaign
          </a>
        </nav>
      )}
    </header>
  );
}
