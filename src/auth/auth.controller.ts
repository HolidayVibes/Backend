import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RequestWithCookies } from './intrerfaces/cookie.interface';
import { RequestWithUser } from 'src/common/interfaces/RequestWithUser.interface';
import { JwtGuard } from './guards/jwt-guard.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.register(res, dto);
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(res, dto);
  }

  @Post('refresh')
  async refresh(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refresh(req, res);
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  @UseGuards(JwtGuard)
  @Post('verify-email')
  async verifyEmail(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
    @Body('code') code: string,
  ) {
    return this.authService.verifyEmail(req.user.id, code, res);
  }
}
