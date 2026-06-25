export default function Orb({ size = 300, className = "" }: { size?: number; className?: string }) {
  const center = size / 2;
  const radii = [size * 0.45, size * 0.35, size * 0.25, size * 0.15, size * 0.07];

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <div className="absolute inset-0 orb-glow" />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="animate-orb-pulse">
        <defs>
          <radialGradient id="orb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7c5af0" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#7c5af0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={center} cy={center} r={center * 0.5} fill="url(#orb-glow)" />
        {radii.map((r, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={i % 2 === 0 ? "#7c5af0" : "#00d4aa"}
            strokeWidth={0.5 + (radii.length - i) * 0.2}
            opacity={0.6 - i * 0.1}
          />
        ))}
        <circle cx={center} cy={center} r={radii[radii.length - 1]} fill="#7c5af0" opacity={0.8} />
      </svg>
    </div>
  );
}
