import { ChevronDown, Images, Loader2 } from "lucide-react";
import { useState } from "react";
import { zipSync } from "fflate";
import { compositeImage, type BrandKit, type CreativeText, type EditOptions } from "@/lib/canvas-text";

// Free — every image here was already paid for individually when it was
// generated ("Generate another image" costs 1 credit each). This step is
// pure client-side packaging: composite each selected image with the
// current caption (plus whatever Brand Kit / quick-edit styling is
// active, so carousel slides match the main post), zip them, download —
// ready to drag straight into Facebook/Instagram's native carousel post
// creator, since this app doesn't do direct posting (see Meta Business
// Verification blocker).
export function CarouselBuilder({
  images,
  text,
  brandKit,
  editOptions,
  visualDirection,
}: {
  images: string[];
  text: CreativeText;
  brandKit?: BrandKit;
  editOptions?: EditOptions;
  visualDirection?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const handleDownload = async () => {
    if (selected.size < 2 || building) return;
    setBuilding(true);
    setError(null);
    try {
      const indices = Array.from(selected).sort((a, b) => a - b);
      const files: Record<string, Uint8Array> = {};
      for (let slot = 0; slot < indices.length; slot++) {
        const dataUrl = await compositeImage(images[indices[slot]], text, brandKit, editOptions, visualDirection);
        const base64 = dataUrl.split(",")[1];
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        files[`slide-${slot + 1}.jpg`] = bytes;
      }
      const zipped = zipSync(files);
      const blob = new Blob([zipped], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "carousel.zip";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Couldn't build the carousel. Please try again.");
    } finally {
      setBuilding(false);
    }
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="mb-4 flex w-full items-center justify-center gap-1 text-xs font-semibold text-muted-foreground"
      >
        Build a carousel (multiple images)
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div className="mb-4 rounded-2xl bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Select 2 or more images for the carousel
      </p>
      {images.length < 2 ? (
        <p className="mb-1 text-sm text-muted-foreground">
          Generate at least one more image above first — a carousel needs multiple slides.
        </p>
      ) : (
        <>
          <div className="mb-3 flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={[
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2",
                  selected.has(i) ? "border-primary" : "border-transparent",
                ].join(" ")}
              >
                <img
                  src={`data:image/png;base64,${img}`}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {selected.has(i) && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {Array.from(selected).sort((a, b) => a - b).indexOf(i) + 1}
                  </span>
                )}
              </button>
            ))}
          </div>
          {error && <p className="mb-2 text-xs font-medium text-destructive">{error}</p>}
          <button
            onClick={handleDownload}
            disabled={selected.size < 2 || building}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary px-4 py-2.5 text-xs font-semibold text-secondary-foreground disabled:opacity-60"
          >
            {building ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Images className="h-3.5 w-3.5" />
            )}
            Download carousel ({selected.size} selected)
          </button>
        </>
      )}
    </div>
  );
}
