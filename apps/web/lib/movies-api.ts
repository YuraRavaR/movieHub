import type {
  MovieStatusItem,
  TmdbMovieSearchItem,
  UpdateMovieStatusRequest,
  UpsertMovieStatusRequest,
} from '@moviehub/shared-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function getMovieStatuses(): Promise<MovieStatusItem[]> {
  const response = await fetch(`${API_BASE_URL}/movies/status/me`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch statuses: ${response.status}`);
  }

  return (await response.json()) as MovieStatusItem[];
}

export async function upsertMovieStatus(
  payload: UpsertMovieStatusRequest,
): Promise<MovieStatusItem> {
  const response = await fetch(`${API_BASE_URL}/movies/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to upsert status: ${response.status}`);
  }

  return (await response.json()) as MovieStatusItem;
}

export async function searchMovies(query: string): Promise<TmdbMovieSearchItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/movies/search?query=${encodeURIComponent(query)}`,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to search movies: ${response.status}`);
  }

  return (await response.json()) as TmdbMovieSearchItem[];
}

export async function getTopMovies(limit = 8): Promise<TmdbMovieSearchItem[]> {
  const response = await fetch(`${API_BASE_URL}/movies/top`, {
    cache: 'no-store',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch top movies: ${response.status}`);
  }

  const items = (await response.json()) as TmdbMovieSearchItem[];
  return items.slice(0, limit);
}

export async function updateMovieStatus(
  tmdbId: number,
  payload: UpdateMovieStatusRequest,
): Promise<MovieStatusItem> {
  const response = await fetch(`${API_BASE_URL}/movies/status/${tmdbId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to update status: ${response.status}`);
  }

  return (await response.json()) as MovieStatusItem;
}

export async function deleteMovieStatus(
  tmdbId: number,
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/movies/status/${tmdbId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete status: ${response.status}`);
  }
}
