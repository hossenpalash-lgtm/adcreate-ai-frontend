import { AlertCircle, ArrowLeft, ArrowRight, Loader2, Pencil, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { understandIdea, type ApiUnderstandIdeaResponse } from "@/lib/api";

// Step 1.5 — the "Punqle understands the idea" confirmation. Calls the new
// free /ads/understand-idea endpoint once per idea, shows the derived
// summary as a single confirmable sentence rather than a technical form,
// and lets the user tweak the wording before anything is generated.
export function UnderstandingStep({
  ideaText,
  onContinue,
  onBack,
}: {
  ideaText: string;
  onContinue: (understanding: ApiUnderstandIdeaResponse) => void;
  onBack: () => void;
}) {
  const [understanding, setUnderstanding] = useState<ApiUnderstandIdeaResponse | null>(null);
  const [editedSentence, setEditedSentence] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    understandIdea(ideaText)
      .then((r) => {
        if (cancelled) return;
        setUnderstanding(r);
        setEditedSentence(r.summary_sentence);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Couldn't understand that idea — try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaText]);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
        <Sparkles className="h-6 w-6" />
      </div>

      {loading && (
        <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Understanding your idea...
        </div>
      )}

      {error && (
        <p className="mb-6 flex items-center gap-1.5 text-sm font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {understanding && !loading && (
        <div className="mb-6 w-full rounded-2xl bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          {!editing ? (
            <div className="flex items-start justify-between gap-3">
              <p className="text-left text-base font-medium text-foreground">{editedSentence}</p>
              <button
                onClick={() => setEditing(true)}
                className="shrink-0 rounded-full bg-secondary p-2 text-secondary-foreground"
                aria-label="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <textarea
              value={editedSentence}
              onChange={(e) => setEditedSentence(e.target.value)}
              onBlur={() => setEditing(false)}
              autoFocus
              rows={2}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-left text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}
        </div>
      )}

      <div className="flex w-full gap-2">
        <button
          onClick={onBack}
          className="flex items-center justify-center gap-1.5 rounded-full bg-secondary px-5 py-4 text-sm font-semibold text-secondary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          onClick={() => understanding && onContinue({ ...understanding, summary_sentence: editedSentence })}
          disabled={!understanding || loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-4 text-base font-semibold text-primary-foreground disabled:opacity-60"
          style={{ background: "var(--gradient-primary)" }}
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
