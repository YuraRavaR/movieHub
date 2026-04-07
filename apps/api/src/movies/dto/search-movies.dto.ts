import { IsString, MinLength } from 'class-validator';

export class SearchMoviesDto {
  @IsString()
  @MinLength(2)
  query!: string;
}
