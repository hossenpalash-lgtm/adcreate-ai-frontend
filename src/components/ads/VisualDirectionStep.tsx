import { ArrowLeft, ArrowRight, Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { searchStockPhotos } from "@/lib/api";
import type { VisualDirection } from "@/lib/api";
import {
  extractPreviewSubject,
  MORE_VISUAL_DIRECTIONS,
  VISUAL_DIRECTIONS,
  type VisualDirectionOption,
} from "@/lib/social-wizard";

// Real mini social-creative previews, adapted to the user's own idea —
// searches the existing free Pexels stock-photo proxy (/ads/stock-photos,
// already used elsewhere in this app for the "stock photo" upload
// option) with the idea's subject plus a short style-mood phrase, e.g.
// "coffee beans minimal product photography" for Clean & Premium.
// Deliberately NOT a live Gemini regeneration — that would mean 3 extra
// PAID image-generation calls (and a 30-45s wait) every time anyone
// reaches this step, including everyone who never finishes generating.
// A real, idea-relevant stock photo is the honest, free, fast middle
// ground: genuinely about the user's product where Pexels has a good
// match, and each style's `fallbackImage` (a real, already-generated
// Punqle post) covers the loading moment and any search that comes up
// empty — never an empty box, never a fabricated result.
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
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const generationRef = useRef(0);
  const fetchedIdsRef = useRef<Set<string>>(new Set());
  // Guards against firing the same 3 searches twice for an unchanged
  // idea — React can legitimately re-run an effect without its
  // dependency actually changing (e.g. dev-mode double-invoke), and
  // since the searches are real (if free) network calls, this keeps it
  // to exactly one request per style per idea regardless.
  const lastFetchedIdeaRef = useRef<string | null>(null);

  const options = showMore ? [...VISUAL_DIRECTIONS, ...MORE_VISUAL_DIRECTIONS] : VISUAL_DIRECTIONS;

  const fetchPreview = (opt: VisualDirectionOption, subject: string, generation: number) => {
    if (fetchedIdsRef.current.has(opt.id)) return;
    fetchedIdsRef.current.add(opt.id);
    setLoadingIds((prev) => new Set(prev).add(opt.id));
    searchStockPhotos(`${subject} ${opt.previewSearchSuffix}`)
      .then((r) => {
        if (generationRef.current !== generation) return;
        const first = r.results[0];
        if (first) setPreviewUrls((prev) => ({ ...prev, [opt.id]: first.thumbnail_url }));
      })
      .catch(() => {})
      .finally(() => {
        if (generationRef.current !== generation) return;
        setLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(opt.id);
          return next;
        });
      });
  };

  // Re-searches whenever the idea itself changes (e.g. the user goes back
  // and edits it) — a fresh generation id invalidates any still-in-flight
  // searches from the previous idea so a slow response can't overwrite a
  // newer one.
  useEffect(() => {
    if (lastFetchedIdeaRef.current === ideaText) return;
    lastFetchedIdeaRef.current = ideaText;
    const generation = ++generationRef.current;
    fetchedIdsRef.current = new Set();
    setPreviewUrls({});
    setLoadingIds(new Set());
    const subject = extractPreviewSubject(ideaText);
    VISUAL_DIRECTIONS.forEach((opt) => fetchPreview(opt, subject, generation));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaText]);

  // The 2 "more styles" only search once actually revealed.
  useEffect(() => {
    if (!showMore) return;
    const subject = extractPreviewSubject(ideaText);
    MORE_VISUAL_DIRECTIONS.forEach((opt) => fetchPreview(opt, subject, generationRef.current));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMore]);

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
                <StylePreview opt={opt} previewUrl={previewUrls[opt.id]} loading={loadingIds.has(opt.id)} />
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
