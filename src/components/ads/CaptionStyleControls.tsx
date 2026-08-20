import { Loader2, RefreshCw } from "lucide-react";
import type { CaptionLength, CaptionTone } from "@/lib/api";

const TONES: { value: CaptionTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "bold", label: "Bold" },
  { value: "playful", label: "Playful" },
  { value: "luxury", label: "Luxury" },
];

const LENGTHS: { value: CaptionLength; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "medium", label: "Medium" },
  { value: "long", label: "Long" },
];

// Tone/length controls for the Post Kit's caption section, backed by the
// new free /ads/generate-captions endpoint (see lib/api.ts) — kept
// separate from the paid /ads/generate call so regenerating captions
// never spends a credit or touches the already-generated image.
export function CaptionStyleControls({
  tone,
  onToneChange,
  length,
  onLengthChange,
  onGenerateAnother,
  generating,
}: {
  tone: CaptionTone;
  onToneChange: (t: CaptionTone) => void;
  length: CaptionLength;
  onLengthChange: (l: CaptionLength) => void;
  onGenerateAnother: () => void;
  generating: boolean;
}) {
  return (
    <div className="mb-4">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tone</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {TONES.map((t) => (
          <button
            key={t.value}
            onClick={() => onToneChange(t.value)}
            className={[
              "rounded-full px-3 py-1.5 text-xs font-semibold",
              tone === t.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Length</p>
      <div className="mb-3 flex gap-1.5">
        {LENGTHS.map((l) => (
          <button
            key={l.value}
            onClick={() => onLengthChange(l.value)}
            className={[
              "flex-1 rounded-full px-3 py-1.5 text-xs font-semibold",
              length === l.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground",
            ].join(" ")}
          >
            {l.label}
          </button>
        ))}
      </div>

      <button
        onClick={onGenerateAnother}
        disabled={generating}
        className="flex w-full items-center justify-center gap-1.5 rounded-full bg-secondary px-4 py-2.5 text-xs font-semibold text-secondary-foreground disabled:opacity-60"
      >
        {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        Generate another
      </button>
    </div>
  );
}
