// Real creatives generated through Punqle's own production pipelines
// (/ads/generate for images, /ads/generate-video for videos — same
// endpoints every signed-in user's own posts go through), not stock
// photos or hand-designed mockups. Headline/subcopy are composited onto
// the images the same way canvas-text.ts does for a real user's post
// (bottom gradient bar, same font); video captions are burned in via the
// same ffmpeg step /ads/video-status already applies. A small "Made with
// Punqle" mark is baked into every image; videos carry the same mark as
// an overlay in the card itself (see RealAdShowcase.tsx) since it's
// cheaper to update than re-encoding video.
//
// Deliberately no UGC/talking-head/spokesperson example — Punqle's video
// engine doesn't do that today, and implying it would misrepresent what
// a visitor can actually get. The three video styles here (product
// showcase, lifestyle-in-use, transformation) are exactly what the real
// video pipeline produces.
//
// To replace an example later: generate a new asset through the app
// itself (or the same backend endpoints), drop the file in
// public/showcase-ads/, and update the matching entry below — nothing
// in RealAdShowcase.tsx needs to change.
export type ShowcaseAd =
  | {
      type: "image";
      category: string;
      headline: string;
      subcopy: string;
      cta: string;
      image: string;
    }
  | {
      type: "video";
      category: string;
      style: string;
      cta: string;
      video: string;
      poster: string;
    };

export const SHOWCASE_ADS: ShowcaseAd[] = [
  {
    type: "image",
    category: "Skincare",
    headline: "Glow starts here.",
    subcopy: "Simple skincare for your everyday routine.",
    cta: "Shop Now",
    image: "/showcase-ads/skincare.jpg",
  },
  {
    type: "image",
    category: "Food & Beverage",
    headline: "Baked fresh, daily.",
    subcopy: "Handcrafted pastries made with real ingredients.",
    cta: "Order Now",
    image: "/showcase-ads/food.jpg",
  },
  {
    type: "image",
    category: "Fashion",
    headline: "Carry it well.",
    subcopy: "Timeless leather, made to last.",
    cta: "Shop the Collection",
    image: "/showcase-ads/fashion.jpg",
  },
  {
    type: "image",
    category: "Fitness & Wellness",
    headline: "Move better. Feel stronger.",
    subcopy: "Everyday essentials for your practice.",
    cta: "Start Today",
    image: "/showcase-ads/fitness.jpg",
  },
  {
    type: "image",
    category: "SaaS & App",
    headline: "Work smarter, not harder.",
    subcopy: "Simple tools for growing businesses.",
    cta: "Try Free",
    image: "/showcase-ads/saas.jpg",
  },
  {
    type: "image",
    category: "Home & Lifestyle",
    headline: "Little joys, every day.",
    subcopy: "Thoughtful pieces for your space.",
    cta: "Browse Now",
    image: "/showcase-ads/home.jpg",
  },
  {
    type: "video",
    category: "Fashion",
    style: "Product Showcase",
    cta: "Shop Now",
    video: "/showcase-ads/product-showcase.mp4",
    poster: "/showcase-ads/product-showcase-poster.jpg",
  },
  {
    type: "video",
    category: "Fitness & Wellness",
    style: "Lifestyle",
    cta: "Start Today",
    video: "/showcase-ads/lifestyle.mp4",
    poster: "/showcase-ads/lifestyle-poster.jpg",
  },
  {
    type: "video",
    category: "Skincare",
    style: "Transformation",
    cta: "Shop Now",
    video: "/showcase-ads/transformation.mp4",
    poster: "/showcase-ads/transformation-poster.jpg",
  },
];
