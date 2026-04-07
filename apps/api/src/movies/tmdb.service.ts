import {
  BadGatewayException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import type { TmdbMovieSearchItem } from '@moviehub/shared-types';
import { ConfigService } from '@nestjs/config';

interface TmdbSearchResponse {
  results: Array<{
    id: number;
    title: string;
    overview: string;
    release_date?: string;
    poster_path?: string;
    genre_ids?: number[];
    vote_average?: number;
  }>;
}

const TMDB_GENRE_MAP: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Science Fiction',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

@Injectable()
export class TmdbService {
  private readonly baseUrl = 'https://api.themoviedb.org/3';
  constructor(private readonly configService: ConfigService) {}

  async searchMovies(query: string): Promise<TmdbMovieSearchItem[]> {
    const apiKey = this.configService.get<string>('TMDB_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('TMDB_API_KEY is not configured');
    }

    const url = new URL(`${this.baseUrl}/search/movie`);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('query', query);
    url.searchParams.set('include_adult', 'false');
    url.searchParams.set('language', 'en-US');
    url.searchParams.set('page', '1');

    const response = await fetch(url.toString());
    if (!response.ok) {
      if (response.status === 401) {
        throw new UnauthorizedException('TMDB API key is invalid');
      }
      if (response.status === 429) {
        throw new HttpException(
          'TMDB rate limit exceeded',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw new BadGatewayException(
        `TMDB search failed with status ${response.status}`,
      );
    }

    const data = (await response.json()) as TmdbSearchResponse;
    return data.results.slice(0, 10).map((movie) => ({
      tmdbId: movie.id,
      title: movie.title,
      overview: movie.overview ?? '',
      releaseDate: movie.release_date ?? null,
      posterPath: movie.poster_path ?? null,
      genres: (movie.genre_ids ?? [])
        .map((genreId) => TMDB_GENRE_MAP[genreId])
        .filter((genre): genre is string => Boolean(genre)),
      voteAverage:
        typeof movie.vote_average === 'number'
          ? Number(movie.vote_average.toFixed(1))
          : null,
    }));
  }
}
