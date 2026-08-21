import type { AspectRatio, VisualDirection } from "./api";

// Client-side prompt modifiers — no backend change needed. The banner-image
// prompt on the backend is built directly from `item_description` (see
// `_generate_ai_banner_image`/`_generate_banner_image` in main.py), so a
// short style phrase prepended here reaches the real Gemini prompt without
// a new API or parameter.
export interface VisualDirectionOption {
  id: VisualDirection;
  label: string;
  description: string;
  promptModifier: string;
  // The static real-Punqle-output fallback shown while the Pexels search
  // is in flight, or if it fails/returns nothing — never an empty box.
  fallbackImage: string;
}

export const VISUAL_DIRECTIONS: VisualDirectionOption[] = [
  {
    id: "clean_premium",
    label: "Clean & Premium",
    description: "Minimal composition, refined typography, polished imagery.",
    promptModifier: "in a clean, minimal, premium style — refined composition, polished professional lighting, understated elegance",
    fallbackImage: "/showcase-ads/skincare.jpg",
  },
  {
    id: "bold_energetic",
    label: "Bold & Energetic",
    description: "Stronger typography, high contrast, attention-grabbing composition.",
    promptModifier: "in a bold, energetic style — high contrast, punchy composition, vivid colors, attention-grabbing",
    fallbackImage: "/showcase-ads/fitness.jpg",
  },
  {
    id: "warm_lifestyle",
    label: "Warm & Lifestyle",
    description: "Natural imagery, human feel, softer editorial composition.",
    promptModifier: "in a warm, lifestyle style — natural light, human/editorial feel, soft and inviting composition",
    fallbackImage: "/showcase-ads/home.jpg",
  },
];

// Revealed behind "Show more styles" — same reuse principle, just two more
// prompt-modifier phrases rather than a real style-transfer model.
export const MORE_VISUAL_DIRECTIONS: VisualDirectionOption[] = [
  {
    id: "minimal_editorial" as VisualDirection,
    label: "Minimal & Editorial",
    description: "Lots of negative space, magazine-style restraint.",
    promptModifier: "in a minimal, editorial style — generous negative space, magazine-style restraint, muted tones",
    fallbackImage: "/showcase-ads/saas.jpg",
  },
  {
    id: "vibrant_playful" as VisualDirection,
    label: "Vibrant & Playful",
    description: "Bright colors, fun energy, casual composition.",
    promptModifier: "in a vibrant, playful style — bright saturated colors, fun casual energy, dynamic composition",
    fallbackImage: "/showcase-ads/food.jpg",
  },
];

// Cheap heuristic, not real NLP — strips common sentence-scaffolding
// words/verbs so a full idea/starter sentence ("Create a product launch
// post for my business.") collapses down to just its subject ("product
// launch") without any AI call. Good enough for a stock-photo search,
// which already tolerates noisy queries reasonably well.
// "book"/"schedule" are stripped as the common imperative CTA verb
// ("Book a free consultation") — without this, "book" as a search term
// pulls literal photos of books/reading, an unrelated-subject drift bug
// in the same family as the generic-marketing-words one below, just
// triggered by word ambiguity instead of a missing subject. A real
// "book" business ("Promote our new book") is rarer than this CTA
// pattern and still keeps its own follow-on noun (e.g. "novel", a
// title) as the anchor, so this is an acceptable trade.
const FILLER_WORDS =
  /\b(create|promote|announce|introduce|share|showcase|advertise|highlight|celebrate|explaining|book|booking|schedule|scheduling|our|new|the|a|an|for|with|about|post|social|this|your|my|we|are|is)\b/gi;

// Words that, once every scaffolding word above is gone, still don't name
// a real subject — e.g. "Create a promotional post for my special offer."
// reduces to just "special offer", which is a marketing concept, not
// something to search a stock-photo library for. Searching that literal
// noisy leftover text is what let unrelated people/artwork show up for
// genuinely generic ideas.
const GENERIC_MARKETING_WORDS = new Set([
  "special", "offer", "offers", "sale", "discount", "promo", "promotional",
  "deal", "deals", "business", "product", "products", "service", "services",
  "shop", "store",
]);

