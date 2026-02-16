import {
  Controller,
  Get,
  Delete,
  Body,
  UseGuards,
  Req,
  Put,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';

import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guards/jwt-guard.guard';
import { UpdateUserDto } from './dto/update.dto';
import { RequestWithUser } from './interfaces/RequestWithUser.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileTypeFromBuffer } from 'file-type';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getMe(@Req() req: RequestWithUser) {
    return this.userService.get(req.user.id);
  }

  @Put()
  @UseInterceptors(
    FileInterceptor('avatar', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  async update(
    @Req() req: RequestWithUser,
    @Body() dto: UpdateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    const type = await fileTypeFromBuffer(avatar.buffer);

    if (!type || type.mime !== 'image/png') {
      throw new BadRequestException('Разрешены только PNG файлы');
    }

    return this.userService.update(req.user.id, dto, avatar);
  }

  @Delete()
  async deleteMe(@Req() req: RequestWithUser) {
    return this.userService.delete(req.user.id);
  }
}
