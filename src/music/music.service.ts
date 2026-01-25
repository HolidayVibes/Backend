import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Music } from '@prisma/client';

@Injectable()
export class MusicService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMusicDto: CreateMusicDto) {
    const music = await this.prisma.music.create({
      data: createMusicDto,
    });

    return music;
  }

  async findAll() {
    return `This action returns all music`;
  }

  async findOne(id: string): Promise<Music> {
    const music = await this.prisma.music.findUnique({
      where: { id },
    });

    if (!music) {
      throw new NotFoundException(`Music with ID ${id} not found`);
    }

    return music;
  }

  async update(id: string, updateMusicDto: UpdateMusicDto) {
    const music = await this.prisma.music.findUnique({
      where: { id },
    });

    if (!music) {
      throw new NotFoundException(`Music with ID ${id} not found`);
    }

    const updMusic = {
      ...music,
      ...updateMusicDto,
    };

    return await this.prisma.music.update({
      data: updMusic,
      where: { id },
    });
  }

  async remove(id: string) {
    const music = await this.prisma.music.delete({
      where: {
        id,
      },
    });

    return music;
  }
}
