// Punqle's brand mark: an open book with a crescent moon resting atop the
// spine — chosen after evaluating several directions (a crossed-petal
// "shapla" bloom, the Jatiyo Sriti Shoudho monument, a kite) against real
// reverse-image searches. The book/moon combination came back without a
// close visual match, unlike the crossed-petal mark (too similar to
// Ladybird's logo) or a plain open book alone (read as a generic
// triangle/delta icon in searches — the moon accent is what makes this
// silhouette distinct).
//
// Drop-in replacement for lucide's Sparkles icon wherever it was standing
// in for the actual logo (not the decorative/thematic Sparkles uses
// elsewhere in the app, which stay as-is) — same className-driven sizing
// convention as every lucide icon.
export function PunqleLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 8 Q8.5 10.5 5.5 16.5 L12 13.5 L18.5 16.5 Q15.5 10.5 12 8 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <line x1="12" y1="8" x2="12" y2="13.5" stroke="currentColor" strokeWidth="1" />
      <path
        d="M12 3 A2 2 0 1 1 12 7 A1.3 1.3 0 1 0 12 3 Z"
        fill="currentColor"
      />
    </svg>
  );
}
