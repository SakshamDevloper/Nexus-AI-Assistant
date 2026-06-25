"use client";

import { useState } from "react";

const navLinks = [
  { label: "Features", dropdown: true },
  { label: "Use Cases" },
  { label: "Docs" },
  { label: "Pricing" },
];

const dropdownItems = [
  "Voice Chat",
  "Text Chat",
  "Memory",
  "Workflows",
  "Embed",
  "API",
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 h-[60px] bg-black/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-container mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#7c5af0" strokeWidth="1.5" fill="none" />
              <path d="M16 6c-5.5 0-10 4.5-10 10s4.5 10 10 10" stroke="#7c5af0" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M16 10c-3.3 0-6 2.7-6 6s2.7 6 6 6" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" fill="none" />
              <circle cx="16" cy="16" r="3" fill="#7c5af0" />
            </svg>
            <span className="text-white font-bold text-lg tracking-tight">Athena</span>
          </a>
          <div className="hidden md:flex items-center gap-6 ml-8">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => link.dropdown && setFeaturesOpen(true)}
                onMouseLeave={() => link.dropdown && setFeaturesOpen(false)}
              >
                <button className="text-text-secondary hover:text-white text-sm font-medium transition-colors flex items-center gap-1">
                  {link.label}
                  {link.dropdown && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                {link.dropdown && featuresOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-bg-elevated border border-border rounded-lg p-2 shadow-2xl">
                    {dropdownItems.map((item) => (
                      <a
                        key={item}
                        href="#"
                        className="block px-3 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-md transition-colors"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hidden sm:block text-text-secondary hover:text-white text-sm font-medium transition-colors">
            Log in
          </a>
          <a
            href="#"
            className="bg-accent-purple hover:bg-accent-purple/90 text-white text-sm font-semibold px-4 py-2 rounded-[6px] cta-glow transition-all"
          >
            Start free
          </a>
          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-bg-elevated border-b border-border px-6 py-4">
          {navLinks.map((link) => (
            <a key={link.label} href="#" className="block py-2 text-text-secondary hover:text-white text-sm">
              {link.label}
            </a>
          ))}
          <a href="#" className="block py-2 text-text-secondary hover:text-white text-sm">Log in</a>
        </div>
      )}
    </nav>
  );
}
