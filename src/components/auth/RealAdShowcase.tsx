import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { SHOWCASE_ADS, type ShowcaseAd } from "@/lib/showcase-ads";

type ImageAd = Extract<ShowcaseAd, { type: "image" }>;
type VideoAd = Extract<ShowcaseAd, { type: "video" }>;

const IMAGE_ADS = SHOWCASE_ADS.filter((ad): ad is ImageAd => ad.type === "image");
const VIDEO_ADS = SHOWCASE_ADS.filter((ad): ad is VideoAd => ad.type === "video");

// Editorial column spans for the 6 image cards — deliberately uneven
// (7/5, 5/7, 6/6) rather than a plain 3x2 grid, so the layout itself
// doesn't read as "generic feature cards." Paired 1:1 with IMAGE_ADS by
// index since there are always exactly 6.
const IMAGE_LAYOUT = [
  { span: "lg:col-span-7", aspect: "aspect-[4/5]" },
  { span: "lg:col-span-5", aspect: "aspect-[4/5]" },
  { span: "lg:col-span-5", aspect: "aspect-square" },
  { span: "lg:col-span-7", aspect: "aspect-square" },
  { span: "lg:col-span-6", aspect: "aspect-[4/5]" },
  { span: "lg:col-span-6", aspect: "aspect-[4/5]" },
];

// Middle video sits slightly elevated and larger — the "subtle editorial
// positioning" called for instead of three identical tiles in a row.
const VIDEO_LAYOUT = ["sm:translate-y-5", "sm:-translate-y-2 sm:scale-[1.05]", "sm:translate-y-5"];

// The CTA lives here, below the creative, rather than floating on top of
// it — an earlier version overlaid it on the image itself, which collided
// with the baked-in subcopy line since that caption bar's height varies
// with text length and the overlay had no way to know how tall it'd be.
// Sitting in the metadata row sidesteps that entirely and matches how a
// real Facebook/Instagram ad renders its CTA as a platform UI element
// next to the creative, not painted into the creative itself.
function CardMeta({ category, detail, cta }: { category: string; detail: string; cta: string }) {
  return (
    <div className="mt-2.5 flex items-center justify-between gap-2 px-0.5">
      <div className="flex flex-col text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{category}</span>
        <span>{detail}</span>
      </div>
      <span className="shrink-0 whitespace-nowrap rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-secondary-foreground">
        {cta}
      </span>
    </div>
  );
}

function ImageAdCard({ ad, span, aspect, delayMs }: { ad: ImageAd; span: string; aspect: string; delayMs: number }) {
  return (
    <div className={span}>
      <div
        className="animate-fade-rise group relative overflow-hidden rounded-[22px] transition-transform duration-300 hover:scale-[1.015] hover:shadow-lg"
        style={{ boxShadow: "var(--shadow-card)", animationDelay: `${delayMs}ms` }}
      >
        <div className={`${aspect} w-full`}>
          <img
            src={ad.image}
            alt={`${ad.headline} — a ${ad.category.toLowerCase()} ad made with Punqle`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
      <CardMeta category={ad.category} detail="Image Ad" cta={ad.cta} />
    </div>
  );
}

function VideoAdCard({ ad, offsetClass, delayMs }: { ad: VideoAd; offsetClass: string; delayMs: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;

    // Only the videos actually visible on screen play — everything else
    // (scrolled past, or not yet reached) stays paused, so this section
    // never has more decoders running than what's currently on screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay can still be blocked by the browser/OS despite
            // muted+playsInline (e.g. low-power mode) — the poster frame
            // is a perfectly fine fallback, not worth surfacing an error.
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={offsetClass}>
      <div
        className="animate-fade-rise group relative aspect-[9/16] w-full overflow-hidden rounded-[22px]"
        style={{ boxShadow: "var(--shadow-card)", animationDelay: `${delayMs}ms` }}
      >
        <video
          ref={videoRef}
          src={ad.video}
          poster={ad.poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
          Made with Punqle
        </span>
      </div>
      <CardMeta category={ad.category} detail={`${ad.style} · 9:16`} cta={ad.cta} />
    </div>
  );
}

export function RealAdShowcase({ onCreateClick }: { onCreateClick: () => void }) {
  const [tab, setTab] = useState<"image" | "video">("image");

  return (
    <section className="relative z-10 mx-auto mt-16 w-full max-w-5xl px-1">
      <div className="flex flex-col items-center text-center">
        <h2 className="font-display text-3xl font-extrabold text-foreground sm:text-4xl">
          See what you can create <span className="italic">with Punqle</span>
        </h2>
        <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
          From product photos to ready-to-publish image and video ads.
        </p>

        <div
          className="mt-7 flex w-fit rounded-full border border-border bg-card p-1"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          {(["image", "video"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={[
                "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {t === "image" ? "Image Ads" : "Video Ads"}
            </button>
          ))}
        </div>
      </div>

      {tab === "image" ? (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          {IMAGE_ADS.map((ad, i) => (
            <ImageAdCard key={ad.image} ad={ad} span={IMAGE_LAYOUT[i].span} aspect={IMAGE_LAYOUT[i].aspect} delayMs={i * 70} />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:items-center sm:gap-6">
          {VIDEO_ADS.map((ad, i) => (
            <VideoAdCard key={ad.video} ad={ad} offsetClass={VIDEO_LAYOUT[i]} delayMs={i * 90} />
          ))}
        </div>
      )}

      <div className="mt-14 flex flex-col items-center rounded-[28px] bg-card px-6 py-10 text-center sm:px-10" style={{ boxShadow: "var(--shadow-card)" }}>
        <h3 className="font-display text-xl font-extrabold text-foreground sm:text-2xl">Ready to make your own?</h3>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">Turn your product into an ad in minutes.</p>
        <button
          type="button"
          onClick={onCreateClick}
          className="mt-5 flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "var(--gradient-primary)" }}
        >
          Create your first ad
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
