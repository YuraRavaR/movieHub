import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TmdbService } from './tmdb.service';

describe('TmdbService', () => {
  const originalFetch = global.fetch;
  const configService = {
    get: jest.fn((key: string) =>
      key === 'TMDB_API_KEY' ? 'test-key' : undefined,
    ),
  } as unknown as ConfigService;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('maps TMDB response to shared contract shape', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 550,
            title: 'Fight Club',
            overview: 'An insomniac office worker...',
            release_date: '1999-10-15',
            poster_path: '/poster.jpg',
            genre_ids: [18],
            vote_average: 8.43,
          },
        ],
      }),
    } as Response);

    const service = new TmdbService(configService);
    const result = await service.searchMovies('fight club');

    expect(result).toEqual([
      {
        tmdbId: 550,
        title: 'Fight Club',
        overview: 'An insomniac office worker...',
        releaseDate: '1999-10-15',
        posterPath: '/poster.jpg',
        genres: ['Drama'],
        voteAverage: 8.4,
      },
    ]);
  });

  it('throws when TMDB_API_KEY is missing', async () => {
    const missingKeyConfig = {
      get: jest.fn(() => undefined),
    } as unknown as ConfigService;
    const service = new TmdbService(missingKeyConfig);

    await expect(service.searchMovies('batman')).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('throws UnauthorizedException for invalid TMDB key', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);
    const service = new TmdbService(configService);

    await expect(service.searchMovies('batman')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
