const footerColumns = [
  {
    title: "Product",
    links: ["Voice Chat", "Text Chat", "Memory", "Workflows", "Embedding", "API"],
  },
  {
    title: "Resources",
    links: ["Docs", "Demos", "Blog", "Changelog", "Case Studies", "Reviews"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Pricing", "Privacy Policy", "Terms of Service"],
  },
  {
    title: "Developers",
    links: ["API Reference", "SDKs", "MCP Server", "Changelog", "Status"],
  },
];

export default function Footer() {
  return (
    <footer className="py-[80px] border-t border-border">
      <div className="max-w-container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-3">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="#7c5af0" strokeWidth="1.5" fill="none" />
                <path d="M16 6c-5.5 0-10 4.5-10 10s4.5 10 10 10" stroke="#7c5af0" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M16 10c-3.3 0-6 2.7-6 6s2.7 6 6 6" stroke="#00d4aa" strokeWidth="2" strokeLinecap="round" fill="none" />
                <circle cx="16" cy="16" r="3" fill="#7c5af0" />
              </svg>
              <span className="text-white font-bold text-base">Athena</span>
            </a>
            <p className="text-sm text-text-muted mb-4">Think out loud. Explore everything.</p>
            <div className="flex gap-3">
              {["X", "in", "GH"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-xs text-text-muted hover:text-white hover:border-text-muted transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-[0.08em] mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-text-secondary hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-10 pt-6">
          <p className="text-xs text-text-muted">
            © 2026 Athena AI, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
