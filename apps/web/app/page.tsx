import type { HealthResponse } from "@moviehub/shared-types";
import Link from "next/link";

export default function Home() {
  const expectedHealthShape: Pick<HealthResponse, "status" | "service"> = {
    status: "ok",
    service: "moviehub-api",
  };

  return (
    <div className="space-y-6">
      <section className="app-panel space-y-4 p-8">
        <h1 className="text-3xl font-bold tracking-tight">MovieHub</h1>
        <p className="text-slate-300">
          Movie database with TMDB search, watchlist management, and scalable full-stack architecture.
        </p>
        <div className="rounded-lg border border-blue-900/60 bg-slate-950 p-4 text-sm text-slate-300">
          API health contract preview: {expectedHealthShape.status} /{" "}
          {expectedHealthShape.service}
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/search"
          className="app-panel p-6 transition hover:border-blue-500/80"
        >
          <h2 className="text-xl font-semibold">Search Movies</h2>
          <p className="mt-2 text-sm text-slate-300">
            Find movies from TMDB with posters and add them to your watchlist.
          </p>
        </Link>
        <Link
          href="/watchlist"
          className="app-panel p-6 transition hover:border-blue-500/80"
        >
          <h2 className="text-xl font-semibold">Watchlist</h2>
          <p className="mt-2 text-sm text-slate-300">
            Manage statuses, mark movies as watched, and clean up your list.
          </p>
        </Link>
      </section>
    </div>
  );
}
