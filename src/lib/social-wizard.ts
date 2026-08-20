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
}

export const VISUAL_DIRECTIONS: VisualDirectionOption[] = [
  {
    id: "clean_premium",
    label: "Clean & Premium",
    description: "Minimal composition, refined typography, polished imagery.",
    promptModifier: "in a clean, minimal, premium style — refined composition, polished professional lighting, understated elegance",
  },
  {
    id: "bold_energetic",
    label: "Bold & Energetic",
    description: "Stronger typography, high contrast, attention-grabbing composition.",
    promptModifier: "in a bold, energetic style — high contrast, punchy composition, vivid colors, attention-grabbing",
  },
  {
    id: "warm_lifestyle",
    label: "Warm & Lifestyle",
    description: "Natural imagery, human feel, softer editorial composition.",
    promptModifier: "in a warm, lifestyle style — natural light, human/editorial feel, soft and inviting composition",
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
  },
  {
    id: "vibrant_playful" as VisualDirection,
    label: "Vibrant & Playful",
    description: "Bright colors, fun energy, casual composition.",
    promptModifier: "in a vibrant, playful style — bright saturated colors, fun casual energy, dynamic composition",
  },
];

export function findVisualDirection(id: VisualDirection | string): VisualDirectionOption {
  return (
    [...VISUAL_DIRECTIONS, ...MORE_VISUAL_DIRECTIONS].find((d) => d.id === id) ?? VISUAL_DIRECTIONS[0]
  );
}

// Quick-start chips on the idea step — plain client-side prefixes for the
// idea textarea, not a new API. "Surprise me" is the one that actually
// calls the backend (reuses the existing free /ads/idea-labs endpoint).
export const IDEA_CHIPS = [
  "Product launch",
  "Special offer",
  "Educational",
  "Customer story",
  "Behind the scenes",
  "Announcement",
] as const;

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
