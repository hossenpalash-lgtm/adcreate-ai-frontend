import { ArrowLeft, ArrowRight, Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { searchStockPhotos } from "@/lib/api";
import type { ApiStockPhotoResult, VisualDirection } from "@/lib/api";
import {
  MORE_VISUAL_DIRECTIONS,
  NEUTRAL_FALLBACK_QUERY,
  VISUAL_DIRECTIONS,
  type VisualDirectionOption,
} from "@/lib/social-wizard";

// Real mini social-creative previews, semantically grounded in the
// user's own idea — not a per-style keyword search. `visualSubject`/
// `offer` come from the REAL GPT-derived understanding of the idea
// (/ads/understand-idea, see _understand_idea in main.py) — genuine
// subject/entity extraction, not a client-side regex guess, and
// deliberately empty when the idea states no concrete subject rather
// than inventing one. Whatever subject exists is searched ONCE
// (/ads/stock-photos, the existing free Pexels proxy) for the whole
// idea, then every style card picks a different photo from that SAME
// result pool. One shared search — not one search per style — is what
// guarantees all the cards stay about the same underlying concept; only
// which photo (and which CSS style treatment) differs. Style keywords
// are never part of the search query at all, so they can't out-rank or
// replace the real subject the way a per-style "subject + mood" query
// used to. Deliberately NOT a live Gemini regeneration — that would
// mean extra PAID image-generation calls (and a 30-45s wait) every time
// anyone reaches this step, including everyone who never finishes
// generating. Each style's `fallbackImage` (a real, already-generated
// Punqle post) covers the loading moment and any search that comes up
// empty — never an empty box, never a fabricated result.
const ALL_DIRECTIONS = [...VISUAL_DIRECTIONS, ...MORE_VISUAL_DIRECTIONS];

// Pexels has no relevance/caption metadata we can score candidates
// against (the proxy only returns id/thumbnail/full url/photographer —
// see /ads/stock-photos in main.py), so a true per-candidate semantic
// score isn't something this stack can honestly compute without adding
// a new paid call. The real lever for relevance is upstream: getting a
// verified, non-hallucinated subject INTO the query (see
// visualSubject above) rather than trying to re-rank results after the
// fact with no signal to rank by.
async function fetchPoolWithFallback(subject: string, contentType: string): Promise<ApiStockPhotoResult[]> {
  const primaryQuery = subject || NEUTRAL_FALLBACK_QUERY;
  const primary = await searchStockPhotos(primaryQuery).catch(() => ({ results: [] }));
  if (primary.results.length > 0) return primary.results;
  // Broader-category retry — e.g. a subject too narrow/rare for Pexels
  // to have direct matches for falls back to its first significant word,
  // or the post's content type, before giving up to the static
  // per-style fallback images entirely.
  const broadTerm = subject.split(" ")[0] || contentType;
  if (broadTerm && broadTerm.toLowerCase() !== primaryQuery.toLowerCase()) {
    const broader = await searchStockPhotos(broadTerm).catch(() => ({ results: [] }));
    if (broader.results.length > 0) return broader.results;
  }
  return [];
}

function pickFromPool(pool: ApiStockPhotoResult[], opt: VisualDirectionOption): string | undefined {
  if (pool.length === 0) return undefined;
  const idx = ALL_DIRECTIONS.findIndex((d) => d.id === opt.id);
  const spread = Math.floor((idx / ALL_DIRECTIONS.length) * pool.length);
  return pool[Math.min(spread, pool.length - 1)]?.thumbnail_url;
}

// Turns the shared photo into a genuine mini social-creative per style —
// a headline + style-specific typography/scrim/composition layered on
// top via plain CSS, not a second round of AI generation or per-style
// stock search (that's exactly the drift bug the search-pooling fix
// solved). Deterministic and free: same photo pool feeds every style,
// only the overlay treatment differs, so the cards read as "design
// variations of one concept" rather than five unrelated images.
const STYLE_TREATMENTS: Record<string, { imgFilter?: string; overlay: (headline: string) => ReactNode }> = {
  clean_premium: {
    overlay: (headline) => (
      <>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <p className="absolute inset-x-1.5 bottom-1.5 line-clamp-2 text-[6.5px] font-semibold uppercase leading-tight tracking-[0.12em] text-white/95">
          {headline}
        </p>
      </>
    ),
  },
  bold_energetic: {
    imgFilter: "contrast(1.25) saturate(1.2)",
    overlay: (headline) => (
      <>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        <div className="absolute inset-x-1.5 bottom-1.5">
          <div className="mb-0.5 h-[2px] w-4 bg-accent" />
          <p className="line-clamp-2 text-[7.5px] font-extrabold uppercase leading-[8px] tracking-tight text-white">
            {headline}
          </p>
        </div>
      </>
    ),
  },
  warm_lifestyle: {
    imgFilter: "sepia(0.25) saturate(1.15)",
    overlay: (headline) => (
      <>
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#3a2412]/70 to-transparent" />
        <p className="absolute inset-x-1.5 bottom-1.5 line-clamp-2 text-[6.5px] font-medium leading-tight text-[#fdf3e7]">
          {headline}
        </p>
      </>
    ),
  },
  minimal_editorial: {
    overlay: (headline) => (
      <div className="absolute bottom-1.5 left-1.5 rounded-sm bg-white/90 px-1 py-0.5">
        <p className="line-clamp-1 text-[6px] font-medium uppercase tracking-[0.15em] text-black/80">{headline}</p>
      </div>
    ),
  },
  vibrant_playful: {
    imgFilter: "saturate(1.5) contrast(1.05) brightness(1.05)",
    overlay: (headline) => (
      <>
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute left-1.5 top-1.5 rounded-full bg-accent px-1.5 py-0.5">
          <p className="text-[6px] font-bold uppercase text-accent-foreground">New</p>
        </div>
        <p className="absolute inset-x-1.5 bottom-1.5 line-clamp-2 text-[7px] font-bold leading-tight text-white">
          {headline}
        </p>
      </>
    ),
  },
};

function StylePreview({
  opt,
  previewUrl,
  loading,
  headline,
}: {
  opt: VisualDirectionOption;
  previewUrl: string | undefined;
  loading: boolean;
  headline: string;
}) {
  const src = previewUrl ?? opt.fallbackImage;
  const treatment = STYLE_TREATMENTS[opt.id] ?? STYLE_TREATMENTS.clean_premium;
  return (
    <div className="relative h-full w-full">
      <img
        src={src}
        alt=""
        className="h-full w-full object-cover"
        style={treatment.imgFilter ? { filter: treatment.imgFilter } : undefined}
        loading="lazy"
      />
      {/* The mini-creative overlay only appears once a genuine,
          idea-relevant photo has loaded — showing a headline over the
          unrelated static fallback would read as broken, not loading. */}
      {previewUrl && treatment.overlay(headline)}
      {loading && !previewUrl && <div className="absolute inset-0 animate-pulse bg-black/10" />}
    </div>
  );
}

// Step 2 — 3 AI-recommended style directions instead of browsing a huge
// template library. "Recommended" is whichever direction the Understanding
// step derived from the user's idea; "Show more styles" reveals 2 more for
// users who want a different look than the recommendation.
export function VisualDirectionStep({
  visualSubject,
  offer,
  contentType,
  recommended,
  selected,
  onSelect,
  onContinue,
  onBack,
}: {
  // Real GPT-derived fields from /ads/understand-idea — visualSubject and
  // offer are "" when the idea genuinely doesn't state one, never guessed.
  visualSubject: string;
  offer: string;
  contentType: string;
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
  const lastFetchedKeyRef = useRef<string | null>(null);

  const options = showMore ? ALL_DIRECTIONS : VISUAL_DIRECTIONS;
  // The offer ("20% OFF") is the punchiest headline when present, then
  // the real subject, then content_type — always GPT-derived, never
  // guessed, and always non-empty (content_type itself always has a
  // safe default — see _understand_idea).
  const headline = (offer || visualSubject || contentType).toUpperCase();

  // One search per idea, covering every style (including the 2 behind
  // "Show more") — a fresh generation id invalidates any still-in-flight
  // search from a previous idea so a slow response can't overwrite a
  // newer one. Keyed on visualSubject (not the raw idea text) since
  // that's what actually determines the query now.
  useEffect(() => {
    const key = visualSubject;
    if (lastFetchedKeyRef.current === key) return;
    lastFetchedKeyRef.current = key;
    const generation = ++generationRef.current;
    setPool([]);
    setLoading(true);
    fetchPoolWithFallback(visualSubject, contentType)
      .then((results) => {
        if (generationRef.current !== generation) return;
        setPool(results);
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug("[Step 2 preview]", {
            visualSubject,
            offer,
            contentType,
            searchQuery: visualSubject || NEUTRAL_FALLBACK_QUERY,
            resultCount: results.length,
            recommended,
          });
        }
      })
      .finally(() => {
        if (generationRef.current !== generation) return;
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualSubject]);

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
                <StylePreview opt={opt} previewUrl={pickFromPool(pool, opt)} loading={loading} headline={headline} />
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
