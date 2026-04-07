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
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [watchlistAddedIds, setWatchlistAddedIds] = useState<number[]>([]);
  const [watchedAddedIds, setWatchedAddedIds] = useState<number[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [sortOrder, setSortOrder] = useState<SortOrder>('NEWEST');
  const [activeResultIndex, setActiveResultIndex] = useState<number>(-1);
  const [suggestions, setSuggestions] = useState<TmdbMovieSearchItem[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState<number>(-1);

  const showPopup = useCallback((text: string) => {
    setPopupMessage(text);
    window.setTimeout(() => setPopupMessage(null), 3500);
  }, []);

  const handleError = useCallback(
    (error: unknown, fallback: string) => {
      const text = error instanceof Error ? error.message : fallback;
      if (text.toLowerCase().includes('unauthorized')) {
        showPopup('Session expired or not logged in. Please login to manage your list.');
        return;
      }
      setMessage(text);
    },
    [showPopup],
  );

  const loadStatuses = useCallback(async () => {
    try {
      const data = await getMovieStatuses();
      setStatuses(data);
    } catch (error) {
      handleError(error, 'Failed to load statuses.');
    }
  }, [handleError]);

  useEffect(() => {
    if (!showStatuses) return;
    void loadStatuses();
  }, [loadStatuses, showStatuses]);

  const runSearch = async (rawQuery: string) => {
    const normalizedQuery = rawQuery.trim();
    if (normalizedQuery.length < 2) {
      setMessage('Enter at least 2 characters.');
      return;
    }

    setLoading(true);
    setMessage(null);
    setShowSuggestions(false);
    try {
      const data = await searchMovies(normalizedQuery);
      setResults(data);
      setActiveResultIndex(data.length > 0 ? 0 : -1);
      if (data.length === 0) setMessage('No results found.');
    } catch (error) {
      handleError(error, 'Search failed.');
      setResults([]);
      setActiveResultIndex(-1);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = async () => {
    await runSearch(query);
  };

  const chooseSuggestion = (movie: TmdbMovieSearchItem) => {
    setHighlightedSuggestionIndex(-1);
    setQuery(movie.title);
    void runSearch(movie.title);
  };

  useEffect(() => {
    if (!showSearch) return;
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2 || !showSuggestions) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      setHighlightedSuggestionIndex(-1);
      return;
    }

    setSuggestionsLoading(true);
    const timerId = window.setTimeout(() => {
      void searchMovies(normalizedQuery)
        .then((data) => {
          const nextSuggestions = data.slice(0, 6);
          setSuggestions(nextSuggestions);
          setHighlightedSuggestionIndex(nextSuggestions.length > 0 ? 0 : -1);
        })
        .catch(() => {
          setSuggestions([]);
          setHighlightedSuggestionIndex(-1);
        })
        .finally(() => {
          setSuggestionsLoading(false);
        });
    }, 250);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [query, showSearch, showSuggestions]);

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
        const text = error instanceof Error ? error.message : 'Search failed.';
        if (text.toLowerCase().includes('unauthorized')) {
          showPopup('Session expired or not logged in. Please login to manage your list.');
        } else {
          setMessage(text);
        }
        setResults([]);
        setActiveResultIndex(-1);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams, showPopup, showSearch]);

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
      handleError(error, 'Add failed.');
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
      handleError(error, 'Add failed.');
    }
  };

  const markAsWatched = async (item: MovieStatusItem) => {
    try {
      await updateMovieStatus(item.tmdbId, { status: 'WATCHED' });
      setMessage(`Marked "${item.title}" as watched.`);
      await loadStatuses();
    } catch (error) {
      handleError(error, 'Update failed.');
    }
  };

  const removeFromList = async (item: MovieStatusItem) => {
    try {
      await deleteMovieStatus(item.tmdbId);
      setMessage(`Removed "${item.title}" from list.`);
      await loadStatuses();
    } catch (error) {
      handleError(error, 'Delete failed.');
    }
  };

  const onSearchInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const hasVisibleSuggestions = showSuggestions && suggestions.length > 0;

    if (event.key === 'ArrowDown' && hasVisibleSuggestions) {
      event.preventDefault();
      setHighlightedSuggestionIndex((prev) =>
        Math.min(prev + 1, suggestions.length - 1),
      );
      return;
    }

    if (event.key === 'ArrowUp' && hasVisibleSuggestions) {
      event.preventDefault();
      setHighlightedSuggestionIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (
        hasVisibleSuggestions &&
        highlightedSuggestionIndex >= 0 &&
        highlightedSuggestionIndex < suggestions.length
      ) {
        chooseSuggestion(suggestions[highlightedSuggestionIndex]);
        return;
      }
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
      {popupMessage ? (
        <div className="fixed right-4 top-20 z-50 max-w-sm rounded-md border border-amber-400/50 bg-amber-950/90 px-3 py-2 text-sm text-amber-100 shadow-lg">
          {popupMessage}
        </div>
      ) : null}

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
        <div className="space-y-2">
          <div className="relative flex gap-2">
            <input
              className="w-full rounded-md border border-blue-800/70 bg-slate-900 px-3 py-2 text-sm text-slate-100"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                setShowSuggestions(true);
                setHighlightedSuggestionIndex(suggestions.length > 0 ? 0 : -1);
              }}
              onBlur={() => {
                window.setTimeout(() => setShowSuggestions(false), 120);
              }}
              onKeyDown={onSearchInputKeyDown}
              placeholder="e.g. Fight Club"
            />
            {showSuggestions && query.trim().length >= 2 ? (
              <div className="absolute left-0 top-11 z-20 w-[calc(100%-98px)] rounded-md border border-blue-800/70 bg-slate-950 shadow-xl">
                {suggestionsLoading ? (
                  <div className="px-3 py-2 text-xs text-slate-400">Searching suggestions...</div>
                ) : suggestions.length > 0 ? (
                  <ul className="max-h-64 overflow-y-auto py-1">
                    {suggestions.map((item) => (
                      <li key={`suggestion-${item.tmdbId}`}>
                        <button
                          type="button"
                          className={`w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-900 ${
                            suggestions[highlightedSuggestionIndex]?.tmdbId === item.tmdbId
                              ? 'bg-slate-900'
                              : ''
                          }`}
                          onMouseEnter={() => {
                            const nextIndex = suggestions.findIndex(
                              (candidate) => candidate.tmdbId === item.tmdbId,
                            );
                            setHighlightedSuggestionIndex(nextIndex);
                          }}
                          onClick={() => {
                            chooseSuggestion(item);
                          }}
                        >
                          {item.title}
                          {item.releaseDate ? (
                            <span className="ml-2 text-xs text-slate-400">
                              ({item.releaseDate.slice(0, 4)})
                            </span>
                          ) : null}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-3 py-2 text-xs text-slate-400">No suggestions.</div>
                )}
              </div>
            ) : null}
            <button
              type="button"
              onClick={onSearch}
              disabled={loading}
              className="btn-primary disabled:opacity-60"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="rounded-md border border-blue-800/70 bg-slate-900 px-3 py-2 text-slate-200">
          {message}
        </p>
      ) : null}

      {showSearch ? (
        <ul className="space-y-2">
          {results.map((movie) => (
            <MovieCard
              key={movie.tmdbId}
              title={movie.title}
              topMeta={movie.releaseDate ?? 'Unknown year'}
              description={movie.overview}
              genres={movie.genres}
              voteAverage={movie.voteAverage}
              posterPath={movie.posterPath}
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
