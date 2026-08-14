import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  fetchBusinessProfile,
  fetchCurrentContentPlan,
  generateContentPlan,
  setBusinessProfile,
  type ApiAdGenerateResponse,
  type ApiContentPlan,
  type BusinessCategory,
} from "@/lib/api";
import { PlanDayCard } from "./PlanDayCard";

const CATEGORY_LABELS: Record<BusinessCategory, string> = {
  retail: "Retail",
  restaurant_cafe: "Restaurant/Cafe",
  health_beauty: "Health/Beauty",
  professional_services: "Professional Services",
  home_services: "Home Services",
  real_estate: "Real Estate",
  automotive: "Automotive",
  education_coaching: "Education/Coaching",
  fitness_sports: "Fitness/Sports",
  events_entertainment: "Events/Entertainment",
  ecommerce: "Ecommerce",
  technology_software: "Technology/Software",
  other: "Other",
};

const CATEGORY_OPTIONS: BusinessCategory[] = [
  "retail",
  "restaurant_cafe",
  "health_beauty",
  "professional_services",
  "home_services",
  "real_estate",
  "automotive",
  "education_coaching",
  "fitness_sports",
  "events_entertainment",
  "ecommerce",
  "technology_software",
  "other",
];

export function WeeklyPlanForm({
  credits,
  setCredits,
}: {
  credits: number | null;
  setCredits: (n: number) => void;
}) {
  const [category, setCategory] = useState<BusinessCategory | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [plan, setPlan] = useState<ApiContentPlan | null>(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchBusinessProfile(), fetchCurrentContentPlan()])
      .then(([profile, currentPlan]) => {
        setCategory(profile.category);
        setPlan(currentPlan);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load your data."))
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryChange = async (c: BusinessCategory) => {
    setCategory(c);
    setShowCategoryPicker(false);
    try {
      await setBusinessProfile(c);
    } catch {
      // Non-critical — the next plan generation will just fall back to
      // whatever category is actually saved server-side.
    }
  };

  const handleGeneratePlan = async () => {
    if (!inputText.trim() || generatingPlan) return;
    setGeneratingPlan(true);
    setError(null);
    try {
      const newPlan = await generateContentPlan(inputText.trim());
      setPlan(newPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't generate the plan.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handlePostGenerated = (day: string, result: ApiAdGenerateResponse) => {
    setPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        posts: prev.posts.map((p) =>
          p.day === day
            ? {
                ...p,
                status: "generated" as const,
                caption: result.captions[0].facebook_caption,
                whatsapp_message: result.captions[0].whatsapp_message,
                image_base64: result.banner_image_base64,
              }
            : p,
        ),
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 rounded-2xl bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Your business type
        </p>
        {showCategoryPicker ? (
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => handleCategoryChange(c)}
                className={[
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground",
                ].join(" ")}
              >
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => setShowCategoryPicker(true)}
            className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
          >
            {category ? CATEGORY_LABELS[category] : "Choose one"} — change
          </button>
        )}
      </div>

      <div className="mb-5 rounded-2xl bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          What do you want to post about this week?
        </p>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={3}
          placeholder="e.g. New spring menu launching, 15% off all bookings this week — or a short description of your product/service"
          className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-primary"
        />
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {!plan && (
        <button
          onClick={handleGeneratePlan}
          disabled={generatingPlan || !inputText.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          style={{ background: "var(--gradient-primary)" }}
        >
          {generatingPlan ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate plan"
          )}
        </button>
      )}

      {plan && (
        <>
          {plan.posts.map((post) => (
            <PlanDayCard
              key={post.day}
              planId={plan.id}
              post={post}
              credits={credits}
              setCredits={setCredits}
              onGenerated={handlePostGenerated}
            />
          ))}
          <button
            onClick={handleGeneratePlan}
            disabled={generatingPlan || !inputText.trim()}
            className="w-full rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground disabled:opacity-60"
          >
            {generatingPlan ? "Generating..." : "Generate a new plan"}
          </button>
        </>
      )}
    </>
  );
}
