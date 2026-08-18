import {
  Binoculars,
  Calendar,
  Clapperboard,
  Clock,
  Crop,
  Eraser,
  FileSpreadsheet,
  Gift,
  GalleryHorizontalEnd,
  Hash,
  Image as ImageIcon,
  Lightbulb,
  MessageSquareText,
  Move,
  Newspaper,
  Package,
  Palette,
  PenLine,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

type Tool = { icon: typeof Sparkles; label: string };

// Real Punqle features (not Arcads' tool names — those are other
// companies' AI models like Sora/Kling/Nano Banana, and showing them
// here would misrepresent what Punqle actually does).
const ROW_1_TOOLS: Tool[] = [
  { icon: Eraser, label: "Remove Background" },
  { icon: Sparkles, label: "Enhance Image" },
  { icon: MessageSquareText, label: "Captions" },
  { icon: Palette, label: "Brand Kit" },
  { icon: ImageIcon, label: "Stock Photos" },
  { icon: Package, label: "Product Import" },
  { icon: Clapperboard, label: "Video Ads" },
  { icon: Crop, label: "Aspect Ratio" },
  { icon: GalleryHorizontalEnd, label: "Carousel Builder" },
  { icon: PenLine, label: "Quick Edit" },
];

const ROW_2_TOOLS: Tool[] = [
  { icon: Calendar, label: "Weekly Plan" },
  { icon: Binoculars, label: "Competitor Scan" },
  { icon: Lightbulb, label: "Idea Labs" },
  { icon: Newspaper, label: "Blog to Post" },
  { icon: Move, label: "Drag & Drop" },
  { icon: ShoppingBag, label: "Shopify Sync" },
  { icon: FileSpreadsheet, label: "CSV Import" },
  { icon: Clock, label: "History" },
  { icon: Hash, label: "Hashtags" },
  { icon: Gift, label: "Referral Bonus" },
];

function ToolPill({ icon: Icon, label }: Tool) {
  return (
    <div className="mr-2.5 flex shrink-0 items-center gap-1.5 rounded-[11px] border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground sm:mr-3 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground sm:h-4 sm:w-4" />
      {label}
    </div>
  );
}

// Standard seamless-marquee technique: the track holds the tool set
// TWICE back to back, then animates translateX by exactly -50% (one
// set's width) — since the second copy starts exactly where the first
// began, the loop restart is visually invisible. Direction is just
// which end of that same keyframe the animation plays from (see
// .animate-marquee-left / -right in styles.css).
//
// Both copies are wrapped in `display: contents` (.marquee-set) rather
// than being real flex boxes — real boxes would each measure only
// their OWN content width, excluding the gap *between* the two copies,
// so translating by exactly half the *combined* track (which does
// include that connecting gap) would overshoot by half a gap and show
// a visible 1-frame jump every loop. `display: contents` makes every
// pill a direct flex child of the single outer track instead, so the
// two copies are structurally identical halves and -50% is exact.
function ToolMarqueeRow({ tools, reverse, durationS }: { tools: Tool[]; reverse?: boolean; durationS: number }) {
  return (
    <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <div
        className={`flex w-max ${reverse ? "animate-marquee-right" : "animate-marquee-left"}`}
        style={{ animationDuration: `${durationS}s` }}
      >
        <div className="marquee-set contents">
          {tools.map((t, i) => (
            <ToolPill key={`a-${i}`} {...t} />
          ))}
        </div>
        <div className="marquee-set contents" aria-hidden="true">
          {tools.map((t, i) => (
            <ToolPill key={`b-${i}`} {...t} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Self-contained, reusable — two independent rows moving in opposite
// directions at a slow, elegant pace. Full-bleed via -mx-6 to cancel
// the parent's horizontal padding, since the track itself needs to be
// wider than the viewport with its edges invisible, not just wider
// than a padded content column.
export function AIToolMarquee() {
  return (
    <div className="-mx-6 flex flex-col gap-2 py-2 sm:-mx-6 sm:gap-2.5">
      <ToolMarqueeRow tools={ROW_1_TOOLS} durationS={46} />
      <ToolMarqueeRow tools={ROW_2_TOOLS} reverse durationS={54} />
    </div>
  );
}
