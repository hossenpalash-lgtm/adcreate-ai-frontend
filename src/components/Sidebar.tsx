import { Binoculars, Calendar, Clock, Gift, LogOut, Megaphone, Package, Palette, Sparkles } from "lucide-react";

// "video" has no dedicated nav row (same as "single"/"plan" — all three
// are only reached via the content-type card grid on the home screen),
// but still needs its own tab value so none of the sidebar's own rows
// (Single Post, Weekly Plan, History, Competitor Analysis) incorrectly
// show as active while a user is actually on the Video tab.
export type NavTab = "single" | "plan" | "history" | "competitor" | "video";

const NAV_ITEMS: { tab: NavTab; label: string; icon: typeof Megaphone }[] = [
  { tab: "single", label: "Single Post", icon: Megaphone },
  { tab: "plan", label: "Weekly Plan", icon: Calendar },
  { tab: "history", label: "History", icon: Clock },
  { tab: "competitor", label: "Competitor Analysis", icon: Binoculars },
];

// One component, two renderings via Tailwind breakpoints rather than two
// separate components — desktop gets a persistent left rail (like
// Predis's own layout), mobile keeps a compact top bar since a fixed
// sidebar doesn't work on a phone-width screen. Single Post vs Weekly
// Plan switching lives as cards on the create screen itself on mobile
// (see index.tsx) rather than cramming a 4th icon into the mobile bar.
export function Sidebar({
  tab,
  onNavigate,
  onOpenBrandKit,
  onOpenProductCatalog,
  onOpenReferral,
  onSignOut,
}: {
  tab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onOpenBrandKit: () => void;
  onOpenProductCatalog: () => void;
  onOpenReferral: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      {/* Floating rounded rail (matches the mobile pill nav bar's soft
          elevation treatment) instead of a flush edge-to-edge panel with
          a hard right border — inset with margin on all sides. */}
      <aside
        className="hidden shrink-0 rounded-2xl bg-card px-4 py-6 lg:my-4 lg:ml-4 lg:flex lg:h-[calc(100vh-2rem)] lg:w-60 lg:flex-col"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="mb-8 flex items-center gap-2 px-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="font-display text-base font-extrabold text-foreground">Punqle</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ tab: t, label, icon: Icon }) => (
            <button
              key={t}
              onClick={() => onNavigate(t)}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                tab === t ? "bg-primary text-primary-foreground" : "text-secondary-foreground hover:bg-secondary",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
          <button
            onClick={onOpenBrandKit}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary"
          >
            <Palette className="h-4 w-4" />
            Brand Kit
          </button>
          <button
            onClick={onOpenProductCatalog}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary"
          >
            <Package className="h-4 w-4" />
            Product Catalog
          </button>
          <button
            onClick={onOpenReferral}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary"
          >
            <Gift className="h-4 w-4" />
            Invite &amp; Earn
          </button>
        </nav>
        <button
          onClick={onSignOut}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </aside>

      {/* Floating pill nav bar (Arcads-style), inset from the edges with
          its own elevation shadow instead of a flush edge-to-edge bar
          with a bottom border — stays pinned while scrolling. */}
      <header className="sticky top-0 z-40 bg-background px-3 pt-3 pb-2 lg:hidden">
        <div
          className="flex items-center justify-between gap-2 overflow-x-auto rounded-full bg-card py-2 pl-3 pr-2"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex shrink-0 items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-sm font-extrabold text-foreground">Punqle</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => onNavigate("history")}
              aria-label="History"
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full",
                tab === "history" ? "bg-primary text-primary-foreground" : "text-secondary-foreground hover:bg-secondary",
              ].join(" ")}
            >
              <Clock className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate("competitor")}
              aria-label="Competitor Analysis"
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full",
                tab === "competitor" ? "bg-primary text-primary-foreground" : "text-secondary-foreground hover:bg-secondary",
              ].join(" ")}
            >
              <Binoculars className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenBrandKit}
              aria-label="Brand Kit"
              className="flex h-9 w-9 items-center justify-center rounded-full text-secondary-foreground hover:bg-secondary"
            >
              <Palette className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenProductCatalog}
              aria-label="Product Catalog"
              className="flex h-9 w-9 items-center justify-center rounded-full text-secondary-foreground hover:bg-secondary"
            >
              <Package className="h-4 w-4" />
            </button>
            <button
              onClick={onOpenReferral}
              aria-label="Invite & Earn"
              className="flex h-9 w-9 items-center justify-center rounded-full text-secondary-foreground hover:bg-secondary"
            >
              <Gift className="h-4 w-4" />
            </button>
            <button
              onClick={onSignOut}
              aria-label="Sign out"
              className="flex h-9 w-9 items-center justify-center rounded-full text-secondary-foreground hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
