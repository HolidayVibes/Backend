import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from './intrerfaces/JwtPayload.interface';
import * as ms from 'ms';
import type { Response } from 'express';
import { isDev } from 'src/common/utils/is_dev.util';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { hash, verify } from 'argon2';
import { LoginDto } from './dto/login.dto';
import { RequestWithCookies } from './intrerfaces/cookie.interface';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  private readonly JWT_ACCES_TOKEN_TTL: string;
  private readonly JWT_REFRESH_TOKEN_TTL: string;

  private readonly COOKIE_TTL: string;
  private readonly COOKIE_DOMAIN: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtServise: JwtService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {
    this.JWT_ACCES_TOKEN_TTL = this.configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_TTL',
    );

    this.JWT_REFRESH_TOKEN_TTL = this.configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_TTL',
    );

    this.COOKIE_DOMAIN = this.configService.getOrThrow<string>('COOKIE_DOMAIN');
    this.COOKIE_TTL = this.configService.getOrThrow<string>('COOKIE_TTL');
  }

  public async register(
    res: Response,
    dto: RegisterDto,
  ): Promise<{ accesToken: string }> {
    dto.passwordHash = await hash(dto.passwordHash);

    const user = await this.userService.create(dto);

    return this.auth(res, user.id);
  }

  public async login(
    res: Response,
    dto: LoginDto,
  ): Promise<{ accesToken: string }> {
    const { email, password } = dto;

    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Неверная пара логина и пароля');
    }

    const isPasswordValid = await verify(user.passwordHash, password);

    if (!isPasswordValid) {
      throw new NotFoundException('Неверная пара логина и пароля');
    }

    return this.auth(res, user.id);
  }

  public async refresh(
    req: RequestWithCookies,
    res: Response,
  ): Promise<{ accesToken: string }> {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException('Не действительный токен');
    }

    const payload: JWTPayload = await this.jwtServise.verify(refreshToken);

    if (!payload) {
      throw new UnauthorizedException('Не действительный токен');
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.id,
      },
      select: {
        refreshTokenHash: true,
      },
    });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Не действительный токен');
    }

    const isValidRefreshToken = await verify(
      user.refreshTokenHash,
      refreshToken,
    );

    if (!isValidRefreshToken) {
      throw new UnauthorizedException('Не действительный токен');
    }

    return this.auth(res, payload.id);
  }

  public async logout(res: Response): Promise<void> {
    this.setCookie(res, 'refreshToken', new Date());
  }

  private async auth(res: Response, id: string) {
    const { accesToken, refreshToken } = this.generateTokens(id);

    this.setCookie(
      res,
      refreshToken,
      new Date(Date.now() + ms(this.COOKIE_TTL as ms.StringValue)),
    );

    await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        refreshTokenHash: await hash(refreshToken),
      },
    });

    return { accesToken };
  }

  async validate(id: string) {
    const user = await this.userService.get(id);

    return user;
  }

  private generateTokens(id: string): {
    accesToken: string;
    refreshToken: string;
  } {
    const payload: JWTPayload = { id };

    const accesToken = this.jwtServise.sign(payload, {
      expiresIn: this.JWT_ACCES_TOKEN_TTL as ms.StringValue,
    });

    const refreshToken = this.jwtServise.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL as ms.StringValue,
    });

    return { accesToken, refreshToken };
  }

  private setCookie(res: Response, value: string, expires: Date): void {
    res.cookie('refreshToken', value, {
      expires,
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? 'none' : 'lax',
    });
  }
}
