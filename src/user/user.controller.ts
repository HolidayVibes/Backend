import {
  Controller,
  Get,
  Delete,
  Body,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';

import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guards/jwt-guard.guard';
import { UpdateUserDto } from './dto/update.dto';
import { RequestWithUser } from './interfaces/RequestWithUser.interface';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getMe(@Req() req: RequestWithUser) {
    return this.userService.get(req.user.id);
  }

  @Put()
  async updateMe(@Req() req: RequestWithUser, @Body() dto: UpdateUserDto) {
    return this.userService.update(req.user.id, dto);
  }

  @Delete()
  async deleteMe(@Req() req: RequestWithUser) {
    return this.userService.delete(req.user.id);
  }
}
