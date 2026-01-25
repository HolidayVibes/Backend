import { type MusicGenres } from '@prisma/client';

export class Music {
  id: string;
  title: string;
  author: string;
  releaseDate: string;
  description: string;
  duration: number;
  album?: string;
  genres: MusicGenres[];
  linkToYm: string;
  createdAt: Date;
  updatedAt: Date;
}
