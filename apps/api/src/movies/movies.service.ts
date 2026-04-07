import { Injectable, NotFoundException } from '@nestjs/common';
import type { MovieStatusItem } from '@moviehub/shared-types';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMovieStatusDto } from './dto/update-movie-status.dto';
import { UpsertMovieStatusDto } from './dto/upsert-movie-status.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertStatus(payload: UpsertMovieStatusDto): Promise<MovieStatusItem> {
    const user = await this.prisma.user.upsert({
      where: { email: payload.userEmail },
      update: {},
      create: { email: payload.userEmail },
    });

    const movie = await this.prisma.movie.upsert({
      where: { tmdbId: payload.tmdbId },
      update: { title: payload.title, posterPath: payload.posterPath ?? null },
      create: {
        tmdbId: payload.tmdbId,
        title: payload.title,
        posterPath: payload.posterPath ?? null,
      },
    });

    const userMovie = await this.prisma.userMovie.upsert({
      where: { userId_movieId: { userId: user.id, movieId: movie.id } },
      update: { status: payload.status },
      create: {
        userId: user.id,
        movieId: movie.id,
        status: payload.status,
      },
      include: { movie: true },
    });

    return {
      tmdbId: userMovie.movie.tmdbId,
      title: userMovie.movie.title,
      posterPath: userMovie.movie.posterPath,
      status: userMovie.status,
    };
  }

  async getStatuses(userEmail: string): Promise<MovieStatusItem[]> {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) return [];

    const items = await this.prisma.userMovie.findMany({
      where: { userId: user.id },
      include: { movie: true },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      tmdbId: item.movie.tmdbId,
      title: item.movie.title,
      posterPath: item.movie.posterPath,
      status: item.status,
    }));
  }

  async updateStatus(
    userEmail: string,
    tmdbId: number,
    payload: UpdateMovieStatusDto,
  ): Promise<MovieStatusItem> {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });
    const movie = await this.prisma.movie.findUnique({ where: { tmdbId } });
    if (!user || !movie) throw new NotFoundException('Movie status not found');

    const updated = await this.prisma.userMovie.update({
      where: { userId_movieId: { userId: user.id, movieId: movie.id } },
      data: { status: payload.status },
      include: { movie: true },
    });

    return {
      tmdbId: updated.movie.tmdbId,
      title: updated.movie.title,
      posterPath: updated.movie.posterPath,
      status: updated.status,
    };
  }

  async deleteStatus(userEmail: string, tmdbId: number): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });
    const movie = await this.prisma.movie.findUnique({ where: { tmdbId } });
    if (!user || !movie) throw new NotFoundException('Movie status not found');

    await this.prisma.userMovie.delete({
      where: { userId_movieId: { userId: user.id, movieId: movie.id } },
    });
  }
}
