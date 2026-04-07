export type ServiceStatus = 'ok';
export type MovieStatus = 'WATCHLIST' | 'WATCHED';

export interface HealthResponse {
  status: ServiceStatus;
  service: 'moviehub-api';
  timestamp: string;
}

export interface UpsertMovieStatusRequest {
  userEmail: string;
  tmdbId: number;
  title: string;
  posterPath?: string | null;
  status: MovieStatus;
}

export interface UpdateMovieStatusRequest {
  status: MovieStatus;
}

export interface MovieStatusItem {
  tmdbId: number;
  title: string;
  posterPath: string | null;
  status: MovieStatus;
}

export interface TmdbMovieSearchItem {
  tmdbId: number;
  title: string;
  overview: string;
  releaseDate: string | null;
  posterPath: string | null;
  genres: string[];
  voteAverage: number | null;
}
