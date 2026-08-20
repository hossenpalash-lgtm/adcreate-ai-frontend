import { Check, Loader2 } from "lucide-react";

const STAGES = [
  "Understanding your idea",
  "Choosing the visual direction",
  "Applying your brand",
  "Writing the post copy",
  "Designing your creative",
  "Finalizing your post",
];

// A real, honest staged progress checklist — `currentStage` is driven by
// which awaited API call is actually in flight (see SinglePostForm.tsx's
// handleGenerate), not a fake timer. Each row only ticks once its real
// step has actually resolved. Subtle fade/slide only, no bounce/particles,
// per the "intelligence and simplicity, not excessive animation" brief.
export function GenerationProgress({ currentStage }: { currentStage: number }) {
  return (
    <div className="flex flex-col items-center px-2 py-8">
      <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <div className="flex w-full max-w-xs flex-col gap-3.5">
        {STAGES.map((stage, i) => {
          const done = i < currentStage;
          const active = i === currentStage;
          return (
            <div
              key={stage}
              className="animate-fade-rise flex items-center gap-3 transition-opacity duration-300"
              style={{ animationDelay: `${i * 40}ms`, opacity: done || active ? 1 : 0.4 }}
            >
              <div
                className={[
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground",
                ].join(" ")}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              </div>
              <span
                className={["text-sm", done || active ? "font-semibold text-foreground" : "text-muted-foreground"].join(" ")}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
