import { createClient, type Session } from "@supabase/supabase-js";

// Safe to embed client-side — this is the anon/public key, scoped by
// Row Level Security on the database, not by secrecy.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// This module is imported from __root.tsx, which also renders during
// SSR — where `window`/`localStorage` don't exist. Supabase's auth
// client touches those for session persistence and URL-based session
// detection, which can throw during server-side rendering unless
// explicitly disabled outside the browser.
const isBrowser = typeof window !== "undefined";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: isBrowser,
  },
});

export function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function signUpWithPassword(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export function signOut() {
  return supabase.auth.signOut();
}

export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export type { Session };
