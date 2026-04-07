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
} from '@nestjs/common';
import type {
  MovieStatusItem,
  TmdbMovieSearchItem,
} from '@moviehub/shared-types';
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

  @ApiOperation({ summary: 'Create or update movie status for a user' })
  @ApiCreatedResponse({ description: 'Movie status is upserted' })
  @Post('status')
  upsertStatus(
    @Body() payload: UpsertMovieStatusDto,
  ): Promise<MovieStatusItem> {
    return this.moviesService.upsertStatus(payload);
  }

  @ApiOperation({ summary: 'Get all movie statuses for user' })
  @ApiParam({ name: 'userEmail', description: 'User e-mail' })
  @ApiOkResponse({ description: 'List of movie statuses' })
  @Get('status/:userEmail')
  getStatuses(
    @Param('userEmail') userEmail: string,
  ): Promise<MovieStatusItem[]> {
    return this.moviesService.getStatuses(userEmail);
  }

  @ApiOperation({ summary: 'Update existing movie status' })
  @ApiParam({ name: 'userEmail', description: 'User e-mail' })
  @ApiParam({ name: 'tmdbId', description: 'TMDB movie id' })
  @ApiOkResponse({ description: 'Updated movie status item' })
  @Patch('status/:userEmail/:tmdbId')
  updateStatus(
    @Param('userEmail') userEmail: string,
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
    @Body() payload: UpdateMovieStatusDto,
  ): Promise<MovieStatusItem> {
    return this.moviesService.updateStatus(userEmail, tmdbId, payload);
  }

  @ApiOperation({ summary: 'Delete movie status for user' })
  @ApiParam({ name: 'userEmail', description: 'User e-mail' })
  @ApiParam({ name: 'tmdbId', description: 'TMDB movie id' })
  @Delete('status/:userEmail/:tmdbId')
  deleteStatus(
    @Param('userEmail') userEmail: string,
    @Param('tmdbId', ParseIntPipe) tmdbId: number,
  ): Promise<void> {
    return this.moviesService.deleteStatus(userEmail, tmdbId);
  }
}
