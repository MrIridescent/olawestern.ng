'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * One thumb, one action. On phones the conversion path is a single
 * full-width Electric Orange bar, anchored under the safe area.
 * Hidden inside the CMS, where it would sit over the editor's save buttons.
 */
export default function MobileActionBar() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <div className="mobile-cta-spacer" aria-hidden />
      <nav
        aria-label="Join the movement"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/15 bg-brand-electric px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-10px_30px_rgba(3,7,18,0.25)] md:hidden"
      >
        <Link
          href="/join"
          className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-[15px] font-extrabold tracking-tight text-brand-navy transition-transform active:scale-[0.99]"
        >
          Join OlaWestern&rsquo;s Movement
          <span aria-hidden>→</span>
        </Link>
      </nav>
    </>
  );
}
