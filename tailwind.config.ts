import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-primary": "#000000",
        "bg-surface": "#0a0a0a",
        "bg-elevated": "#141414",
        border: "#1f1f1f",
        "border-subtle": "#2a2a2a",
        "text-primary": "#ffffff",
        "text-secondary": "#888888",
        "text-muted": "#555555",
        "accent-purple": "#7c5af0",
        "accent-teal": "#00d4aa",
        "verified-green": "#22c55e",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      maxWidth: {
        container: "1200px",
      },
      animation: {
        "orb-pulse": "orb-pulse 4s ease-in-out infinite",
        "scroll-left": "scroll-left 40s linear infinite",
        "scroll-right": "scroll-right 40s linear infinite",
        "scroll-left-slow": "scroll-left 60s linear infinite",
        "scroll-right-slow": "scroll-right 60s linear infinite",
        "scroll-left-35": "scroll-left 35s linear infinite",
        "scroll-right-35": "scroll-right 35s linear infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "dot-pulse": "dot-pulse 1.5s ease-in-out infinite",
        "waveform": "waveform 0.8s ease-in-out infinite",
      },
      keyframes: {
        "orb-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.6" },
          "50%": { transform: "scale(1.08)", opacity: "1" },
        },
        "scroll-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "scroll-right": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "dot-pulse": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "waveform": {
          "0%, 100%": { height: "12px" },
          "50%": { height: "32px" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
