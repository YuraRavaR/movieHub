import { MovieStatus } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpsertMovieStatusDto {
  @IsEmail()
  userEmail!: string;

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
