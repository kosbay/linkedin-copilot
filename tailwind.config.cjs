/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#e8f3ff',
          100: '#d0e8ff',
          200: '#b0d5ff',
          300: '#70b5f9',
          400: '#378fe9',
          500: '#0a66c2',
          600: '#0a66c2',
          700: '#004182',
        },
        li: {
          bg: '#f3f2ef',
          border: '#e0dfdc',
          'border-dark': '#b3b1ad',
          'text-primary': '#191919',
          'text-secondary': '#666666',
          'text-tertiary': '#999999',
        },
      },
      boxShadow: {
        'li': '0 0 0 1px rgba(0,0,0,0.08), 0 4px 6px rgba(0,0,0,0.04)',
        'li-lg': '0 0 0 1px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.12)',
        'li-hover': '0 0 0 1px rgba(0,0,0,0.08), 0 6px 16px rgba(0,0,0,0.16)',
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
