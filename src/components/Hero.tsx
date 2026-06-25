import AnnouncementBanner from "./AnnouncementBanner";
import Orb from "./Orb";

const logos = [
  "Vercel", "Linear", "Notion", "Raycast", "Figma",
  "Vercel", "Linear", "Notion", "Raycast", "Figma",
];

export default function Hero() {
  return (
    <section className="relative pt-8 pb-[100px] overflow-hidden">
      <AnnouncementBanner />

      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-12">
        <span className="text-xs uppercase tracking-[0.12em] text-text-muted font-medium mb-6">
          Voice-Native AI Assistant
        </span>

        <h1 className="max-w-[900px]">
          <span className="block text-[clamp(56px,7vw,96px)] font-bold tracking-[-0.04em] leading-[1.0] text-white">
            Talk to your AI.
          </span>
          <span className="block text-[clamp(56px,7vw,96px)] font-bold tracking-[-0.04em] leading-[1.0] gradient-text mt-2">
            Explore any idea.
          </span>
        </h1>

        <p className="text-lg text-text-secondary max-w-[520px] mx-auto mt-6 leading-relaxed">
          Chat or speak with Athena in real time. Brainstorm ideas, get instant answers,
          and build your thinking — without switching tools.
        </p>

        <div className="flex items-center gap-4 mt-8">
          <a
            href="#"
            className="bg-accent-purple hover:bg-accent-purple/90 text-white font-semibold text-[15px] px-6 py-3 rounded-[6px] cta-glow transition-all"
          >
            Start free
          </a>
          <a
            href="#"
            className="border border-border text-text-secondary hover:text-white font-medium text-[15px] px-6 py-3 rounded-[6px] transition-colors"
          >
            See a demo
          </a>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none">
        <Orb size={400} className="opacity-60" />
      </div>

      <div className="relative z-10 max-w-container mx-auto px-6 mt-12">
        <div className="border border-border rounded-xl overflow-hidden bg-black/60 shadow-2xl">
          <div className="aspect-[16/10] bg-gradient-to-b from-bg-surface to-black p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-accent-teal animate-dot-pulse" />
              <span className="text-xs font-medium text-accent-teal">Voice Active</span>
              <span className="ml-auto text-[11px] text-text-muted font-mono">● LIVE</span>
            </div>
            <div className="flex items-end gap-1 mb-4 h-8">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[6px] bg-accent-teal rounded-full opacity-80"
                  style={{
                    height: `${8 + Math.random() * 28}px`,
                    animation: `waveform ${0.6 + Math.random() * 0.4}s ease-in-out infinite`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
            <div className="text-sm text-text-secondary font-mono leading-relaxed space-y-2">
              <p className="text-text-primary/80">&quot;What are some ways to grow my newsletter without paid ads?&quot;</p>
              <div className="h-px bg-border my-2" />
              <p className="text-accent-purple font-semibold text-xs">Athena:</p>
              <p className="text-text-secondary">
                Here are 5 high-leverage strategies...
                <br />1. Cross-promotions with adjacent...
                <br />2. SEO-optimized landing pages...
              </p>
            </div>
            <div className="flex gap-3 mt-auto pt-3">
              <span className="text-[13px] text-text-muted border border-border rounded px-2.5 py-1 flex items-center gap-1.5">
                <i className="fa-regular fa-comment-dots" /> Continue
              </span>
              <span className="text-[13px] text-text-muted border border-border rounded px-2.5 py-1 flex items-center gap-1.5">
                <i className="fa-regular fa-clipboard" /> Save to notes
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center">
        <p className="text-sm text-text-muted mb-6">Trusted by 500+ teams to think faster</p>
        <div className="overflow-hidden">
          <div className="flex animate-scroll-left gap-12">
            {logos.concat(logos).map((name, i) => (
              <span key={i} className="text-text-secondary/50 text-lg font-semibold whitespace-nowrap">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
