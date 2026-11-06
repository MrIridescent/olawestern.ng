import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // APC / Ola Western brand palette — calmed for long-read PR use.
        // Saturated broadcast-blue/red/gold were softened to deep, low-glare
        // equivalents; all body/background pairs target WCAG AA contrast.
        brand: {
          green: '#00794A',    // APC Green, deepened (primary)
          'green-dark': '#005C38',
          'green-light': '#E8F2EC',
          blue: '#1E3A8A',     // Imperial-blue accent (was petrol blue)
          'blue-dark': '#0B2545',
          red: '#B72329',      // Muted brick red (was #E30613)
          dark: '#0B1324',     // Neutral ink
          gray: '#4B5563',
          light: '#F6F8FB',
          gold: '#7E6310',     // Antiqued gold (was #D4A017) — AA on white

          // ── Campaign command palette (2027 brand system) ───────────────
          navy: '#0B2545',          // Imperial Navy — headers, bands, structure
          'navy-deep': '#071A33',   // deeper gradient stop
          'navy-dark': '#030712',   // compliance / footer charcoal-navy
          'navy-light': '#EDF3FA',  // navy-tinted canvas

          // Electric Orange is a fill/emphasis colour; electric-dark is the
          // AA-safe orange for small text on white.
          electric: '#FF5722',
          'electric-dark': '#C2410C',
          'electric-light': '#FFF1EA',
          'electric-bright': '#FF8A65',

          emerald: '#10B981',       // verification and success only
          'emerald-dark': '#047857',
          'emerald-light': '#ECFDF5',

          // Existing orange thread retained as an alias so older surfaces
          // pick up the new signal colour automatically.
          orange: '#FF5722',
          'orange-dark': '#C2410C',
          'orange-light': '#FFF1EA',
          'orange-bright': '#FF8A65',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'Georgia', '"Times New Roman"', 'serif'],
        glamour: ['"Cormorant Garamond"', 'serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.7s ease-out both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        marquee: 'marquee 22s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;