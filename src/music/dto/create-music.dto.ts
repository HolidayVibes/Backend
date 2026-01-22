import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateMusicDto {
  @IsString()
  @IsNotEmpty()
  title: string;
  @IsString()
  @IsNotEmpty()
  artist: string;
  @IsString()
  @IsNotEmpty()
  album?: string;
  @IsUrl()
  @IsNotEmpty()
  linkToYm: string;
}
