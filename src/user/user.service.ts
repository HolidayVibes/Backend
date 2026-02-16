import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update.dto';
@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async get(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
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

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь с таким id не найден');
    }

    const updatedUser = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data: dto,
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
