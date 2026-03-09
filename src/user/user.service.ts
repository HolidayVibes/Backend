import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update.dto';
import { YStorageService } from 'src/y-storage/y-storage.service';
import { generateFileName } from 'src/common/utils/fileName.util';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly bucketName: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly yStorageService: YStorageService,
    private readonly configService: ConfigService,
  ) {
    this.bucketName = this.configService.getOrThrow<string>('USER_BACKET');
  }

  async me(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      omit: {
        isEmailVerified: true,
        passwordHash: true,
        refreshTokenHash: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь с таким id не найден');
    }

    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const isUserExist = await this.prismaService.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (isUserExist) {
      throw new ConflictException('Пользователь с такой почтой уже существует');
    }

    const user = await this.prismaService.user.create({
      data: dto,
    });

    return user;
  }

  async update(id: string, dto: UpdateUserDto, avatar?: Express.Multer.File) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь с таким id не найден');
    }

    if (avatar) {
      const url = await this.yStorageService
        .convertToWebP(avatar, 80)
        .then((buffer) => {
          const key = `${user.id}/avatar/${generateFileName(avatar.originalname)}.webp`;
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

      dto.avatarUrl = url;
    }

    const updatedUser = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: dto,
      omit: {
        isEmailVerified: true,
        passwordHash: true,
        refreshTokenHash: true,
      },
    });

    return updatedUser;
  }

  async delete(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь с таким id не найден');
    }

    const deletedUser = await this.prismaService.user.delete({
      where: {
        id,
      },
    });

    return deletedUser;
  }
}
