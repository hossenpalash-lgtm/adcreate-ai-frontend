import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Calendar, Megaphone, Sparkles, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchAdCredits } from "@/lib/api";
import { CompetitorAnalysis } from "@/components/ads/CompetitorAnalysis";
import { HistoryTab } from "@/components/ads/HistoryTab";
import { SinglePostForm } from "@/components/ads/SinglePostForm";
import { VideoPostForm } from "@/components/ads/VideoPostForm";
import { WeeklyPlanForm } from "@/components/ads/WeeklyPlanForm";

type Tab = "single" | "plan" | "history" | "competitor" | "video";

export const Route = createFileRoute("/")({
  component: HomeScreen,
  validateSearch: (search: Record<string, unknown>): { tab: Tab } => ({
    tab:
      search.tab === "plan"
        ? "plan"
        : search.tab === "history"
          ? "history"
          : search.tab === "competitor"
            ? "competitor"
            : search.tab === "video"
              ? "video"
              : "single",
  }),
});

const CONTENT_TYPES: {
  tab: Tab;
  label: string;
  description: string;
  icon: typeof Megaphone;
}[] = [
  { tab: "single", label: "Single Post", description: "One ad, ready in seconds", icon: Megaphone },
  { tab: "plan", label: "Weekly Plan", description: "A week of posts at once", icon: Calendar },
  { tab: "video", label: "Video", description: "A short video ad (10 credits)", icon: Video },
];

function HomeScreen() {
  const { tab } = Route.useSearch();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsError, setCreditsError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdCredits()
      .then((c) => setCredits(c.credits))
      .catch((err) => setCreditsError(err instanceof Error ? err.message : "Couldn't load your credits."));
  }, []);

  const goTo = (t: Tab) => navigate({ to: "/", search: { tab: t } });

  return (
    <main className="flex flex-1 flex-col px-6 py-6">
      <div
        className="mb-5 flex items-center justify-between rounded-2xl bg-card p-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-foreground">Your credits</span>
        </div>
        <span className="text-lg font-extrabold text-primary">
          {credits === null ? "..." : credits}
        </span>
      </div>
      {creditsError && <p className="mb-4 text-sm text-destructive">{creditsError}</p>}

      {(tab === "single" || tab === "plan" || tab === "video") && (
        <>
          <h1 className="font-display mb-3 text-lg font-extrabold text-foreground">
            Create Your Next Post
          </h1>
          <div className="mb-6 grid grid-cols-3 gap-2 lg:grid-cols-3">
            {CONTENT_TYPES.map(({ tab: t, label, description, icon: Icon }, i) => (
              <button
                key={i}
                onClick={() => goTo(t)}
                className={[
                  "flex flex-col items-center gap-2 rounded-2xl p-3 text-center transition-colors",
                  tab === t ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
                ].join(" ")}
                style={tab !== t ? { boxShadow: "var(--shadow-card)" } : undefined}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-semibold">{label}</span>
                <span
                  className={[
                    "text-[10px]",
                    tab === t ? "text-primary-foreground/80" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {description}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {tab === "single" && <SinglePostForm credits={credits} setCredits={setCredits} />}
      {tab === "plan" && <WeeklyPlanForm credits={credits} setCredits={setCredits} />}
      {tab === "video" && <VideoPostForm credits={credits} setCredits={setCredits} />}
      {tab === "history" && <HistoryTab />}
      {tab === "competitor" && <CompetitorAnalysis />}
    </main>
  );
}
