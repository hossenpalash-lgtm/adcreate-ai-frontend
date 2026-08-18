import { useEffect, useRef, useState } from "react";
import {
  Binoculars,
  Calendar,
  Clapperboard,
  Clock,
  Gift,
  Loader2,
  Megaphone,
  Package,
  Palette,
  Sparkles,
} from "lucide-react";
import { signInWithPassword, signUpWithPassword } from "@/lib/supabase";
import { useScrolled } from "@/lib/use-scrolled";
import { AIToolMarquee } from "@/components/ToolMarquee";
import { WorkflowShowcase } from "@/components/auth/WorkflowShowcase";

// Desktop-only floating photo cards around the login form — real
// product-ad images generated once through Punqle's own /ads/generate
// endpoint (genuine output, not stock photos or fake AI-photo
// screenshots), each with a short feature caption overlaid at the
// bottom like a real social post. Positions use calc() (not
// translate-x-1/2) for the center-column/middle-row cards specifically
// so the static placement doesn't fight with the animated `transform`
// on the same element. Each spreadX/spreadY points back toward the
// hero's center — that's where the radial burst-in animation starts.
const FLOATING_CARDS: {
  image: string;
  icon: typeof Megaphone;
  caption: string;
  className: string;
  rotate: number;
  spreadX: string;
  spreadY: string;
}[] = [
  { image: "/hero-cards/bakery.jpg", icon: Megaphone, caption: "New summer collection", className: "left-[4%] top-[110px]", rotate: -4, spreadX: "200px", spreadY: "150px" },
  { image: "/hero-cards/florist.jpg", icon: Clapperboard, caption: "8-second video ad", className: "right-[4%] top-[110px]", rotate: -5, spreadX: "-200px", spreadY: "150px" },
  { image: "/hero-cards/ceramic-mug.jpg", icon: Palette, caption: "Your brand, every time", className: "left-[2%] top-[calc(50%-70px)]", rotate: 4, spreadX: "200px", spreadY: "0px" },
  { image: "/hero-cards/skincare.jpg", icon: Clock, caption: "Reuse your best posts", className: "right-[2%] top-[calc(50%-70px)]", rotate: -3, spreadX: "-200px", spreadY: "0px" },
  { image: "/hero-cards/chocolate.jpg", icon: Binoculars, caption: "See what competitors do", className: "left-[4%] bottom-[8%]", rotate: 5, spreadX: "200px", spreadY: "-150px" },
  { image: "/hero-cards/leather-wallet.jpg", icon: Gift, caption: "Earn free credits", className: "right-[4%] bottom-[8%]", rotate: 3, spreadX: "-200px", spreadY: "-150px" },
];

// Left-to-right character-decode reveal: characters past the "locked"
// boundary cycle through random letters, boundary advances each tick,
// settling on the real text — the scramble/glitch headline reveal.
function ScrambleText({ text, className }: { text: string; className?: string }) {
  const [display, setDisplay] = useState(text);
  const ranRef = useRef(false);
  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const steps = 16;
    let step = 0;
    const id = setInterval(() => {
      step++;
      const lockedCount = Math.ceil((step / steps) * text.length);
      setDisplay(
        text
          .split("")
          .map((ch, i) => (i < lockedCount || ch === " " ? ch : chars[Math.floor(Math.random() * chars.length)]))
          .join(""),
      );
      if (step >= steps) {
        setDisplay(text);
        clearInterval(id);
      }
    }, 35);
    return () => clearInterval(id);
  }, [text]);
  return <span className={className}>{display}</span>;
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

export function LoginScreen() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupMessage, setSignupMessage] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const scrolled = useScrolled();

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
      {/* Floating frosted-glass top nav — logo left, single CTA right
          (mirrors Arcads' "Login or Sign up" pattern). Since this page
          already IS the sign-in/sign-up form, the CTA toggles mode
          instead of navigating elsewhere — same action as the "New
          here?" link below, just surfaced as the premium nav pill. */}
      <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4 sm:px-6">
        <div
          className={[
            "glass-nav flex w-full max-w-[1160px] items-center justify-between rounded-[20px] px-5 py-3",
            scrolled ? "glass-nav-scrolled" : "",
          ].join(" ")}
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-display text-base font-extrabold tracking-tight text-foreground">Punqle</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "signin" ? "signup" : "signin"));
              setFormVisible(true);
              setError(null);
              setSignupMessage(null);
            }}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "var(--gradient-primary)" }}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </div>
      </header>

      {FLOATING_CARDS.map(({ image, icon: Icon, caption, className, rotate, spreadX, spreadY }, i) => (
        <div
          key={caption}
          className={`animate-card-spread absolute z-0 hidden w-36 overflow-hidden rounded-2xl lg:block ${className}`}
          style={
            {
              boxShadow: "var(--shadow-card)",
              "--spread-x": spreadX,
              "--spread-y": spreadY,
              "--spread-rotate": `${rotate}deg`,
              animationDelay: `${100 + i * 60}ms`,
            } as React.CSSProperties
          }
        >
          <img src={image} alt="" className="h-56 w-full object-cover" loading="lazy" />
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/70 to-transparent px-2.5 pb-2 pt-6">
            <Icon className="h-3 w-3 shrink-0 text-white" />
            <span className="text-[11px] font-semibold leading-tight text-white">{caption}</span>
          </div>
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
        <h1 className="font-display text-2xl font-extrabold text-foreground" aria-label="Punqle">
          <ScrambleText text="Punqle" />
        </h1>
        <p className="text-sm text-muted-foreground">
          AI-generated ads <span className="font-display italic">and content plans</span> for small businesses
        </p>
      </div>

      {!formVisible ? (
        // Default state: two buttons only, matching Arcads' own hero
        // pattern — no form fields until the user actually commits to
        // signing in. "Continue with Google" is present but disabled:
        // real Google sign-in needs a Google Cloud OAuth app + Supabase
        // provider setup that hasn't been done yet, so this stays
        // honestly non-functional rather than faking it.
        <div className="relative z-10 flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setFormVisible(true)}
            className="flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "var(--gradient-primary)" }}
          >
            Create Your AI Ad
            <Sparkles className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3.5 text-base font-semibold text-foreground opacity-60 disabled:cursor-not-allowed"
          >
            Continue with Google
            <GoogleIcon />
          </button>
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-sm animate-splash-in">
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
            autoFocus
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
      </form>
      )}

      <WorkflowShowcase />

      <div className="relative z-10 mt-14 w-full">
        <AIToolMarquee />
      </div>

      <p className="relative z-10 mt-6 text-center text-xs text-muted-foreground">
        Punqle is operated by HOSSEN, MD MOSHARRAF &middot; ABN 47 183 516 336
      </p>
    </main>
  );
}
