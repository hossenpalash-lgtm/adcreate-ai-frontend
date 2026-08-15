import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchAdCredits } from "@/lib/api";
import { HistoryTab } from "@/components/ads/HistoryTab";
import { SinglePostForm } from "@/components/ads/SinglePostForm";
import { WeeklyPlanForm } from "@/components/ads/WeeklyPlanForm";

export const Route = createFileRoute("/")({
  component: HomeScreen,
});

function HomeScreen() {
  const [tab, setTab] = useState<"single" | "plan" | "history">("single");
  const [credits, setCredits] = useState<number | null>(null);
  const [creditsError, setCreditsError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdCredits()
      .then((c) => setCredits(c.credits))
      .catch((err) => setCreditsError(err instanceof Error ? err.message : "Couldn't load your credits."));
  }, []);

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

      <div className="mb-5 flex gap-1 rounded-full bg-secondary p-1">
        <button
          onClick={() => setTab("single")}
          className={[
            "flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-colors",
            tab === "single" ? "bg-card text-foreground" : "text-secondary-foreground",
          ].join(" ")}
          style={tab === "single" ? { boxShadow: "var(--shadow-card)" } : undefined}
        >
          Single Post
        </button>
        <button
          onClick={() => setTab("plan")}
          className={[
            "flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-colors",
            tab === "plan" ? "bg-card text-foreground" : "text-secondary-foreground",
          ].join(" ")}
          style={tab === "plan" ? { boxShadow: "var(--shadow-card)" } : undefined}
        >
          Weekly Plan
        </button>
        <button
          onClick={() => setTab("history")}
          className={[
            "flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-colors",
            tab === "history" ? "bg-card text-foreground" : "text-secondary-foreground",
          ].join(" ")}
          style={tab === "history" ? { boxShadow: "var(--shadow-card)" } : undefined}
        >
          History
        </button>
      </div>

      {tab === "single" && <SinglePostForm credits={credits} setCredits={setCredits} />}
      {tab === "plan" && <WeeklyPlanForm credits={credits} setCredits={setCredits} />}
      {tab === "history" && <HistoryTab />}
    </main>
  );
}
