export default function FinalCta() {
  return (
    <section className="py-[120px] text-center bg-gradient-to-b from-black via-[rgba(124,90,240,0.06)] to-black">
      <div className="max-w-container mx-auto px-6">
        <h2 className="text-[clamp(32px,4vw,56px)] font-bold tracking-[-0.03em]">
          Start thinking out loud.
        </h2>
        <p className="text-base text-text-secondary mt-4 max-w-md mx-auto">
          Athena is free to try. No credit card. No setup. Just start talking.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
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
            Book a demo
          </a>
        </div>
        <div className="flex items-center justify-center gap-6 mt-8 text-[13px] text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="text-accent-teal">✓</span> Free forever plan
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-accent-teal">✓</span> Works on voice + text
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-accent-teal">✓</span> No setup required
          </span>
        </div>
      </div>
    </section>
  );
}
