import { Hash, MessageSquareText, Package, Palette, PenLine } from "lucide-react";

// Two-step "how it works" showcase — visual language borrowed from a
// reference (dark editorial panels, floating glass UI, italic serif
// titles), but the actual on-screen features are Punqle's real ones.
// The reference itself shows AI-model selection and Upscale/Extend
// tools Punqle doesn't have — swapped for the real aspect-ratio picker
// and real edit tools rather than claiming capability that isn't there.
export function WorkflowShowcase() {
  return (
    <div className="relative z-10 mt-14 w-full max-w-4xl">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        {/* Card 1 — Choose your format */}
        <div className="animate-fade-rise flex flex-col" style={{ animationDelay: "0ms" }}>
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[22px] bg-[#0a0a0a]">
            <span className="pointer-events-none absolute font-display text-[10rem] font-extrabold leading-none text-white/[0.04]">
              Aa
            </span>
            <div className="relative flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-5 backdrop-blur-md">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/60">Format</span>
              <div className="flex gap-2">
                <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black">Square</span>
                <span className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/70">Feed</span>
                <span className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white/70">Story</span>
              </div>
            </div>
          </div>
          <h3 className="mt-5 font-display text-xl font-bold italic text-foreground">Choose your format</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Upload a photo, paste a product link, or let AI generate one — then pick Square, Feed, or Story to match
            where it's going.
          </p>
        </div>

        {/* Card 2 — Customize your Ad */}
        <div className="animate-fade-rise flex flex-col" style={{ animationDelay: "110ms" }}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-[#0a0a0a]">
            <img src="/hero-cards/knit-sweater.jpg" alt="" className="h-full w-full object-cover opacity-70" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-2 px-4">
              {[
                { icon: PenLine, label: "Edit" },
                { icon: MessageSquareText, label: "Captions" },
                { icon: Palette, label: "Brand Kit" },
                { icon: Hash, label: "Hashtags" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md"
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </span>
              ))}
            </div>
            <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
              <Package className="h-3 w-3" />
              Product Import
            </span>
          </div>
          <h3 className="mt-5 font-display text-xl font-bold italic text-foreground">Customize your Ad</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Drag captions and your logo into place, apply your brand colors, and add hashtags — all in one editor.
          </p>
        </div>
      </div>
    </div>
  );
}
