export default function AnnouncementBanner() {
  return (
    <div className="flex justify-center pt-8">
      <a
        href="#"
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm bg-[rgba(124,90,240,0.1)] border border-[rgba(124,90,240,0.3)] text-text-secondary hover:text-white transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-dot-pulse" />
          <span className="text-accent-purple font-semibold text-[13px]">New</span>
        </span>
        Athena now supports real-time voice interruption →
      </a>
    </div>
  );
}
