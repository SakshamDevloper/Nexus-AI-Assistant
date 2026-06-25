/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-deep': '#070b0a',
        'accent': '#5ed29c',
        'glass-bg': 'rgba(255,255,255,0.04)',
        'text-primary': '#f0f4f2',
        'text-muted': 'rgba(255,255,255,0.55)',
      },
      fontFamily: {
        'display': ['Inter', 'sans-serif'],
        'body': ['Plus Jakarta Sans', 'sans-serif'],
        'accent': ['Instrument Serif', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'wave': 'wave 1.2s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        }
      }
    },
  },
  plugins: [],
}