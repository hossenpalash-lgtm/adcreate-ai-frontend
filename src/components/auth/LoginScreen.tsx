import { useState } from "react";
import { Calendar, Clapperboard, Loader2, Megaphone, Palette, Sparkles } from "lucide-react";
import { signInWithPassword, signUpWithPassword } from "@/lib/supabase";

// Desktop-only decorative cards around the login form — illustrative
// icon+caption chips for real Punqle features (not fake AI-photo
// screenshots pretending to be genuine output), giving the page some
// of the "scattered, alive" energy of Arcads' own hero without
// claiming a photorealistic result Punqle didn't actually generate.
const FLOATING_CARDS: {
  icon: typeof Megaphone;
  caption: string;
  className: string;
  rotate: number;
}[] = [
  { icon: Megaphone, caption: "New summer collection", className: "left-[6%] top-[14%]", rotate: -6 },
  { icon: Calendar, caption: "7 posts, one click", className: "right-[7%] top-[10%]", rotate: 5 },
  { icon: Clapperboard, caption: "8-second video ad", className: "left-[8%] bottom-[16%]", rotate: 4 },
  { icon: Palette, caption: "Your brand, every time", className: "right-[6%] bottom-[12%]", rotate: -4 },
];

export function LoginScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupMessage, setSignupMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    setSignupMessage(null);
    try {
      if (mode === "signin") {
        const { error } = await signInWithPassword(email.trim(), password);
        if (error) throw error;
      } else {
        const { data, error } = await signUpWithPassword(email.trim(), password);
        if (error) throw error;
        // If email confirmation is on, there's no session yet after
        // sign-up — tell the user to check their inbox instead of
        // silently doing nothing.
        if (!data.session) {
          setSignupMessage("Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-10">
      {FLOATING_CARDS.map(({ icon: Icon, caption, className, rotate }) => (
        <div
          key={caption}
          className={`absolute z-0 hidden w-40 items-center gap-2 rounded-2xl bg-card p-3 lg:flex ${className}`}
          style={{ boxShadow: "var(--shadow-card)", transform: `rotate(${rotate}deg)` }}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-foreground">{caption}</span>
        </div>
      ))}

      <div className="relative z-10 mb-8 flex flex-col items-center gap-2 text-center">
        <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
          <Sparkles className="h-3 w-3" />
          AI ad creation, made simple
        </span>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="font-display text-2xl font-extrabold text-foreground">Punqle</h1>
        <p className="text-sm text-muted-foreground">
          AI-generated ads <span className="font-display italic">and content plans</span> for small businesses
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-sm">
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {signupMessage && (
          <p className="mb-4 rounded-xl bg-success/10 p-3 text-sm font-medium text-success">{signupMessage}</p>
        )}
        {error && <p className="mb-4 text-sm font-medium text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !email.trim() || !password}
          className="flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-base font-semibold text-primary-foreground disabled:opacity-60"
          style={{ background: "var(--gradient-primary)" }}
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : mode === "signin" ? (
            "Sign in"
          ) : (
            "Create account"
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "signin" ? "signup" : "signin"));
            setError(null);
            setSignupMessage(null);
          }}
          className="mt-4 w-full text-center text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </form>

      <p className="relative z-10 mt-10 text-center text-xs text-muted-foreground">
        Punqle is operated by HOSSEN, MD MOSHARRAF &middot; ABN 47 183 516 336
      </p>
    </main>
  );
}
