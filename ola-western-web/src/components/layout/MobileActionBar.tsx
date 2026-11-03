'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Sticky bottom action bar — phones only (Nigeria is mobile-first: most
 * voters arrive on a hand held in one hand). Keeps the three persuasive
 * actions — the record, WhatsApp, volunteering — always within thumb reach.
 * A spacer (rendered next to it) keeps page content clear of the bar.
 * Hidden inside the CMS, where the bar would sit over the editor's own
 * save buttons.
 */
export default function MobileActionBar({ whatsappLink }: { whatsappLink: string }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <div className="mobile-cta-spacer" aria-hidden />
      <nav
        aria-label="Quick actions"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur xl:hidden"
      >
        <div className="flex items-stretch gap-2">
          <Link
            href="/impact"
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-full border-2 border-brand-green bg-white px-2 text-center text-[13px] font-bold leading-tight text-brand-green"
          >
            His Record
          </Link>
          <Link
            href="/join"
            className="flex min-h-[48px] flex-1 items-center justify-center rounded-full border-2 border-brand-dark bg-white px-2 text-center text-[13px] font-bold leading-tight text-brand-dark"
          >
            Join Us
          </Link>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] flex-[1.4] items-center justify-center gap-1.5 rounded-full bg-brand-green px-2 text-[13px] font-bold leading-tight text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.46-4.4-1.3l-.32-.2-2.96.77.79-2.88-.2-.33A8.2 8.2 0 1 1 12 20.2z" />
              <path d="M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07a8.2 8.2 0 0 1-2.4-1.48 9.05 9.05 0 0 1-1.66-2.07c-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2-1.41.25-.7.25-1.3.18-1.42-.07-.12-.27-.2-.57-.35z" />
            </svg>
            WhatsApp
          </a>
        </div>
      </nav>
    </>
  );
}
