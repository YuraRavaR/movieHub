import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type {
  MovieStatusItem,
  TmdbMovieSearchItem,
} from '@moviehub/shared-types';
import type { Request } from 'express';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateMovieStatusDto } from './dto/update-movie-status.dto';
import { SearchMoviesDto } from './dto/search-movies.dto';
import { UpsertMovieStatusDto } from './dto/upsert-movie-status.dto';
import { MoviesService } from './movies.service';
import { TmdbService } from './tmdb.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthJwtPayload } from '../auth/jwt.strategy';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly tmdbService: TmdbService,
  ) {}

  @ApiOperation({ summary: 'Search movies in TMDB' })
  @ApiOkResponse({ description: 'List of TMDB movies' })
  @Get('search')
  searchMovies(
    @Query() query: SearchMoviesDto,
  ): Promise<TmdbMovieSearchItem[]> {
    return this.tmdbService.searchMovies(query.query);
  }

  @ApiOperation({ summary: 'Get top rated movies from TMDB' })
  @ApiOkResponse({ description: 'Top rated movies list' })
  @Get('top')
  getTopMovies(): Promise<TmdbMovieSearchItem[]> {
    return this.tmdbService.getTopMovies(8);
  }

  @ApiOperation({ summary: 'Create or update movie status for a user' })
  @ApiCreatedResponse({ description: 'Movie status is upserted' })
  @UseGuards(JwtAuthGuard)
  @Post('status')
  upsertStatus(
    @Req() req: Request & { user: AuthJwtPayload },
    @Body() payload: UpsertMovieStatusDto,
  ): Promise<MovieStatusItem> {
    return this.moviesService.upsertStatus(req.user.email, payload);
  }

  @ApiOperation({ summary: 'Get all movie statuses for user' })
  @ApiOkResponse({ description: 'List of movie statuses' })
  @UseGuards(JwtAuthGuard)
  @Get('status/me')
  getStatuses(
    @Req() req: Request & { user: AuthJwtPayload },
  ): Promise<MovieStatusItem[]> {
    return this.moviesService.getStatuses(req.user.email);
  }

  @ApiOperation({ summary: 'Update existing movie status' })
  @ApiParam({ name: 'tmdbId', description: 'TMDB movie id' })
  @ApiOkResponse({ description: 'Updated movie status item' })
  @UseGuards(JwtAuthGuard)
  @Patch('status/:tmdbId')
  updateStatus(
    @Req() req: Request & { user: AuthJwtPayload },
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
    @Body() payload: UpdateMovieStatusDto,
  ): Promise<MovieStatusItem> {
    return this.moviesService.updateStatus(req.user.email, tmdbId, payload);
  }

  @ApiOperation({ summary: 'Delete movie status for user' })
  @ApiParam({ name: 'tmdbId', description: 'TMDB movie id' })
  @UseGuards(JwtAuthGuard)
  @Delete('status/:tmdbId')
  deleteStatus(
    @Req() req: Request & { user: AuthJwtPayload },
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
  ): Promise<void> {
    return this.moviesService.deleteStatus(req.user.email, tmdbId);
  }
}
