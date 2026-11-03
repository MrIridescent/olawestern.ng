import type { SocialProfile } from '@/types';

const PATHS: Record<SocialProfile['platform'], string> = {
  x: 'M18.9 2H22l-6.8 7.8L23.3 22h-6.3l-4.9-6.4L6.5 22H3.4l7.3-8.3L2.7 2h6.4l4.4 5.9L18.9 2zm-1.1 18.1h1.7L7.3 3.8H5.5l12.3 16.3z',
  facebook: 'M13.5 22v-8h2.7l.4-3.1h-3.1V9c0-.9.25-1.5 1.55-1.5h1.65V4.7c-.3-.04-1.3-.13-2.45-.13-2.42 0-4.05 1.48-4.05 4.2v2.22H7.5V14h2.7v8h3.3z',
  instagram: 'M12 7.4a4.6 4.6 0 100 9.2 4.6 4.6 0 000-9.2zm0 7.6a3 3 0 110-6 3 3 0 010 6zm5.9-7.8a1.07 1.07 0 11-2.14 0 1.07 1.07 0 012.14 0zM8.6 2h6.8c3.53 0 4.6.92 4.6 4.6v6.8c0 3.53-.92 4.6-4.6 4.6H8.6c-3.68 0-4.6-1.07-4.6-4.6V6.6C4 3.07 4.92 2 8.6 2zm-.4 2C5.5 4 4 5 4 7.7v8.6C4 19 5 20 7.7 20h8.6c2.7 0 3.7-1 3.7-3.7V7.7C20 5 19 4 16.3 4H8.2z',
  tiktok: 'M16.6 5.8A4.8 4.8 0 0114.8 2h-3.2v13.2a2.7 2.7 0 11-2-2.6V9.3a5.9 5.9 0 104.2 5.6V9.1a8 8 0 003.9 1v-3.2a4.8 4.8 0 01-1.1-1.1zM16.6 5.8z',
  youtube: 'M23 12s0-3.6-.46-5.32a2.77 2.77 0 00-1.95-1.96C18.87 4.25 12 4.25 12 4.25s-6.87 0-8.59.47a2.77 2.77 0 00-1.95 1.96C1 8.4 1 12 1 12s0 3.6.46 5.32c.26.95 1 1.7 1.95 1.96 1.72.46 8.59.46 8.59.46s6.87 0 8.59-.46a2.77 2.77 0 001.95-1.96C23 15.6 23 12 23 12zM9.8 15.3V8.7l6.2 3.3-6.2 3.3z',
  whatsapp: 'M17.5 14.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07a8.2 8.2 0 01-2.4-1.48 9.05 9.05 0 01-1.66-2.07c-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.1 4.49.71.3 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.76-.72 2-1.41.25-.7.25-1.3.18-1.42-.07-.12-.27-.2-.57-.35zM12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2c-1.6 0-3.1-.46-4.4-1.3l-.32-.2-2.96.77.79-2.88-.2-.33A8.2 8.2 0 1112 20.2z',
};

export function SocialIcon({ platform, size = 18 }: { platform: SocialProfile['platform']; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={PATHS[platform]} />
    </svg>
  );
}

/**
 * Row of social chips. Only confirmed handles are rendered — the layout
 * never shows dead links or "coming soon" notices to the public.
 */
export default function SocialLinksRow({ socials, dark = false }: { socials: SocialProfile[]; dark?: boolean }) {
  const confirmed = socials.filter((s) => s.url);
  if (!confirmed.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Social media links">
      {confirmed.map((s) => (
        <li key={s.platform}>
          <a
            href={s.url!}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.label}: ${s.handle}`}
            title={s.handle}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
              dark ? 'bg-white/10 text-white hover:bg-brand-green' : 'bg-brand-green-light text-brand-green hover:bg-brand-green hover:text-white'
            }`}
          >
            <SocialIcon platform={s.platform} />
          </a>
        </li>
      ))}
    </ul>
  );
}
