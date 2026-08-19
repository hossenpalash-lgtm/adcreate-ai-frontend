import { Check, Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createCheckoutSession,
  createPortalSession,
  fetchSubscriptionStatus,
  type ApiSubscriptionStatus,
  type SubscriptionTier,
} from "@/lib/api";

const TIERS: { tier: SubscriptionTier; label: string; price: string; credits: number; blurb: string }[] = [
  { tier: "starter", label: "Starter", price: "A$5.99", credits: 30, blurb: "Try it out with a steady monthly supply." },
  { tier: "growth", label: "Growth", price: "A$19", credits: 110, blurb: "For posting regularly across your channels." },
  { tier: "pro", label: "Pro", price: "A$44.99", credits: 300, blurb: "For agencies or a high volume of ads." },
];

// Checkout and the customer portal are both hosted by Stripe — this panel
// only ever redirects the whole browser there and back (?billing=success
// or ?billing=cancelled on return), same pattern as the Shopify OAuth
// round-trip in ProductCatalogPanel. No card data ever touches Punqle.
export function BillingPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<ApiSubscriptionStatus | null>(null);
  const [pendingTier, setPendingTier] = useState<SubscriptionTier | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  // Captured once at the panel's true first mount (a lazy initializer runs
  // during render, before any effect) — reading window.location.search
  // from inside the `open`-triggered effect below was racing the router's
  // own URL normalization, which strips unrecognised params like
  // `billing` and had usually already won by the time that effect ran,
  // silently swallowing the success/cancelled notice.
  const [initialBillingResult] = useState(() => new URLSearchParams(window.location.search).get("billing"));

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    setNotice(null);

    if (initialBillingResult === "success") {
      setNotice("You're subscribed! It may take a few seconds for your credits to appear.");
    } else if (initialBillingResult === "cancelled") {
      setNotice("Checkout was cancelled — no charge was made.");
    }
    // Best-effort cleanup — harmless if the router already normalised the
    // URL and `billing` is gone by now.
    const params = new URLSearchParams(window.location.search);
    if (params.has("billing")) {
      params.delete("billing");
      const newSearch = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (newSearch ? `?${newSearch}` : ""));
    }

    fetchSubscriptionStatus()
      .then(setStatus)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load your subscription."))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const handleChoose = async (tier: SubscriptionTier) => {
    setPendingTier(tier);
    setError(null);
    try {
      const { checkout_url } = await createCheckoutSession(tier);
      window.location.href = checkout_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout.");
      setPendingTier(null);
    }
  };

  const handleManage = async () => {
    setOpeningPortal(true);
    setError(null);
    try {
      const { portal_url } = await createPortalSession();
      window.location.href = portal_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open the billing portal.");
      setOpeningPortal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6">
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-card p-6 sm:rounded-3xl"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-extrabold text-foreground">Plans &amp; billing</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {notice && (
          <div className="mb-4 rounded-2xl bg-secondary/60 p-4 text-sm font-medium text-secondary-foreground">
            {notice}
          </div>
        )}
        {error && <p className="mb-4 text-sm font-medium text-destructive">{error}</p>}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : status?.subscribed ? (
          <div className="rounded-2xl border border-input bg-background p-5">
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="mt-1 font-display text-xl font-extrabold capitalize text-foreground">{status.tier}</p>
            {status.current_period_end && (
              <p className="mt-1 text-xs text-muted-foreground">
                Renews {new Date(status.current_period_end).toLocaleDateString()}
              </p>
            )}
            <button
              onClick={handleManage}
              disabled={openingPortal}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {openingPortal && <Loader2 className="h-4 w-4 animate-spin" />}
              Manage subscription
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {TIERS.map(({ tier, label, price, credits, blurb }) => (
              <div
                key={tier}
                className="flex flex-col rounded-2xl border border-input bg-background p-5"
              >
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="mt-2 font-display text-2xl font-extrabold text-foreground">
                  {price}
                  <span className="text-sm font-medium text-muted-foreground">/mo</span>
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  {credits} credits / month
                </p>
                <p className="mt-2 flex-1 text-xs text-muted-foreground">{blurb}</p>
                <button
                  onClick={() => handleChoose(tier)}
                  disabled={pendingTier !== null}
                  className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {pendingTier === tier && <Loader2 className="h-4 w-4 animate-spin" />}
                  Choose {label}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
