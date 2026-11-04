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
          blue: '#17607F',     // Deep petrol blue accent (was #00A3E0)
          'blue-dark': '#0F4C66',
          red: '#B72329',      // Muted brick red (was #E30613)
          dark: '#1C1C1C',     // Neutral dark
          gray: '#4B4B4B',
          light: '#F7F9F8',
          gold: '#7E6310',     // Antiqued gold (was #D4A017) — AA on white
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