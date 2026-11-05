'use client';

import { usePathname } from 'next/navigation';
import { SITE } from '@/lib/content';

export default function SocialShare({ title }: { title: string }) {
  const pathname = usePathname();
  const url = `${SITE.siteUrl}${pathname}`;

  const socialLinks = [
    {
      name: 'WhatsApp',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`,
    },
    {
      name: 'X',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
  ];

  return (
    <div className="flex items-center gap-4">
      <span className="font-semibold">Share on:</span>
      <div className="flex gap-2">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300"
          >
            {link.name}
          </a>
        ))}
      </div>
    </div>
  );
}