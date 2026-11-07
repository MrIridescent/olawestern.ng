'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Records one visit per browser per day, on every public page.
 *
 * The homepage counter only reads and polls; this beacon is the single place
 * that increments, so a visitor who lands on /truth-room or /news is counted
 * too. The API de-duplicates with an httpOnly cookie and a per-IP window.
 *
 * Admin surfaces are excluded so campaign staff do not inflate the public
 * figure. The component renders nothing.
 */

let requested = false;

export default function VisitBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/hq')) return;
    if (requested) return;
    requested = true;

    fetch('/api/visits', { method: 'POST', cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as { success?: boolean; count?: unknown };
        if (json.success === true && typeof json.count === 'number') {
          window.dispatchEvent(
            new CustomEvent<number>('ow:visits', { detail: json.count }),
          );
        }
      })
      .catch(() => {
        // Allow a later page load to try again if this request never landed.
        requested = false;
      });
  }, [pathname]);

  return null;
}
