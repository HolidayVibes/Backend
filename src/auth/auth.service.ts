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
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_TTL: string;
  private readonly JWT_REFRESH_TOKEN_TTL: string;

  private readonly COOKIE_TTL: string;
  private readonly COOKIE_DOMAIN: string;

  private readonly EMAIL_TTL: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
  ) {
    this.JWT_ACCESS_TOKEN_TTL = this.configService.getOrThrow<string>(
      'JWT_ACCESS_TOKEN_TTL',
    );

    this.JWT_REFRESH_TOKEN_TTL = this.configService.getOrThrow<string>(
      'JWT_REFRESH_TOKEN_TTL',
    );

    this.COOKIE_DOMAIN = this.configService.getOrThrow<string>('COOKIE_DOMAIN');
    this.COOKIE_TTL = this.configService.getOrThrow<string>('COOKIE_TTL');

    this.EMAIL_TTL = this.configService.getOrThrow<string>('EMAIL_TTL');
  }

  public async register(res: Response, dto: RegisterDto) {
    dto.passwordHash = await hash(dto.passwordHash);

    const user = await this.userService.create(dto);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(
      Date.now() + ms(this.EMAIL_TTL as ms.StringValue),
    );

    await this.prismaService.emailVerification.upsert({
      where: {
        userId: user.id,
      },
      update: {
        codeHash: await hash(code),
        expiresAt,
        attemptCount: 0,
      },
      create: {
        codeHash: await hash(code),
        expiresAt,
        user: {
          connect: { id: user.id },
        },
      },
    });

    await this.mailService.sendVerificationEmail(user.email, code);

    await this.auth(res, user.id);
  }

  public async login(res: Response, dto: LoginDto) {
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

    await this.auth(res, user.id);
  }

  public async refresh(req: RequestWithCookies, res: Response) {
    const refreshToken = req.cookies['refreshToken'];

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const payload = await this.jwtService.verify(refreshToken);

    const user = await this.prismaService.user.findUnique({
      where: { id: payload.id },
      select: { refreshTokenHash: true },
    });

    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException();
    }

    const isValid = await verify(user.refreshTokenHash, refreshToken);

    if (!isValid) {
      throw new UnauthorizedException();
    }

    await this.issueAccessTokenOnly(
      res,
      payload.id,
      new Date(Date.now() + ms(this.COOKIE_TTL as ms.StringValue)),
    );
  }

  public async logout(res: Response): Promise<void> {
    this.setCookie(
      res,
      { refreshToken: 'refreshToken', accessToken: 'accessToken' },
      new Date(),
    );
  }

  public async verifyEmail(userId: string, code: string, res: Response) {
    const verification = await this.prismaService.emailVerification.findUnique({
      where: { userId },
    });

    if (!verification) {
      throw new NotFoundException('Код не найден');
    }

    if (verification.attemptCount >= 5) {
      throw new UnauthorizedException('Слишком много попыток');
    }

    if (new Date() > verification.expiresAt) {
      throw new UnauthorizedException('Неверный или истекший код');
    }

    const isCodeValid = await verify(verification.codeHash, code);

    if (!isCodeValid) {
      await this.prismaService.emailVerification.update({
        where: { userId },
        data: {
          attemptCount: { increment: 1 },
        },
      });

      throw new UnauthorizedException('Неверный или истекший код');
    }

    await this.prismaService.$transaction([
      this.prismaService.user.update({
        where: { id: userId },
        data: { isEmailVerified: true },
      }),
      this.prismaService.emailVerification.delete({
        where: { userId },
      }),
    ]);

    await this.auth(res, userId);
  }

  private async auth(res: Response, id: string) {
    const tokens = await this.generateTokens(id);

    this.setCookie(
      res,
      tokens,
      new Date(Date.now() + ms(this.COOKIE_TTL as ms.StringValue)),
    );

    await this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        refreshTokenHash: await hash(tokens.refreshToken),
      },
    });
  }

  private async issueAccessTokenOnly(res: Response, id: string, expires: Date) {
    const { accessToken } = await this.generateTokens(id);

    res.cookie('accessToken', accessToken, {
      expires,
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      secure: !isDev(this.configService),
      sameSite: !isDev(this.configService) ? 'none' : 'lax',
    });

    console.log(res);
  }

  async validate(id: string) {
    const user = await this.userService.me(id);

    return user;
  }

  private async generateTokens(id: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        isEmailVerified: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload: JWTPayload = {
      id: user.id,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_TTL as ms.StringValue,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_TTL as ms.StringValue,
    });

    return { accessToken, refreshToken };
  }

  private setCookie(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
    expires: Date,
  ): void {
    res.cookie('refreshToken', tokens.refreshToken, {
      expires,
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      secure: !isDev(this.configService),
      sameSite: !isDev(this.configService) ? 'none' : 'lax',
    });

    res.cookie('accessToken', tokens.accessToken, {
      expires,
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      secure: !isDev(this.configService),
      sameSite: !isDev(this.configService) ? 'none' : 'lax',
    });
  }
}
