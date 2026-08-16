import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  useNavigate,
  useSearch,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import appCss from "../styles.css?url";
import { supabase, signOut, type Session } from "../lib/supabase";
import { Sentry } from "../lib/sentry";
import { LoginScreen } from "../components/auth/LoginScreen";
import { BrandKitPanel } from "../components/ads/BrandKitPanel";
import { Sidebar, type NavTab } from "../components/Sidebar";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <h1 className="text-6xl font-bold text-foreground">404</h1>
        <p className="mt-3 text-muted-foreground">Page not found</p>
        <a
          href="/"
          className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
        >
          Back to AdCreate.AI
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div className="max-w-sm">
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again in a moment.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#ffffff" },
      { title: "AdCreate.AI — AI ads for small businesses" },
      {
        name: "description",
        content: "Generate Facebook ad copy, banner images, and weekly content plans for your small business with AI.",
      },
      { property: "og:title", content: "AdCreate.AI — AI ads for small businesses" },
      {
        property: "og:description",
        content: "Generate Facebook ad copy, banner images, and weekly content plans with AI.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // undefined = still checking for an existing session, null = signed out
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [brandKitOpen, setBrandKitOpen] = useState(false);
  const navigate = useNavigate();
  // strict: false — root wraps every route generically, so it can't
  // assume it's on "/" the way index.tsx's own Route.useSearch() can.
  // There's only one real route today, but this keeps root decoupled
  // from that route's specifics.
  const search = useSearch({ strict: false }) as { tab?: string };
  const tab: NavTab =
    search.tab === "plan"
      ? "plan"
      : search.tab === "history"
        ? "history"
        : search.tab === "competitor"
          ? "competitor"
          : "single";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen w-full flex-col bg-background lg:flex-row">
        {session === undefined ? (
          <main className="flex min-h-screen w-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </main>
        ) : session === null ? (
          <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
            <LoginScreen />
          </div>
        ) : (
          <>
            <Sidebar
              tab={tab}
              onNavigate={(t) => navigate({ to: "/", search: { tab: t } })}
              onOpenBrandKit={() => setBrandKitOpen(true)}
              onSignOut={() => signOut()}
            />
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col lg:max-w-3xl">
              <Outlet />
            </div>
            <BrandKitPanel open={brandKitOpen} onClose={() => setBrandKitOpen(false)} />
          </>
        )}
      </div>
    </QueryClientProvider>
  );
}
