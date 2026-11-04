'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IS_STATIC_DEMO } from '@/lib/siteMode';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Ola' },
  { href: '/impact', label: 'Track Record' },
  { href: '/blueprint', label: 'Blueprint' },
  { href: '/help-desk', label: 'Help Desk' },
  { href: '/truth-room', label: 'Truth Room' },
  { href: '/news', label: 'Newsroom' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
  { href: '/join', label: 'Join' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur">
      {IS_STATIC_DEMO && (
        <div className="bg-brand-light px-4 py-1.5 text-center text-[11px] font-bold uppercase tracking-widest text-brand-green-dark">
          Static preview · full live capture runs at olawestern.ng
        </div>
      )}
      <div className="container-site flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green font-display text-lg font-bold text-white">
            OW
          </span>
          <span className="leading-tight">
            <span className="block font-display text-base font-bold text-brand-dark">Ola Western</span>
            <span className="block text-[10px] font-semibold uppercase tracking-widest text-brand-gray">
              {`... towards responsible representation`}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-2 text-[13px] font-semibold transition-colors ${
                pathname === item.href
                  ? 'bg-brand-green-light text-brand-green'
                  : 'text-brand-gray hover:bg-brand-light hover:text-brand-dark'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a href="https://wa.me/2349041258180?text=SupportOlaWestern" target="_blank" rel="noopener noreferrer" className="btn-primary ml-3 !px-5 !py-2">
            WhatsApp Us
          </a>
        </nav>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-12 w-12 items-center justify-center rounded-lg text-brand-dark hover:bg-brand-light xl:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-gray-100 bg-white px-4 pb-4 pt-2 xl:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-4 py-3 text-sm font-semibold ${
                pathname === item.href ? 'bg-brand-green-light text-brand-green' : 'text-brand-gray'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <a href="https://wa.me/2349041258180?text=SupportOlaWestern" className="btn-primary mt-2 w-full">
            Join on WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}
