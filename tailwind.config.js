/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-surface': '#F8FAFC',  // Light Slate
        'brand-card': '#FFFFFF',     // White
        'brand-navy': '#0F172A',     // Slate 900 (for headings)
        'brand-blue': '#A41720',     // Crimson
        'brand-hover': '#C0152A',
        'brand-body': '#475569',     // Slate 600
        'brand-heading': '#0F172A',  // Slate 900
        'brand-green': '#16a34a',
        'brand-amber': '#d97706',
        'brand-red': '#dc2626',
        'brand-border': '#E2E8F0',   // Slate 200
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'brand': '10px',
        'sm': '10px',
        'md': '10px',
        'lg': '10px',
        'xl': '10px',
        '2xl': '10px',
        '3xl': '10px',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
