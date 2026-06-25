const promptsRow1 = [
  { category: "Brainstorm", text: "Give me 10 business ideas for the creator economy" },
  { category: "Research", text: "Summarize the latest trends in AI product design" },
  { category: "Writing", text: "Help me write a cold email subject line that converts" },
  { category: "Planning", text: "Build a 30-day launch plan for my app" },
  { category: "Learning", text: "Explain quantum entanglement like I'm 12" },
  { category: "Strategy", text: "What's a go-to-market strategy for a B2B SaaS?" },
];

const promptsRow2 = [
  { category: "Coaching", text: "What habits do successful founders have in common?" },
  { category: "Creativity", text: "Write a short poem about building in public" },
  { category: "Analysis", text: "Compare the pros and cons of remote-first vs hybrid" },
  { category: "Ideas", text: "What's a unique angle for a productivity newsletter?" },
  { category: "Writing", text: "Draft a LinkedIn post announcing my product launch" },
  { category: "Debate", text: "Steelman the argument for 4-day work weeks" },
];

function PromptCard({ category, text }: { category: string; text: string }) {
  return (
    <div className="bg-bg-surface border border-border rounded-lg px-4 py-3 whitespace-nowrap mx-2 inline-flex items-center gap-3">
      <span className="text-[11px] text-text-muted bg-white/5 border border-border rounded-full px-2.5 py-0.5 font-medium">
        {category}
      </span>
      <span className="text-sm text-text-secondary">{text}</span>
    </div>
  );
}

export default function PromptTicker() {
  return (
    <section className="py-[80px] overflow-hidden">
      <div className="mb-4">
        <div className="flex animate-scroll-left-35" style={{ width: "max-content" }}>
          {[...promptsRow1, ...promptsRow1].map((p, i) => (
            <PromptCard key={i} {...p} />
          ))}
        </div>
      </div>
      <div>
        <div className="flex animate-scroll-right-35" style={{ width: "max-content" }}>
          {[...promptsRow2, ...promptsRow2].map((p, i) => (
            <PromptCard key={i} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
