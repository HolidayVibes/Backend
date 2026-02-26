import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly resendApiKey: string;
  private readonly EMAIL_FROM: string;
  constructor(private readonly configService: ConfigService) {
    this.resendApiKey = this.configService.getOrThrow<string>('RESEND_API_KEY');
    this.EMAIL_FROM = this.configService.getOrThrow<string>('EMAIL_FROM');
  }

  async sendVerificationEmail(to: string, code: string) {
    const resend = new Resend(this.resendApiKey);

    await resend.emails.send({
      from: this.EMAIL_FROM,
      to: [to],
      subject: 'Verify your email',
      html: `<p>Your verification code is: ${code}</p>`,
    });
  }
}
