const rows = [
  ["Notion", "Obsidian", "Slack", "VS Code", "Chrome"],
  ["Google Docs", "Linear", "GitHub", "Figma", "Raycast"],
  ["Zapier", "Make", "n8n", "Airtable", "Retool"],
  ["iOS", "Android", "Mac", "Windows", "Web"],
  ["OpenAI", "Anthropic", "Groq", "ElevenLabs", "Deepgram"],
];

export default function IntegrationMarquee() {
  return (
    <section className="py-[120px] text-center">
      <div className="max-w-container mx-auto px-6 mb-12">
        <h2 className="text-[clamp(32px,4vw,56px)] font-bold tracking-[-0.03em]">
          Works inside your favorite tools
        </h2>
        <p className="text-base text-text-secondary mt-4 max-w-lg mx-auto">
          Connect Athena to your notes, calendars, docs, and code — or use the standalone app.
        </p>
      </div>

      <div className="space-y-6">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex gap-12 ${i % 2 === 0 ? "animate-scroll-left" : "animate-scroll-right"}`}
            style={{ width: "max-content" }}
          >
            {[...row, ...row].map((name, j) => (
              <span
                key={j}
                className="text-text-secondary/45 text-base font-semibold whitespace-nowrap h-10 leading-10"
              >
                {name}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-12">
        <a href="#" className="text-accent-purple text-sm font-medium hover:underline">
          See all integrations →
        </a>
      </div>
    </section>
  );
}
