import { AlertCircle, ArrowLeft, Facebook, Globe, Instagram, Linkedin, Sparkles } from "lucide-react";
import type { Platform } from "@/lib/social-wizard";
import { PLATFORM_OPTIONS, VERSION_COUNTS } from "@/lib/social-wizard";

const PLATFORM_ICONS: Record<Platform, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  linkedin: Linkedin,
  other: Globe,
};

// Step 4 — platform instead of raw aspect ratios/pixel dimensions
// (mapping lives in lib/social-wizard.ts, reusing the existing
// square/feed/story AspectRatio values). Also holds the 1/3/5-versions
// picker — each version is a real 1-credit image generation
// (/ads/generate + /ads/generate-image-variant), so the real cost is
// stated plainly rather than hidden behind a "generate" button.
export function PlatformStep({
  platform,
  onPlatformChange,
  versions,
  onVersionsChange,
  credits,
  onGenerate,
  onBack,
  error,
}: {
  platform: Platform;
  onPlatformChange: (p: Platform) => void;
  versions: number;
  onVersionsChange: (n: number) => void;
  credits: number | null;
  onGenerate: () => void;
  onBack: () => void;
  error: string | null;
}) {
  const insufficientCredits = credits !== null && credits < versions;

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="font-display mb-2 text-xl font-extrabold text-foreground">Where will this post go?</h1>
      <p className="mb-6 text-sm text-muted-foreground">Punqle picks the right shape automatically.</p>

      <div className="mb-6 grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
        {PLATFORM_OPTIONS.map((opt) => {
          const Icon = PLATFORM_ICONS[opt.id];
          const isSelected = platform === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onPlatformChange(opt.id)}
              className={[
                "flex flex-col items-center gap-1.5 rounded-2xl border p-3.5 text-center",
                isSelected ? "border-primary bg-primary/5" : "border-border bg-card",
              ].join(" ")}
              style={!isSelected ? { boxShadow: "var(--shadow-card)" } : undefined}
            >
              <Icon className="h-5 w-5 text-foreground" />
              <span className="text-xs font-semibold text-foreground">{opt.label}</span>
              <span className="text-[10px] text-muted-foreground">{opt.hint}</span>
            </button>
          );
        })}
      </div>

      <label className="mb-2 block w-full text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        How many versions?
      </label>
      <div className="mb-2 flex w-full gap-2">
        {VERSION_COUNTS.map((n) => (
          <button
            key={n}
            onClick={() => onVersionsChange(n)}
            className={[
              "flex-1 rounded-full px-3 py-2.5 text-sm font-semibold",
              versions === n ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
            ].join(" ")}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="mb-6 text-xs text-muted-foreground">
        {versions} version{versions > 1 ? "s" : ""} = {versions} credit{versions > 1 ? "s" : ""}. Choosing between a
        few options beats accepting the first result.
      </p>

      {insufficientCredits && (
        <div className="mb-4 w-full rounded-2xl border border-dashed border-accent/40 bg-accent/5 p-4 text-sm text-foreground">
          You have {credits} credit{credits === 1 ? "" : "s"} left — not enough for {versions} versions. Pick fewer
          versions or upgrade to keep generating.
        </div>
      )}

      {error && (
        <p className="mb-4 flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex w-full gap-2">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 rounded-full bg-secondary px-5 py-4 text-sm font-semibold text-secondary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={onGenerate}
          disabled={insufficientCredits}
          className="flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-4 text-base font-semibold text-primary-foreground disabled:opacity-60"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Sparkles className="h-5 w-5" />
          Generate {versions} version{versions > 1 ? "s" : ""}
        </button>
      </div>
    </div>
  );
}
