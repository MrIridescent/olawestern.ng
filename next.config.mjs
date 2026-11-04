/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
];

// Static-export mode (NEXT_OUTPUT=export) produces the frozen `out/` bundle
// used for the Qoder Sites pitch preview. `headers` and API route handlers are
// skipped in that mode (handled by scripts/sites-export.mjs + the host's own
// edge caching). The normal SSR build (Vercel/olawestern.ng) is unaffected.
const isStaticExport = process.env.NEXT_OUTPUT === 'export';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(isStaticExport ? { output: 'export', trailingSlash: true } : {}),
  images: {
    // Static export hosts (Qoder Sites / plain static Netlify) cannot run the
    // Next image-optimisation server, so serve originals in export mode.
    unoptimized: isStaticExport,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [{ source: '/:path*', headers: securityHeaders }];
        },
      }),
};

export default nextConfig;