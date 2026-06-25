export default function FeatureVoiceChat() {
  return (
    <section className="py-[120px]">
      <div className="max-w-container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="bg-bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-accent-teal animate-dot-pulse" />
            <span className="text-xs font-medium text-accent-teal">Voice Active</span>
            <span className="ml-auto text-[11px] text-text-muted font-mono">● LIVE</span>
          </div>
          <div className="flex items-end gap-1 mb-4 h-8">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-[5px] bg-accent-teal rounded-full opacity-80"
                style={{
                  height: `${8 + Math.random() * 24}px`,
                  animation: `waveform ${0.6 + Math.random() * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.06}s`,
                }}
              />
            ))}
          </div>
          <div className="h-px bg-border my-3" />
          <div className="space-y-1 text-sm text-text-secondary font-mono">
            <p className="text-text-primary/80">&quot;What are some ways to grow my newsletter without paid ads?&quot;</p>
          </div>
          <div className="h-px bg-border my-3" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-accent-purple">Athena:</p>
            <p className="text-sm text-text-secondary leading-relaxed">
              Here are 5 high-leverage strategies...
              <br />1. Cross-promotions with adjacent...
              <br />2. SEO-optimized landing pages...
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <span className="text-xs text-text-muted border border-border rounded px-2.5 py-1 flex items-center gap-1.5">
              <i className="fa-regular fa-comment-dots" /> Continue
            </span>
            <span className="text-xs text-text-muted border border-border rounded px-2.5 py-1 flex items-center gap-1.5">
              <i className="fa-regular fa-clipboard" /> Save to notes
            </span>
          </div>
        </div>

        <div>
          <span className="text-xs tracking-[0.12em] text-text-muted font-medium">VOICE + TEXT</span>
          <h2 className="text-[clamp(32px,4vw,56px)] font-bold tracking-[-0.03em] leading-[1.1] mt-4">
            Say it or type it. <br />Either way, Athena is listening.
          </h2>
          <p className="text-base text-text-secondary leading-relaxed mt-4">
            Whether you prefer talking through ideas or typing them out, Athena adapts.
            Switch between voice and chat mid-conversation with zero friction.
          </p>
          <div className="space-y-4 mt-8">
            <div className="flex items-start gap-3">
              <i className="fas fa-microphone text-lg w-5 text-center text-accent-teal" />
              <div>
                <p className="text-sm font-medium text-white">Real-time voice transcription</p>
                <p className="text-sm text-text-muted">Sub-200ms latency</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <i className="fas fa-comment text-lg w-5 text-center text-accent-purple" />
              <div>
                <p className="text-sm font-medium text-white">Persistent chat history</p>
                <p className="text-sm text-text-muted">Across all your sessions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <i className="fas fa-sync text-lg w-5 text-center text-accent-teal" />
              <div>
                <p className="text-sm font-medium text-white">Seamless mode switching</p>
                <p className="text-sm text-text-muted">Voice to text, mid-conversation</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
