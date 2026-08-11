export function TribalMotif({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 220" aria-hidden="true" className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 142c22-34 56-58 104-74 20-7 42-10 68-10" />
        <path d="M31 166c28-14 56-22 86-24 28-2 53 1 78 10" />
        <path d="M64 104c10-14 21-24 34-31 13-8 28-13 46-16" />
        <path d="M84 92c9 8 18 12 28 12 11 0 22-4 34-12" />
        <path d="M92 56c8 8 16 12 24 12s16-4 24-12" />
        <circle cx="117" cy="118" r="10" />
        <circle cx="56" cy="140" r="6" />
        <circle cx="177" cy="147" r="6" />
      </g>
    </svg>
  );
}
