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
// which photo (and which mini-layout, see STYLE_PREVIEWS below) differs.
// Style keywords are never part of the search query at all, so they
// can't out-rank or replace the real subject the way a per-style
// "subject + mood" query used to. Deliberately NOT a live Gemini
// regeneration — that would mean extra PAID image-generation calls (and
// a 30-45s wait) every time anyone reaches this step, including everyone
// who never finishes generating. When there's no real subject, every
// style falls back to its own flat CSS gradient rather than a photo —
// never an empty box, never a random stock object standing in for a
// subject that was never stated.
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

// Every field a preview can show is REAL, GPT-derived data — never
// invented filler like a fake "30% OFF" or "Limited time only" that
// wasn't in the user's idea. `tier1` (the big poster headline) is the
// real subject when one exists, else the real content type; `tier2` (a
// smaller line) is the real content type when it adds something tier1
// doesn't already say; `badge` is the real offer/CTA phrase when one was
// actually stated. A genuinely generic idea ends up with just tier1 —
// that's correct, not a bug: there's honestly only one real thing to
// say about it, so the fix is making that one line read as a real
// poster headline (size, weight, position) rather than a bigger dataset
// that doesn't exist.
interface PreviewCopy {
  tier1: string;
  tier2: string | null;
  badge: string | null;
}

function buildPreviewCopy(visualSubject: string, offer: string, contentType: string): PreviewCopy {
  const tier1 = (visualSubject || contentType).toUpperCase();
  const contentTypeUpper = contentType.toUpperCase();
  const tier2 = contentTypeUpper && contentTypeUpper !== tier1 ? contentTypeUpper : null;
  const offerUpper = offer.toUpperCase();
  const badge = offerUpper && offerUpper !== tier1 && offerUpper !== tier2 ? offerUpper : null;
  return { tier1, tier2, badge };
}

// Each style renders a genuinely different MINIATURE SOCIAL-CREATIVE
// COMPOSITION — real poster-scale typography with a headline/subtitle/
// badge hierarchy and a layered, art-directed background, not a photo
// with one small caption line. The composition (how much of the card is
// photo vs. negative space, where the photo sits, whether the headline
// is an overlay or a standalone badge/sticker) differs per style, which
// is what actually reads as "different design direction" at a glance
// rather than "different color filter." `imageUrl` is the one
// shared-pool photo (still one search for the whole idea, unchanged) —
// every style draws from the same photo, only the layout around it
// differs. When there's no real subject, `imageUrl` is deliberately
// undefined and every style falls back to its own layered CSS gradient
// instead of a photo — a graphic promotional composition, not a random
// stock object standing in for a subject that was never stated.
function CleanPremiumPreview({ imageUrl, copy }: { imageUrl: string | undefined; copy: PreviewCopy }) {
  return (
    <div className="relative h-full w-full bg-white">
      {imageUrl ? (
        <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(circle at 30% 20%, #faf9f5, #e9e6dc 75%)" }}
        />
      )}
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-white via-white/90 to-transparent" />
      <div className="absolute inset-x-1.5 bottom-1.5">
        <p className="line-clamp-2 text-[9px] font-bold uppercase leading-[9px] tracking-tight text-black">
          {copy.tier1}
        </p>
        {copy.tier2 && (
          <p className="mt-0.5 line-clamp-1 text-[5px] font-medium uppercase tracking-[0.14em] text-black/60">
            {copy.tier2}
          </p>
        )}
        {copy.badge && (
          <span className="mt-1 inline-block rounded-full border border-black/25 px-1 py-0.5 text-[4.5px] font-semibold uppercase tracking-wide text-black/75">
            {copy.badge}
          </span>
        )}
      </div>
    </div>
  );
}

function BoldEnergeticPreview({ imageUrl, copy }: { imageUrl: string | undefined; copy: PreviewCopy }) {
  return (
    <div className="relative h-full w-full bg-black">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          style={{ filter: "contrast(1.3) saturate(1.2)" }}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0" style={{ background: "linear-gradient(150deg, #0d0d0d, #2a2a2a 60%, #1a0505)" }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />
      <div className="absolute -left-2 top-0 h-4 w-16 origin-top-left -rotate-[18deg] bg-accent/90" />
      <div className="absolute -left-2 top-3 h-1.5 w-14 origin-top-left -rotate-[18deg] bg-white/25" />
      <div className="absolute inset-x-1 bottom-1">
        <p className="line-clamp-2 text-[10px] font-black uppercase leading-[10px] tracking-tighter text-white">
          {copy.tier1}
        </p>
        {copy.badge && (
          <span className="mt-1 inline-block rounded bg-white px-1 py-0.5 text-[5px] font-black uppercase tracking-tight text-black">
            {copy.badge}
          </span>
        )}
        {!copy.badge && copy.tier2 && (
          <p className="mt-0.5 line-clamp-1 text-[5px] font-semibold uppercase tracking-wide text-white/70">
            {copy.tier2}
          </p>
        )}
      </div>
    </div>
  );
}

function WarmLifestylePreview({ imageUrl, copy }: { imageUrl: string | undefined; copy: PreviewCopy }) {
  return (
    <div className="relative h-full w-full">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: "sepia(0.25) saturate(1.15)" }}
          loading="lazy"
        />
      ) : (
        <div className="h-full w-full" style={{ background: "linear-gradient(165deg, #e6b87d, #b5793f 55%, #6e4423)" }} />
      )}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#2e1a0c]/85 via-[#2e1a0c]/35 to-transparent" />
      <div className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border border-[#fdf3e7]/70" />
      <div className="absolute inset-x-1.5 bottom-1.5">
        <p className="font-display line-clamp-2 text-[9px] font-bold leading-[10px] text-[#fdf3e7]">{copy.tier1}</p>
        {copy.badge ? (
          <span className="mt-1 inline-block rounded-full bg-[#fdf3e7]/90 px-1.5 py-0.5 text-[4.5px] font-semibold uppercase tracking-wide text-[#5a3a1e]">
            {copy.badge}
          </span>
        ) : (
          copy.tier2 && <p className="mt-0.5 line-clamp-1 text-[5px] italic text-[#fdf3e7]/75">{copy.tier2}</p>
        )}
      </div>
    </div>
  );
}

