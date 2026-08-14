import * as Sentry from "@sentry/react";

// This module is imported from __root.tsx, which also renders during
// SSR — where `window` doesn't exist. Sentry's browser SDK touches
// browser globals during init, so it's guarded to only run client-side,
// same pattern as the Supabase client in ./supabase.ts. DSN is env-driven
// (unlike Baki.AI's hardcoded one) since this is a separate Sentry project;
// Sentry stays off entirely if it isn't set.
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

if (typeof window !== "undefined" && SENTRY_DSN) {
  Sentry.init({ dsn: SENTRY_DSN });
}

export { Sentry };
