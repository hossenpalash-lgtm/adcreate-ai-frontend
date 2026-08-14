import type { ApiAdCaptionVariant } from "@/lib/api";

export function CaptionPicker({
  captions,
  selectedIndex,
  onSelect,
}: {
  captions: ApiAdCaptionVariant[];
  selectedIndex: number;
  onSelect: (i: number) => void;
}) {
  if (captions.length <= 1) return null;
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Choose a caption
      </p>
      <div className="flex flex-col gap-2">
        {captions.map((c, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={[
              "rounded-xl border p-3 text-left text-sm transition-colors",
              i === selectedIndex
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-card text-muted-foreground",
            ].join(" ")}
          >
            {c.facebook_caption}
          </button>
        ))}
      </div>
    </div>
  );
}
