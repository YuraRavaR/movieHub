import type {
  MovieStatusItem,
  TmdbMovieSearchItem,
  UpdateMovieStatusRequest,
  UpsertMovieStatusRequest,
} from '@moviehub/shared-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function getMovieStatuses(
  userEmail: string,
): Promise<MovieStatusItem[]> {
  const response = await fetch(
    `${API_BASE_URL}/movies/status/${encodeURIComponent(userEmail)}`,
    {
      cache: 'no-store',
    },
  );

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
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to search movies: ${response.status}`);
  }

  return (await response.json()) as TmdbMovieSearchItem[];
}

export async function updateMovieStatus(
  userEmail: string,
  tmdbId: number,
  payload: UpdateMovieStatusRequest,
): Promise<MovieStatusItem> {
  const response = await fetch(
    `${API_BASE_URL}/movies/status/${encodeURIComponent(userEmail)}/${tmdbId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to update status: ${response.status}`);
  }

  return (await response.json()) as MovieStatusItem;
}

export async function deleteMovieStatus(
  userEmail: string,
  tmdbId: number,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/movies/status/${encodeURIComponent(userEmail)}/${tmdbId}`,
    {
      method: 'DELETE',
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to delete status: ${response.status}`);
  }
}
