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
import { RequestWithUser } from '../common/interfaces/RequestWithUser.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileTypeFromBuffer } from 'file-type';
import { EmailVerifiedGuard } from 'src/mail/guards/email-verifyed.guard';

@Controller('user')
@UseGuards(JwtGuard, EmailVerifiedGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@Req() req: RequestWithUser) {
    console.log(1);

    return this.userService.me(req.user.id);
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
