const STAGES = ["What do you want?", "Choose a look", "Set it up", "Generate"];

// A calm 4-stage indicator shown across the pre-generation steps. Doesn't
// restructure SinglePostForm's own step machine (idea/understanding/
// direction/source/platform/generating/result) — the caller maps its real
// step onto one of these 4 display stages, so this is purely additive UI.
export function WizardProgress({ currentStage }: { currentStage: 1 | 2 | 3 | 4 }) {
  return (
    <div className="mb-6 flex items-center justify-center gap-1.5">
      {STAGES.map((label, i) => {
        const stage = i + 1;
        const done = stage < currentStage;
        const active = stage === currentStage;
        return (
          <div key={label} className="flex items-center gap-1.5">
            <div
              className={[
                "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                done || active ? "text-white" : "bg-secondary text-muted-foreground",
              ].join(" ")}
              style={done || active ? { background: "var(--color-accent)" } : undefined}
              aria-current={active ? "step" : undefined}
              title={label}
            >
              {stage}
            </div>
            {stage < STAGES.length && (
              <div className={["h-px w-4 sm:w-6", done ? "bg-[var(--color-accent)]" : "bg-border"].join(" ")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
