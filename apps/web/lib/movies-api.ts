import type {
  MovieStatusItem,
  TmdbMovieSearchItem,
  UpdateMovieStatusRequest,
  UpsertMovieStatusRequest,
} from '@moviehub/shared-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(payload.message) && payload.message.length > 0) {
      return payload.message.join(', ');
    }
    if (typeof payload.message === 'string' && payload.message.trim().length > 0) {
      return payload.message;
    }
  } catch {
    // Ignore parse issues and use fallback message.
  }

  return fallback;
}

function getNetworkErrorMessage(): string {
  return `Cannot reach API at ${API_BASE_URL}. Check that backend is running, CORS is configured, and NEXT_PUBLIC_API_URL is correct.`;
}

async function requestJson<T>(input: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch {
    throw new Error(getNetworkErrorMessage());
  }

  if (!response.ok) {
    const fallback = `Request failed (${response.status} ${response.statusText})`;
    const message = await parseErrorMessage(response, fallback);
    throw new Error(message);
  }

  return (await response.json()) as T;
}

async function requestVoid(input: string, init?: RequestInit): Promise<void> {
  let response: Response;
  try {
    response = await fetch(input, init);
  } catch {
    throw new Error(getNetworkErrorMessage());
  }

  if (!response.ok) {
    const fallback = `Request failed (${response.status} ${response.statusText})`;
    const message = await parseErrorMessage(response, fallback);
    throw new Error(message);
  }
}

export async function getMovieStatuses(): Promise<MovieStatusItem[]> {
  return requestJson<MovieStatusItem[]>(`${API_BASE_URL}/movies/status/me`, {
    cache: 'no-store',
    credentials: 'include',
  });
}

export async function upsertMovieStatus(
  payload: UpsertMovieStatusRequest,
): Promise<MovieStatusItem> {
  return requestJson<MovieStatusItem>(`${API_BASE_URL}/movies/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
}

export async function searchMovies(query: string): Promise<TmdbMovieSearchItem[]> {
  return requestJson<TmdbMovieSearchItem[]>(
    `${API_BASE_URL}/movies/search?query=${encodeURIComponent(query)}`,
    {
      cache: 'no-store',
      credentials: 'include',
    },
  );
}

export async function getTopMovies(limit = 8): Promise<TmdbMovieSearchItem[]> {
  const items = await requestJson<TmdbMovieSearchItem[]>(`${API_BASE_URL}/movies/top`, {
    cache: 'no-store',
    credentials: 'include',
  });
  return items.slice(0, limit);
}

export async function updateMovieStatus(
  tmdbId: number,
  payload: UpdateMovieStatusRequest,
): Promise<MovieStatusItem> {
  return requestJson<MovieStatusItem>(`${API_BASE_URL}/movies/status/${tmdbId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
}

export async function deleteMovieStatus(
  tmdbId: number,
): Promise<void> {
  await requestVoid(`${API_BASE_URL}/movies/status/${tmdbId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}
