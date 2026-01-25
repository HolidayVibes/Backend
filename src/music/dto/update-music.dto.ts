import { MusicGenres } from '@prisma/client'; // Import the enum from Prisma Client
import { IsString, IsNumber, IsEnum, IsUrl, Length } from 'class-validator';

export class UpdateMusicDto {
  @IsString()
  title?: string;

  @IsString()
  author?: string;

  @IsNumber()
  @Length(4, 4)
  releaseDate?: number;

  @IsString()
  description?: string;

  @IsNumber()
  duration?: number;

  @IsString()
  album?: string;

  @IsEnum(MusicGenres)
  genre?: MusicGenres;

  @IsUrl({
    host_whitelist: ['music.yandex.ru'],
  })
  linkToYm?: string;
}
