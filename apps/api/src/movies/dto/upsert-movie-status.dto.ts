import { MovieStatus } from '@prisma/client';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpsertMovieStatusDto {
  @IsInt()
  @Min(1)
  tmdbId!: number;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  posterPath?: string | null;

  @IsEnum(MovieStatus)
  status!: MovieStatus;
}