function MinimalEditorialPreview({ imageUrl, copy }: { imageUrl: string | undefined; copy: PreviewCopy }) {
  return (
    <div className="relative h-full w-full bg-[#f7f7f4]">
      <div className="absolute right-1 top-1 h-[42%] w-[46%] overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="h-full w-full" style={{ background: "linear-gradient(150deg, #eae8e1, #d2cfc4)" }} />
        )}
      </div>
      <div className="absolute inset-x-1.5 bottom-1.5 max-w-[62%]">
        <p className="line-clamp-2 text-[8px] font-semibold uppercase leading-[9px] tracking-tight text-black/85">
          {copy.tier1}
        </p>
        {copy.tier2 && (
          <p className="mt-0.5 line-clamp-1 text-[4.5px] font-normal uppercase tracking-[0.2em] text-black/45">
            {copy.tier2}
          </p>
        )}
        {copy.badge && (
          <p className="mt-0.5 line-clamp-1 text-[4.5px] font-normal uppercase tracking-[0.2em] text-black/45">
            {copy.badge}
          </p>
        )}
      </div>
    </div>
  );
}

function VibrantPlayfulPreview({ imageUrl, copy }: { imageUrl: string | undefined; copy: PreviewCopy }) {
  return (
    <div className="relative h-full w-full">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover"
          style={{ filter: "saturate(1.5) contrast(1.05) brightness(1.05)" }}
          loading="lazy"
        />
      ) : (
        <div className="h-full w-full" style={{ background: "linear-gradient(150deg, #ff9466, #d946ef 55%, #9333ea)" }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
      <div className="absolute -right-1 top-2 h-3 w-3 rounded-full bg-white/30" />
      <div className="absolute right-3 top-6 h-1.5 w-1.5 rounded-full bg-white/50" />
      <div className="absolute inset-x-1.5 bottom-1.5">
        <p className="line-clamp-2 text-[9.5px] font-extrabold uppercase leading-[10px] text-white">{copy.tier1}</p>
        {copy.badge && (
          <span className="mt-1 inline-block -rotate-3 rounded bg-accent px-1.5 py-0.5 text-[5px] font-extrabold uppercase text-accent-foreground shadow-sm">
            {copy.badge}
          </span>
        )}
      </div>
    </div>
  );
}

const STYLE_PREVIEWS: Record<string, (props: { imageUrl: string | undefined; copy: PreviewCopy }) => ReactNode> = {
  clean_premium: CleanPremiumPreview,
  bold_energetic: BoldEnergeticPreview,
  warm_lifestyle: WarmLifestylePreview,
  minimal_editorial: MinimalEditorialPreview,
  vibrant_playful: VibrantPlayfulPreview,
};

function StylePreview({
  opt,
  previewUrl,
  hasSubject,
  loading,
  copy,
}: {
  opt: VisualDirectionOption;
  previewUrl: string | undefined;
  hasSubject: boolean;
  loading: boolean;
  copy: PreviewCopy;
}) {
  const Preview = STYLE_PREVIEWS[opt.id] ?? CleanPremiumPreview;
  // Only a real, idea-relevant photo is ever shown as the image — never
  // the pool's own no-subject fallback search result, since that would
  // still be "a random stock object" standing in for a subject that was
  // never stated. No subject means every style renders its own layered
  // graphic composition instead.
  const imageUrl = hasSubject ? previewUrl : undefined;
  return (
    <div className="relative h-full w-full">
      <Preview imageUrl={imageUrl} copy={copy} />
      {hasSubject && loading && !previewUrl && <div className="absolute inset-0 animate-pulse bg-black/10" />}
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
  const copy = buildPreviewCopy(visualSubject, offer, contentType);

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
                <StylePreview
                  opt={opt}
                  previewUrl={pickFromPool(pool, opt)}
                  hasSubject={!!visualSubject}
                  loading={loading}
                  copy={copy}
                />
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
