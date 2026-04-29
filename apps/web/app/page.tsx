import type { TmdbMovieSearchItem } from '@moviehub/shared-types';
import Link from 'next/link';
import { TopMoviesGrid } from '@/components/top-movies-grid';
import { getTopMovies } from '@/lib/movies-api';

export default async function Home() {
  let topMovies: TmdbMovieSearchItem[] = [];
  try {
    topMovies = await getTopMovies(8);
  } catch {
    topMovies = [];
  }

  return (
    <div className="space-y-8">
      <section className="app-panel space-y-5 p-8">
        <div className="inline-flex w-fit rounded-full border border-blue-700/70 bg-blue-950/60 px-3 py-1 text-xs text-blue-200">
          Welcome back to MovieHub
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-100">
          Discover, track, and rate your next favorite movie.
        </h1>
        <p className="max-w-3xl text-slate-300">
          Search TMDB, save to watchlist, mark watched, and keep your personal movie hub
          clean and organized in one place.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/search" className="btn-primary">
            Start searching
          </Link>
          <Link href="/watchlist" className="btn-ghost">
            Open watchlist
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-blue-100">Top 8 Films</h2>
          <Link href="/search" className="text-sm text-blue-300 hover:text-blue-200">
            See more in search
          </Link>
        </div>
        {topMovies.length > 0 ? (
          <TopMoviesGrid movies={topMovies} />
        ) : (
          <div className="app-panel p-4 text-sm text-slate-300">
            Top movies are temporarily unavailable. You can still use search and watchlist.
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/search"
          className="app-panel p-6 transition hover:border-blue-500/80"
        >
          <h2 className="text-xl font-semibold text-blue-100">Smart Search</h2>
          <p className="mt-2 text-sm text-slate-300">
            Find movies from TMDB, open details fast, and add to watchlist in one click.
          </p>
        </Link>
        <Link
          href="/watchlist"
          className="app-panel p-6 transition hover:border-blue-500/80"
        >
          <h2 className="text-xl font-semibold text-blue-100">Personal Watchlist</h2>
          <p className="mt-2 text-sm text-slate-300">
            Track what to watch and what is done, then keep your list clean.
          </p>
        </Link>
      </section>
    </div>
  );
}
