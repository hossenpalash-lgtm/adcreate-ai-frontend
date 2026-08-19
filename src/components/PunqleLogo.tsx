import { useId } from "react";

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
  const maskId = useId();
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
      {/* Crescent moon as a mask (currentColor rect punched by a black
          circle) rather than the more common two-arc "D" path — that
          construction has its endpoints exactly diametrically opposite,
          a degenerate case that silently rendered as nothing when
          rasterizing the app-icon PNGs with sharp/librsvg. The mask
          approach is unambiguous and doesn't need a hardcoded background
          color to "bite" against, so it also works if this logo is ever
          placed on something other than the dark gradient badge. */}
      <mask id={maskId}>
        <circle cx="12" cy="4.6" r="2.3" fill="white" />
        <circle cx="13" cy="3.9" r="1.9" fill="black" />
      </mask>
      <rect x="8.5" y="1.1" width="7" height="7" fill="currentColor" mask={`url(#${maskId})`} />
    </svg>
  );
}
