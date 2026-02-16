import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMusicDto } from './dto/create-music.dto';
import { UpdateMusicDto } from './dto/update-music.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Music } from '@prisma/client';
import {
  PaginationPayload,
  PaginationResponse,
} from 'src/common/interfaces/pagination.interface';
import { paginate } from 'src/common/utils/pagination.util';
import { YStorageService } from 'src/y-storage/y-storage.service';
import { generateFileName } from 'src/common/utils/fileName.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MusicService {
  private readonly bucketName: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly yStorageService: YStorageService,
  ) {
    this.bucketName = this.configService.getOrThrow<string>('MUSIC_BACKET');
  }

  async create(
    createMusicDto: CreateMusicDto,
    file: Express.Multer.File,
  ): Promise<Music> {
    const url = await this.yStorageService
      .convertToWebP(file, 80)
      .then((buffer) => {
        const key = `music/${generateFileName(file.originalname)}.webp`;
        return this.yStorageService
          .sendToYandex({
            file: buffer,
            key,
            contentType: 'image/webp',
            bucket_name: this.bucketName,
          })
          .then(
            () => `https://storage.yandexcloud.net/${this.bucketName}/${key}`,
          );
      });

    const music = await this.prisma.music.create({
      data: { ...createMusicDto, imgUrl: url },
    });

    return music;
  }

  async findAll(
    payload: PaginationPayload,
  ): Promise<PaginationResponse<Music>> {
    const items = await this.prisma.music.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return paginate<Music>(items, payload);
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
    const music = await this.prisma.music.findUnique({
      where: { id },
    });

    if (!music) {
      throw new NotFoundException(`Music with ID ${id} not found`);
    }

    if (music.imgUrl) {
      const key = music.imgUrl.split('/').slice(-2).join('/');

      await this.yStorageService.deleteFromYandex(key, this.bucketName);
    }

    await this.prisma.music.delete({
      where: { id },
    });

    return music;
  }
}
