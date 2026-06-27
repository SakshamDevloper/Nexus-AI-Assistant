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
        'bg-deep': 'var(--bg-deep)',
        'surface': 'var(--bg-surface)',
        'elevated': 'var(--bg-elevated)',
        'accent': '#5ed29c',
        'glass': 'var(--glass-bg)',
        'glass-border': 'var(--glass-border)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        'border-color': 'var(--border-color)',
        'overlay': 'var(--overlay)',
        'code-bg': 'var(--code-bg)',
        'surface-80': 'var(--surface-80)',
        'surface-95': 'var(--surface-95)',
        'surface-40': 'var(--surface-40)',
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
        'star-movement-bottom': 'star-movement-bottom 6s linear infinite',
        'star-movement-top': 'star-movement-top 6s linear infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%': { transform: 'scaleY(1)' },
        },
        'star-movement-bottom': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(-100%, 0%)', opacity: '1' },
        },
        'star-movement-top': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(100%, 0%)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}
