import { Check, ChevronDown, Hash, MessageSquareText, Palette, PenLine, Sparkles } from "lucide-react";

// Full-bleed dark "how it works" section — its own distinct screen as
// you scroll (like the reference), not a small block wedged between
// other content. Visual language (STEP badges, dark cards, floating
// glass UI) borrowed from a reference mockup, but every claim on
// screen is a real Punqle capability: no AI-model picker (Punqle only
// runs one video engine internally, there's no "Seedance/Kling/Sora"
// choice to show), no Upscale/Extend (not built), and no fabricated
// "Trusted by 50,000+ creators" stat.
const FORMATS = [
  { label: "Square", selected: true },
  { label: "Feed (4:5)", selected: false },
  { label: "Story (9:16)", selected: false },
];

const EDIT_TOOLS = [
  { icon: PenLine, label: "Edit" },
  { icon: MessageSquareText, label: "Captions" },
  { icon: Palette, label: "Brand Kit" },
  { icon: Hash, label: "Hashtags" },
];

export function WorkflowShowcase() {
  return (
    <section className="relative left-1/2 z-10 mt-16 w-screen -translate-x-1/2 bg-[#050505] px-6 py-16 sm:px-10 sm:py-20">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-md">
          <Sparkles className="h-3 w-3" />
          How It Works
        </span>
        <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
          Go from idea <span className="italic">to ad</span> in minutes
        </h2>
        <p className="mt-3 text-sm text-white/60 sm:text-base">Two simple steps. No design skills needed.</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Step 1 — Choose your format */}
        <div className="animate-fade-rise flex flex-col" style={{ animationDelay: "0ms" }}>
          <span className="mb-3 inline-flex w-fit items-center rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
            Step 1
          </span>
          <h3 className="font-display text-xl font-bold text-white">Choose your format</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-white/50">
            Upload a photo, paste a product link, or let AI generate one — then pick the format that fits.
          </p>
          <div className="relative mt-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03] px-8">
            <span className="pointer-events-none absolute -left-2 top-4 select-none font-display text-[9rem] font-extrabold leading-none tracking-tight text-white/[0.05]">
              Ad
            </span>
            <div className="relative w-full max-w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] backdrop-blur-md">
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm font-semibold text-white/60">Format</span>
                <span className="flex items-center gap-1.5 text-base font-semibold text-white">
                  Square
                  <ChevronDown className="h-4 w-4 text-white/60" />
                </span>
              </div>
              <div className="border-t border-white/10">
                {FORMATS.map(({ label, selected }) => (
                  <div key={label} className="flex items-center justify-between px-5 py-2.5 text-sm text-white/80">
                    {label}
                    {selected && <Check className="h-4 w-4 text-white" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 — Customize your Ad */}
        <div className="animate-fade-rise flex flex-col" style={{ animationDelay: "110ms" }}>
          <span className="mb-3 inline-flex w-fit items-center rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
            Step 2
          </span>
          <h3 className="font-display text-xl font-bold text-white">Customize your Ad</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-white/50">
            Drag captions and your logo into place, apply your brand colors, and add hashtags — all in one editor.
          </p>
          <div className="relative mt-5 flex aspect-[4/3] items-end justify-center overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
            <img
              src="/hero-cards/knit-sweater.jpg"
              alt=""
              className="absolute inset-x-10 inset-y-4 h-[calc(100%-2rem)] w-[calc(100%-5rem)] rounded-xl object-cover"
              loading="lazy"
            />
            <div className="relative grid w-full max-w-[280px] grid-cols-2 gap-2">
              {EDIT_TOOLS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/15 px-3 py-3 text-sm font-semibold text-white backdrop-blur-md"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
