// Punqle's brand mark: an open book — chosen after evaluating several
// directions (a crossed-petal "shapla" bloom, the Jatiyo Sriti Shoudho
// monument, a kite, a book+moon combination) against real reverse-image
// searches. Explicitly plain by request — an earlier version paired this
// with a crescent moon accent specifically because the plain book alone
// matched generic triangle/tent/gemstone icons in reverse-image search
// rather than reading as a book; that tradeoff was seen and accepted.
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
    </svg>
  );
}
