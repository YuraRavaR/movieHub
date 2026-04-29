'use client';

import { useState } from 'react';
import type { TmdbMovieSearchItem } from '@moviehub/shared-types';
import { upsertMovieStatus } from '@/lib/movies-api';
import { MoviePoster } from '@/components/movie-poster';

type TopMoviesGridProps = {
  movies: TmdbMovieSearchItem[];
};

export function TopMoviesGrid({ movies }: TopMoviesGridProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<number[]>([]);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const addToWatchlist = async (movie: TmdbMovieSearchItem) => {
    setPendingId(movie.tmdbId);
    setMessage(null);
    try {
      await upsertMovieStatus({
        tmdbId: movie.tmdbId,
        title: movie.title,
        posterPath: movie.posterPath,
        status: 'WATCHLIST',
      });
      setAddedIds((prev) => (prev.includes(movie.tmdbId) ? prev : [...prev, movie.tmdbId]));
      setMessage(`Added "${movie.title}" to watchlist.`);
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Add failed.';
      setMessage(text);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-3">
      {message ? (
        <p className="rounded-md border border-blue-800/70 bg-slate-900 px-3 py-2 text-sm text-slate-200">
          {message}
        </p>
      ) : null}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {movies.map((movie) => {
          const isAdded = addedIds.includes(movie.tmdbId);
          const isPending = pendingId === movie.tmdbId;
          return (
            <li
              key={movie.tmdbId}
              className="app-panel flex items-start gap-3 p-3 transition hover:border-blue-600/80"
            >
              <MoviePoster title={movie.title} posterPath={movie.posterPath} size="md" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold leading-5 text-blue-100">
                    {movie.title}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    {movie.releaseDate ?? 'Unknown release date'}
                  </div>
                  {movie.voteAverage !== null ? (
                    <div className="mt-1 text-xs text-blue-300">Rating: {movie.voteAverage}/10</div>
                  ) : null}
                  {movie.genres.length > 0 ? (
                    <div className="mt-1 text-xs text-slate-300">
                      {movie.genres.slice(0, 2).join(' • ')}
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => void addToWatchlist(movie)}
                  disabled={isAdded || isPending}
                  className="btn-primary mt-2 h-8 w-full text-xs disabled:opacity-60"
                >
                  {isAdded ? 'Added ✓' : isPending ? 'Adding...' : 'Add to Watchlist'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
