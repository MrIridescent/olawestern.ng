'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
      <div className="container-site flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 4.5c6.351 0 11.5 5.149 11.5 11.5S22.351 27.5 16 27.5 4.5 22.351 4.5 16 9.649 4.5 16 4.5z"
              fill="#fff"
            />
            <path
              d="M16 6.5c-5.24 0-9.5 4.26-9.5 9.5s4.26 9.5 9.5 9.5 9.5-4.26 9.5-9.5-4.26-9.5-9.5-9.5zm0 2c4.148 0 7.5 3.352 7.5 7.5s-3.352 7.5-7.5 7.5-7.5-3.352-7.5-7.5 3.352-7.5 7.5-7.5z"
              fill="#fff"
            />
          </svg>
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