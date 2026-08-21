import { ArrowLeft, ArrowRight, Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { VisualDirection } from "@/lib/api";
import { MORE_VISUAL_DIRECTIONS, VISUAL_DIRECTIONS } from "@/lib/social-wizard";

// Small abstract "mood" swatches — deliberately illustrative, not a real
// generated photo. There's no single real image per style (the actual
// output depends on the user's own idea), so an abstract composition is
// the honest way to preview a *look* rather than implying a fixed result.
// Pure CSS/inline SVG, zero new assets, zero generation cost.
function StylePreview({ id }: { id: VisualDirection | string }) {
  switch (id) {
    case "clean_premium":
      return (
        <div className="relative h-full w-full" style={{ background: "linear-gradient(135deg, #f6f4f1, #e6e2db)" }}>
          <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/15" />
          <div className="absolute bottom-3 left-3 right-3 h-px bg-black/15" />
        </div>
      );
    case "bold_energetic":
      return (
        <div className="relative h-full w-full overflow-hidden" style={{ background: "#111114" }}>
          <div
            className="absolute -left-4 -top-4 h-16 w-16 rotate-45"
            style={{ background: "var(--color-accent)" }}
          />
        </div>
      );
    case "warm_lifestyle":
      return (
        <div className="relative h-full w-full" style={{ background: "linear-gradient(160deg, #f3ddc4, #e8b98f)" }}>
          <div
            className="absolute bottom-2 right-2 h-10 w-10 rounded-full opacity-60 blur-[2px]"
            style={{ background: "#fff6ea" }}
          />
        </div>
      );
    case "minimal_editorial":
      return (
        <div className="relative h-full w-full bg-[#fafafa]">
          <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/40" />
        </div>
      );
    case "vibrant_playful":
      return (
        <div
          className="h-full w-full"
          style={{ background: "linear-gradient(135deg, #ffb37a, #ff8fa3 55%, #b98bff)" }}
        />
      );
    default:
      return <div className="h-full w-full bg-secondary" />;
  }
}

// Step 2 — 3 AI-recommended style directions instead of browsing a huge
// template library. "Recommended" is whichever direction the Understanding
// step derived from the user's idea; "Show more styles" reveals 2 more for
// users who want a different look than the recommendation.
export function VisualDirectionStep({
  recommended,
  selected,
  onSelect,
  onContinue,
  onBack,
}: {
  recommended: VisualDirection;
  selected: VisualDirection;
  onSelect: (id: VisualDirection) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [showMore, setShowMore] = useState(false);
  const options = showMore ? [...VISUAL_DIRECTIONS, ...MORE_VISUAL_DIRECTIONS] : VISUAL_DIRECTIONS;

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="font-display mb-2 text-xl font-extrabold text-foreground">Choose a visual direction</h1>
      <p className="mb-6 text-sm text-muted-foreground">Punqle picked one that fits your idea best.</p>

      <div className="mb-3 flex w-full flex-col gap-3">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          const isRecommended = recommended === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className={[
                "flex items-center gap-4 rounded-2xl border p-3 text-left transition-colors",
                isSelected ? "border-primary bg-primary/5" : "border-border bg-card",
              ].join(" ")}
              style={!isSelected ? { boxShadow: "var(--shadow-card)" } : undefined}
            >
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <StylePreview id={opt.id} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                  {isRecommended && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-accent-foreground">
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
              <div
                className={[
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input",
                ].join(" ")}
              >
                {isSelected && <Check className="h-3 w-3" />}
              </div>
            </button>
          );
        })}
      </div>

      {!showMore && (
        <button
          onClick={() => setShowMore(true)}
          className="mb-6 flex items-center gap-1 text-xs font-semibold text-muted-foreground"
        >
          Show more styles
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      )}
      {showMore && <div className="mb-3" />}

      <div className="flex w-full gap-2">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 rounded-full bg-secondary px-5 py-4 text-sm font-semibold text-secondary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={onContinue}
          className="flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-4 text-base font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
