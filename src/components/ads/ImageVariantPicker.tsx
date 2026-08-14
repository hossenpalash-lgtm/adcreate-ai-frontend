import { Loader2, Sparkles } from "lucide-react";

// Unlike captions, each extra image costs a real credit (Gemini image
// generation isn't cheap) — the button says so up front rather than
// surprising the user at the credit counter.
export function ImageVariantPicker({
  images,
  selectedIndex,
  onSelect,
  onGenerateMore,
  generating,
  disabled,
}: {
  images: string[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  onGenerateMore: () => void;
  generating: boolean;
  disabled: boolean;
}) {
  return (
    <div className="mb-4">
      {images.length > 1 && (
        <div className="mb-2 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              className={[
                "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2",
                i === selectedIndex ? "border-primary" : "border-transparent",
              ].join(" ")}
            >
              <img
                src={`data:image/png;base64,${img}`}
                alt=""
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      <button
        onClick={onGenerateMore}
        disabled={generating || disabled}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-xs font-semibold text-secondary-foreground disabled:opacity-60"
      >
        {generating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        Generate another image (1 credit)
      </button>
    </div>
  );
}
