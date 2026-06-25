const testimonials = [
  {
    quote: "We tried ChatGPT, Perplexity and others, but the voice-first flow of Athena is completely unmatched.",
    name: "Alex Kim",
    title: "Founder · BuildFast",
  },
  {
    quote: "Before Athena, I'd lose ideas mid-meeting. Now I just talk and everything gets captured instantly.",
    name: "Priya Shah",
    title: "Product Lead · Launchday",
  },
];

export default function Testimonials() {
  return (
    <section className="py-[120px]">
      <div className="max-w-container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="bg-bg-surface border border-border rounded-xl p-8 card-hover transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center mb-4">
              <span className="text-sm font-bold text-accent-purple">
                {t.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </div>
            <p className="text-base text-text-secondary leading-relaxed italic">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-6">
              <p className="text-sm font-semibold text-white">{t.name}</p>
              <p className="text-[13px] text-text-muted">{t.title}</p>
            </div>
            <a
              href="#"
              className="inline-block mt-4 text-[13px] font-medium text-accent-purple hover:underline"
            >
              Read case study →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