// One consistent neutral concept used whenever the idea has no real
// subject left — every style preview searches this SAME query in that
// case, so all three still show the same underlying concept (a
// generic promotional/offer scene) rather than each drifting toward
// whatever unrelated photo best matches its own style keywords.
const GENERIC_FALLBACK_SUBJECT = "special offer sale shopping";

export function extractPreviewSubject(ideaText: string): string {
  const withoutChipPrefix = ideaText.replace(/^[A-Za-z ]+:\s*/, "");
  // Hyphens count as word boundaries for the \b-based regex below, so
  // "behind-the-scenes" would otherwise have just its middle "the"
  // stripped out from between two now-stranded hyphens — normalize
  // hyphens to spaces first so a hyphenated phrase strips as cleanly as
  // a spaced one.
  const normalized = withoutChipPrefix.replace(/-/g, " ");
  const stripped = normalized.replace(FILLER_WORDS, " ").replace(/\s+/g, " ").trim();
  const hasRealSubject = stripped
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .some((w) => w.length > 0 && !GENERIC_MARKETING_WORDS.has(w));
  return hasRealSubject ? stripped : GENERIC_FALLBACK_SUBJECT;
}

// A short, punchy promotional headline overlaid on each Step 2 mini
// preview (see VisualDirectionStep.tsx) — derived the same lightweight,
// no-AI-call way as extractPreviewSubject, so "20% off our new coffee
// beans." becomes "20% OFF" and a genuinely generic idea gets the same
// fixed "SPECIAL OFFER" headline its photo search already falls back to,
// keeping the whole preview (photo + headline) about one consistent
// concept rather than two independently-derived texts.
export function extractPreviewHeadline(ideaText: string): string {
  const pctMatch = ideaText.match(/(\d{1,3})\s?%/);
  if (pctMatch) return `${pctMatch[1]}% OFF`;
  const subject = extractPreviewSubject(ideaText);
  if (subject === GENERIC_FALLBACK_SUBJECT) return "SPECIAL OFFER";
  const words = subject
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3);
  return (words.join(" ") || "YOUR OFFER").toUpperCase();
}

export function findVisualDirection(id: VisualDirection | string): VisualDirectionOption {
  return (
    [...VISUAL_DIRECTIONS, ...MORE_VISUAL_DIRECTIONS].find((d) => d.id === id) ?? VISUAL_DIRECTIONS[0]
  );
}

// Quick-start chips on the idea step — client-side only, not a new API.
// "Surprise me" is the one that actually calls the backend (reuses the
// existing free /ads/idea-labs endpoint).
export interface IdeaChip {
  label: string;
  // Clicking the chip populates the textarea with this natural-language
  // starter SENTENCE (not the bare `label` as a "Label: " prefix — that
  // read as an unfinished category tag rather than a usable prompt). The
  // open-ended ones end mid-sentence with a trailing space so the cursor
  // lands ready for the user to keep typing.
  starter: string;
}

export const IDEA_CHIPS: IdeaChip[] = [
  { label: "Product launch", starter: "Create a product launch post for my business." },
  { label: "Special offer", starter: "Create a promotional post for my special offer." },
  { label: "Educational", starter: "Create an educational post explaining " },
  { label: "Customer story", starter: "Create a customer story post about " },
  { label: "Behind the scenes", starter: "Create a behind-the-scenes post about " },
  { label: "Announcement", starter: "Create an announcement post for my business." },
];

export type Platform = "instagram" | "facebook" | "linkedin" | "other";

export const PLATFORM_OPTIONS: { id: Platform; label: string; aspectRatio: AspectRatio; hint: string }[] = [
  { id: "instagram", label: "Instagram", aspectRatio: "square", hint: "Square feed post" },
  { id: "facebook", label: "Facebook", aspectRatio: "feed", hint: "Feed post" },
  // LinkedIn's own recommended ad ratio isn't one of the 3 the image
  // pipeline supports today (square/feed/story) — square is the closest
  // existing fit rather than adding a new Gemini aspect value for this.
  { id: "linkedin", label: "LinkedIn", aspectRatio: "square", hint: "Feed post" },
  { id: "other", label: "Other", aspectRatio: "square", hint: "Square" },
];

export const VERSION_COUNTS = [1, 3, 5] as const;
