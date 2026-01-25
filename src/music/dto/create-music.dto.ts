import { MusicGenres } from '@prisma/client';
import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateMusicDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  author: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1000)
  @Max(new Date().getFullYear(), {
    message: 'Год не может быть больше текущего',
  })
  releaseDate: number;

  @IsString()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsString()
  album?: string;

  @IsNotEmpty()
  @IsEnum(MusicGenres)
  genre: MusicGenres;

  @IsUrl({
    host_whitelist: ['music.yandex.ru'],
  })
  @IsNotEmpty()
  linkToYm: string;
}
