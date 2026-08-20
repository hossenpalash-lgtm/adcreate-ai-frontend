import { ArrowRight, Loader2, Shuffle } from "lucide-react";
import { useState } from "react";
import { fetchIdeaLabsIdeas } from "@/lib/api";
import { IDEA_CHIPS } from "@/lib/social-wizard";

// Step 1 of the Social Content wizard — a single conversational input
// instead of the old multi-field form. Chips are plain client-side text
// prefixes (no API); "Surprise me" is the one real AI call here, reusing
// the existing free /ads/idea-labs endpoint (category-grounded ideas)
// rather than a new "surprise" endpoint.
export function IdeaStep({
  value,
  onChange,
  onContinue,
}: {
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
}) {
  const [surprising, setSurprising] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChip = (chip: string) => {
    onChange(value.trim() ? `${chip}: ${value}` : `${chip}: `);
  };

  const handleSurprise = async () => {
    if (surprising) return;
    setSurprising(true);
    setError(null);
    try {
      const r = await fetchIdeaLabsIdeas();
      if (r.ideas.length > 0) {
        onChange(r.ideas[Math.floor(Math.random() * r.ideas.length)]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't get an idea right now.");
    } finally {
      setSurprising(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="font-display mb-2 text-2xl font-extrabold text-foreground">
        What do you want to post?
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Tell Punqle in your own words — no design experience needed.
      </p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tell Punqle what you want to post about..."
        rows={4}
        autoFocus
        className="mb-4 w-full rounded-2xl border border-input bg-background px-4 py-3.5 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <div className="mb-2 flex flex-wrap justify-center gap-2">
        {IDEA_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => handleChip(chip)}
            className="rounded-full bg-secondary px-3.5 py-1.5 text-xs font-medium text-secondary-foreground"
          >
            {chip}
          </button>
        ))}
      </div>

      <button
        onClick={handleSurprise}
        disabled={surprising}
        className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-60"
      >
        {surprising ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shuffle className="h-3.5 w-3.5" />}
        Surprise me
      </button>

      {error && <p className="mb-4 text-sm font-medium text-destructive">{error}</p>}

      <button
        onClick={onContinue}
        disabled={!value.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-base font-semibold text-primary-foreground disabled:opacity-60"
        style={{ background: "var(--gradient-primary)" }}
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
