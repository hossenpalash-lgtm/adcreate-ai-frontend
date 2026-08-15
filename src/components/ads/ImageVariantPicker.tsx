import { ChevronDown, Eraser, Loader2, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";

// Unlike captions, each extra image costs a real credit (Gemini image
// generation isn't cheap) — the button says so up front rather than
// surprising the user at the credit counter. Remove background and
// Enhance are the same story — each is its own paid Gemini image call
// on the currently selected image, added as a new variant rather than
// replacing it, so the original is never lost.
export function ImageVariantPicker({
  images,
  selectedIndex,
  onSelect,
  onGenerateMore,
  onRemoveBackground,
  onEnhance,
  generating,
  removingBackground = false,
  enhancing = false,
  disabled,
}: {
  images: string[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  onGenerateMore: () => void;
  onRemoveBackground?: () => void;
  onEnhance?: () => void;
  generating: boolean;
  removingBackground?: boolean;
  enhancing?: boolean;
  disabled: boolean;
}) {
  const anyBusy = generating || removingBackground || enhancing;
  const [showMore, setShowMore] = useState(false);
  const hasEditTools = !!(onRemoveBackground || onEnhance);

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
      <div className="flex flex-col gap-2">
        <button
          onClick={onGenerateMore}
          disabled={anyBusy || disabled}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-xs font-semibold text-secondary-foreground disabled:opacity-60"
        >
          {generating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          Generate another image (1 credit)
        </button>
        {hasEditTools && !showMore && (
          <button
            onClick={() => setShowMore(true)}
            className="flex w-full items-center justify-center gap-1 text-xs font-semibold text-muted-foreground"
          >
            More image tools
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        )}
        {hasEditTools && showMore && (
          <div className="flex gap-2">
            {onRemoveBackground && (
              <button
                onClick={onRemoveBackground}
                disabled={anyBusy || disabled}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-secondary px-3 py-2.5 text-xs font-semibold text-secondary-foreground disabled:opacity-60"
              >
                {removingBackground ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Eraser className="h-3.5 w-3.5" />
                )}
                Remove background (1 credit)
              </button>
            )}
            {onEnhance && (
              <button
                onClick={onEnhance}
                disabled={anyBusy || disabled}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-secondary px-3 py-2.5 text-xs font-semibold text-secondary-foreground disabled:opacity-60"
              >
                {enhancing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5" />
                )}
                Enhance (1 credit)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
