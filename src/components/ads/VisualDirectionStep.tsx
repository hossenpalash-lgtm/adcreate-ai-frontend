import { ArrowLeft, ArrowRight, Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { searchStockPhotos } from "@/lib/api";
import type { ApiStockPhotoResult, VisualDirection } from "@/lib/api";
import {
  extractPreviewSubject,
  MORE_VISUAL_DIRECTIONS,
  VISUAL_DIRECTIONS,
  type VisualDirectionOption,
} from "@/lib/social-wizard";

// Real mini social-creative previews, adapted to the user's own idea —
// searches the existing free Pexels stock-photo proxy (/ads/stock-photos,
// already used elsewhere in this app for the "stock photo" upload
// option) ONCE per idea, for the idea's subject alone (e.g. "coffee
// beans"), then every style card picks a different photo from that SAME
// result pool. One shared search — not one search per style — is what
// guarantees all the cards stay about the same underlying concept; only
// which photo differs. Deliberately NOT a live Gemini regeneration —
// that would mean extra PAID image-generation calls (and a 30-45s wait)
// every time anyone reaches this step, including everyone who never
// finishes generating. Each style's `fallbackImage` (a real,
// already-generated Punqle post) covers the loading moment and any
// search that comes up empty — never an empty box, never a fabricated
// result.
const ALL_DIRECTIONS = [...VISUAL_DIRECTIONS, ...MORE_VISUAL_DIRECTIONS];

function pickFromPool(pool: ApiStockPhotoResult[], opt: VisualDirectionOption): string | undefined {
  if (pool.length === 0) return undefined;
  const idx = ALL_DIRECTIONS.findIndex((d) => d.id === opt.id);
  const spread = Math.floor((idx / ALL_DIRECTIONS.length) * pool.length);
  return pool[Math.min(spread, pool.length - 1)]?.thumbnail_url;
}

function StylePreview({
  opt,
  previewUrl,
  loading,
}: {
  opt: VisualDirectionOption;
  previewUrl: string | undefined;
  loading: boolean;
}) {
  const src = previewUrl ?? opt.fallbackImage;
  return (
    <div className="relative h-full w-full">
      <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
      {loading && !previewUrl && (
        <div className="absolute inset-0 animate-pulse bg-black/10" />
      )}
    </div>
  );
}

// Step 2 — 3 AI-recommended style directions instead of browsing a huge
// template library. "Recommended" is whichever direction the Understanding
// step derived from the user's idea; "Show more styles" reveals 2 more for
// users who want a different look than the recommendation.
export function VisualDirectionStep({
  ideaText,
  recommended,
  selected,
  onSelect,
  onContinue,
  onBack,
}: {
  ideaText: string;
  recommended: VisualDirection;
  selected: VisualDirection;
  onSelect: (id: VisualDirection) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [showMore, setShowMore] = useState(false);
  const [pool, setPool] = useState<ApiStockPhotoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const generationRef = useRef(0);
  // Guards against firing the same search twice for an unchanged idea —
  // React can legitimately re-run an effect without its dependency
  // actually changing (e.g. dev-mode double-invoke), and since the
  // search is real (if free) network call, this keeps it to exactly one
  // request per idea regardless.
  const lastFetchedIdeaRef = useRef<string | null>(null);

  const options = showMore ? ALL_DIRECTIONS : VISUAL_DIRECTIONS;

  // One search per idea, covering every style (including the 2 behind
  // "Show more") — a fresh generation id invalidates any still-in-flight
  // search from a previous idea so a slow response can't overwrite a
  // newer one.
  useEffect(() => {
    if (lastFetchedIdeaRef.current === ideaText) return;
    lastFetchedIdeaRef.current = ideaText;
    const generation = ++generationRef.current;
    setPool([]);
    setLoading(true);
    const subject = extractPreviewSubject(ideaText);
    searchStockPhotos(subject)
      .then((r) => {
        if (generationRef.current !== generation) return;
        setPool(r.results);
      })
      .catch(() => {})
      .finally(() => {
        if (generationRef.current !== generation) return;
        setLoading(false);
      });
  }, [ideaText]);

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="font-display mb-2 text-xl font-extrabold text-foreground">Choose a look</h1>
      <p className="mb-6 text-sm text-muted-foreground">Punqle picked a style that fits your idea best.</p>

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
              <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl">
                <StylePreview opt={opt} previewUrl={pickFromPool(pool, opt)} loading={loading} />
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
