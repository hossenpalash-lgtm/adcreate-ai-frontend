import { Binoculars, Calendar, Clock, CreditCard, Gift, LogOut, Megaphone, Package, Palette, Video } from "lucide-react";
import { PunqleLogo } from "@/components/PunqleLogo";
import { useScrolled } from "@/lib/use-scrolled";

// "single"/"video" have no dedicated nav row on mobile (both are reached
// via the content-type card grid on the home screen instead — see
// index.tsx) but still need tab values so none of the sidebar's own rows
// incorrectly show as active while a user is actually on one of those tabs.
export type NavTab = "single" | "plan" | "history" | "competitor" | "video";

// Single Post + Video are the primary "Create" entry point (promoted
// 2026-08-19, per the decision to keep the core flow focused on ad
// creation). Weekly Plan and Competitor Analysis are demoted into a
// "More tools" section below rather than deleted — still fully reachable,
// just not front-and-center.
const PRIMARY_NAV_ITEMS: { tab: NavTab; label: string; icon: typeof Megaphone }[] = [
  { tab: "single", label: "Single Post", icon: Megaphone },
  { tab: "video", label: "Video", icon: Video },
];

const MORE_TOOLS_ITEMS: { tab: NavTab; label: string; icon: typeof Megaphone }[] = [
  { tab: "plan", label: "Weekly Plan", icon: Calendar },
  { tab: "history", label: "History", icon: Clock },
  { tab: "competitor", label: "Competitor Analysis", icon: Binoculars },
];

// One component, two renderings via Tailwind breakpoints rather than two
// separate components — desktop gets a persistent left rail (like
// Predis's own layout), mobile keeps a compact top bar since a fixed
// sidebar doesn't work on a phone-width screen.
export function Sidebar({
  tab,
  onNavigate,
  onOpenBrandKit,
  onOpenProductCatalog,
  onOpenReferral,
  onOpenBilling,
  onSignOut,
}: {
  tab: NavTab;
  onNavigate: (tab: NavTab) => void;
  onOpenBrandKit: () => void;
  onOpenProductCatalog: () => void;
  onOpenReferral: () => void;
  onOpenBilling: () => void;
  onSignOut: () => void;
}) {
  const scrolled = useScrolled();
  return (
    <>
      {/* Floating frosted-glass rail — translucent + backdrop-blur
          instead of a flat --card fill, sticky so it stays in view
          instead of scrolling away with the page content. */}
      <aside
        className={[
          "glass-nav hidden shrink-0 rounded-2xl px-4 py-6 lg:sticky lg:top-4 lg:my-4 lg:ml-4 lg:flex lg:h-[calc(100vh-2rem)] lg:w-60 lg:flex-col",
          scrolled ? "glass-nav-scrolled" : "",
        ].join(" ")}
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="mb-8 flex items-center gap-2 px-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            <PunqleLogo className="h-4 w-4" />
          </div>
          <span className="font-display text-base font-extrabold text-foreground">Punqle</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {PRIMARY_NAV_ITEMS.map(({ tab: t, label, icon: Icon }) => (
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
          <span className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            More tools
          </span>
          {MORE_TOOLS_ITEMS.map(({ tab: t, label, icon: Icon }) => (
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
          <button
            onClick={onOpenBilling}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary"
          >
            <CreditCard className="h-4 w-4" />
            Plans &amp; Billing
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

      {/* Floating frosted-glass pill nav bar (Arcads-style), inset from
          the edges — the outer header itself stays transparent so page
          content is visible in the margin around the pill, and only
          the pill surface gets the translucent blur treatment. */}
      <header className="sticky top-0 z-40 px-3 pt-3 pb-2 lg:hidden">
        <div
          className={[
            "glass-nav flex items-center justify-between gap-2 overflow-x-auto rounded-full py-2 pl-3 pr-2",
            scrolled ? "glass-nav-scrolled" : "",
          ].join(" ")}
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex shrink-0 items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <PunqleLogo className="h-4 w-4" />
            </div>
            <span className="font-display text-sm font-extrabold text-foreground">Punqle</span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => onNavigate("plan")}
              aria-label="Weekly Plan"
              className={[
                "flex h-9 w-9 items-center justify-center rounded-full",
                tab === "plan" ? "bg-primary text-primary-foreground" : "text-secondary-foreground hover:bg-secondary",
              ].join(" ")}
            >
              <Calendar className="h-4 w-4" />
            </button>
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
              onClick={onOpenBilling}
              aria-label="Plans & Billing"
              className="flex h-9 w-9 items-center justify-center rounded-full text-secondary-foreground hover:bg-secondary"
            >
              <CreditCard className="h-4 w-4" />
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
