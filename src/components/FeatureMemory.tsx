export default function FeatureMemory() {
  return (
    <section className="py-[120px]">
      <div className="max-w-container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div>
          <span className="text-xs tracking-[0.12em] text-text-muted font-medium">TRUSTED CONTEXT</span>
          <h2 className="text-[clamp(32px,4vw,56px)] font-bold tracking-[-0.03em] leading-[1.1] mt-4">
            Your ideas, definitions, and goals — remembered.
          </h2>
          <p className="text-base text-text-secondary leading-relaxed mt-4">
            Define your projects and preferences once. Athena uses them to give you answers
            that are personalized, consistent, and actually useful — not generic responses.
          </p>
        </div>

        <div className="bg-bg-surface border border-border rounded-xl p-6 font-mono">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="fas fa-thumbtack text-sm text-accent-teal" />
              <span className="text-sm text-text-primary">Memory: Newsletter Strategy</span>
            </div>
            <span className="text-[11px] font-semibold text-verified-green bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] rounded px-2 py-0.5">
              <i className="fa-solid fa-check mr-0.5" /> Saved
            </span>
          </div>
          <div className="h-px bg-border my-3" />
          <div className="space-y-1 text-sm text-text-secondary">
            <p>1 &quot;My newsletter is about indie hacking.</p>
            <p>2 &nbsp;Audience: early-stage founders.</p>
            <p>3 &nbsp;Goal: 10,000 subscribers by Q4.</p>
            <p>4 &nbsp;Tone: conversational, direct.&quot;</p>
          </div>
          <div className="h-px bg-border my-3" />
          <p className="text-sm text-text-primary/80 mb-3">&quot;How should I grow my newsletter?&quot;</p>
          <div className="h-px bg-border my-3" />
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-accent-purple">Athena:</span>
            <span className="text-[11px] font-semibold text-verified-green bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] rounded px-2 py-0.5 flex items-center gap-0.5">
              <i className="fa-solid fa-check" /> Verified
            </span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            Based on your Q4 goal of 10K subs and your indie hacking audience, I&apos;d focus on...
          </p>
        </div>
      </div>
    </section>
  );
}
