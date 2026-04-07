'use client';

import { useCallback, useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import type { MovieStatusItem, TmdbMovieSearchItem } from '@moviehub/shared-types';
import {
  deleteMovieStatus,
  getMovieStatuses,
  searchMovies,
  updateMovieStatus,
  upsertMovieStatus,
} from '@/lib/movies-api';
import { MovieCard } from './movie-card';

type MovieSearchProps = {
  showSearch?: boolean;
  showStatuses?: boolean;
};

type StatusFilter = 'ALL' | 'WATCHLIST' | 'WATCHED';
type SortOrder = 'NEWEST' | 'TITLE_ASC';

export function MovieSearch({
  showSearch = true,
  showStatuses = true,
}: MovieSearchProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [statuses, setStatuses] = useState<MovieStatusItem[]>([]);
  const [results, setResults] = useState<TmdbMovieSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [watchlistAddedIds, setWatchlistAddedIds] = useState<number[]>([]);
  const [watchedAddedIds, setWatchedAddedIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [sortOrder, setSortOrder] = useState<SortOrder>('NEWEST');
  const [activeResultIndex, setActiveResultIndex] = useState<number>(-1);

  const loadStatuses = useCallback(async () => {
    try {
      const data = await getMovieStatuses();
      setStatuses(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load statuses.');
    }
  }, []);

  useEffect(() => {
    void loadStatuses();
  }, [loadStatuses]);

  const onSearch = async () => {
    if (query.trim().length < 2) {
      setMessage('Enter at least 2 characters.');
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const data = await searchMovies(query.trim());
      setResults(data);
      setActiveResultIndex(data.length > 0 ? 0 : -1);
      if (data.length === 0) setMessage('No results found.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Search failed.');
      setResults([]);
      setActiveResultIndex(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialQuery = searchParams.get('query')?.trim() ?? '';
    if (!showSearch || initialQuery.length < 2) return;

    setQuery((prev) => (prev === initialQuery ? prev : initialQuery));
    setLoading(true);
    setMessage(null);

    void searchMovies(initialQuery)
      .then((data) => {
        setResults(data);
        setActiveResultIndex(data.length > 0 ? 0 : -1);
        if (data.length === 0) setMessage('No results found.');
      })
      .catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : 'Search failed.');
        setResults([]);
        setActiveResultIndex(-1);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams, showSearch]);

  const addToWatchlist = async (movie: TmdbMovieSearchItem) => {
    try {
      await upsertMovieStatus({
        tmdbId: movie.tmdbId,
        title: movie.title,
        posterPath: movie.posterPath,
        status: 'WATCHLIST',
      });
      setMessage(`Added "${movie.title}" to watchlist.`);
      setWatchlistAddedIds((prev) =>
        prev.includes(movie.tmdbId) ? prev : [...prev, movie.tmdbId],
      );
      setWatchedAddedIds((prev) => prev.filter((id) => id !== movie.tmdbId));
      await loadStatuses();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Add failed.');
    }
  };

  const addToWatched = async (movie: TmdbMovieSearchItem) => {
    try {
      await upsertMovieStatus({
        tmdbId: movie.tmdbId,
        title: movie.title,
        posterPath: movie.posterPath,
        status: 'WATCHED',
      });
      setMessage(`Added "${movie.title}" to watched.`);
      setWatchedAddedIds((prev) =>
        prev.includes(movie.tmdbId) ? prev : [...prev, movie.tmdbId],
      );
      setWatchlistAddedIds((prev) => prev.filter((id) => id !== movie.tmdbId));
      await loadStatuses();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Add failed.');
    }
  };

  const markAsWatched = async (item: MovieStatusItem) => {
    try {
      await updateMovieStatus(item.tmdbId, { status: 'WATCHED' });
      setMessage(`Marked "${item.title}" as watched.`);
      await loadStatuses();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Update failed.');
    }
  };

  const removeFromList = async (item: MovieStatusItem) => {
    try {
      await deleteMovieStatus(item.tmdbId);
      setMessage(`Removed "${item.title}" from list.`);
      await loadStatuses();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Delete failed.');
    }
  };

  const onSearchInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void onSearch();
      return;
    }

    if (results.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveResultIndex((prev) => {
        if (prev < 0) return 0;
        return Math.min(prev + 1, results.length - 1);
      });
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveResultIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === 'w' || event.key === 'W') {
      if (activeResultIndex >= 0) {
        event.preventDefault();
        void addToWatchlist(results[activeResultIndex]);
      }
      return;
    }

    if (event.key === 'm' || event.key === 'M') {
      if (activeResultIndex >= 0) {
        event.preventDefault();
        void addToWatched(results[activeResultIndex]);
      }
    }
  };

  const visibleStatuses = statuses
    .filter((item) => (filter === 'ALL' ? true : item.status === filter))
    .sort((a, b) => {
      if (sortOrder === 'TITLE_ASC') return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <section className="app-panel space-y-4 p-4 text-sm">
      {showStatuses ? <div className="font-medium text-blue-100">Your movie list</div> : null}
      {showStatuses ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`rounded-md border px-2 py-1 text-xs ${
              filter === 'ALL' ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter('WATCHLIST')}
            className={`rounded-md border px-2 py-1 text-xs ${
              filter === 'WATCHLIST' ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            Watchlist
          </button>
          <button
            type="button"
            onClick={() => setFilter('WATCHED')}
            className={`rounded-md border px-2 py-1 text-xs ${
              filter === 'WATCHED' ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            Watched
          </button>
          <select
            className="rounded-md border border-blue-800/70 bg-slate-900 px-2 py-1 text-xs"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
          >
            <option value="NEWEST">Sort: newest</option>
            <option value="TITLE_ASC">Sort: title A-Z</option>
          </select>
        </div>
      ) : null}

      {showStatuses && statuses.length === 0 ? (
        <p className="text-slate-300">No statuses yet.</p>
      ) : null}
      {showStatuses ? (
        <ul className="space-y-2">
          {visibleStatuses.map((item) => (
            <MovieCard
              key={`${item.tmdbId}-${item.status}`}
              title={item.title}
              topMeta={item.status}
              posterPath={item.posterPath}
              actions={
                <>
                  {item.status !== 'WATCHED' ? (
                    <button
                      type="button"
                      onClick={() => markAsWatched(item)}
                      className="btn-ghost w-36"
                    >
                      Mark Watched
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeFromList(item)}
                      className="btn-ghost w-36"
                  >
                    Remove
                  </button>
                </>
              }
            />
          ))}
        </ul>
      ) : null}

      {showSearch ? (
        <div className="font-medium text-blue-100">Search TMDB and add to watchlist</div>
      ) : null}
      {showSearch ? (
        <div className="flex gap-2">
          <input
            className="w-full rounded-md border border-blue-800/70 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onSearchInputKeyDown}
            placeholder="e.g. fight club"
          />
          <button
            type="button"
            onClick={onSearch}
            disabled={loading}
            className="btn-primary disabled:opacity-60"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      ) : null}

      {message ? (
        <p className="rounded-md border border-blue-800/70 bg-slate-900 px-3 py-2 text-slate-200">
          {message}
        </p>
      ) : null}

      {showSearch ? (
        <ul className="space-y-2">
          {results.map((movie, index) => (
            <MovieCard
              key={movie.tmdbId}
              title={movie.title}
              topMeta={movie.releaseDate ?? 'Unknown year'}
              description={movie.overview}
              genres={movie.genres}
              voteAverage={movie.voteAverage}
              posterPath={movie.posterPath}
              subtitle={
                activeResultIndex === index
                  ? 'Selected (↑/↓ navigate, W watchlist, M watched)'
                  : undefined
              }
              actions={
                <>
                  <button
                    type="button"
                    onClick={() => addToWatchlist(movie)}
                    className="btn-primary w-36"
                  >
                    {watchlistAddedIds.includes(movie.tmdbId)
                      ? 'Added ✓'
                      : 'Add to Watchlist'}
                  </button>
                  <button
                    type="button"
                    onClick={() => addToWatched(movie)}
                    className="btn-ghost w-36"
                  >
                    {watchedAddedIds.includes(movie.tmdbId)
                      ? 'Watched ✓'
                      : 'Mark Watched'}
                  </button>
                </>
              }
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
