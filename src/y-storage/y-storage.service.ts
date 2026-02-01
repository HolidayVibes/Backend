import { Global, Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { createS3Client } from 'src/common/config/s3.config';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import type {
  SendToYandexResponse,
  SendToYandexPayload,
} from './entities/sendToYandex.entity';

@Global()
@Injectable()
export class YStorageService {
  public async sendToYandex({
    file,
    key,
    contentType,
    bucket_name,
  }: SendToYandexPayload): Promise<SendToYandexResponse> {
    {
      const client = createS3Client();

      await client.send(
        new PutObjectCommand({
          Bucket: bucket_name,
          Key: key,
          Body: file,
          ContentType: contentType,
        }),
      );

      return { message: 'File uploaded successfully', key };
    }
  }

  public async convertToWebP(
    file: Express.Multer.File,
    quality?: number,
  ): Promise<Buffer> {
    return await sharp(file.buffer)
      .webp({ quality: quality || 70 })
      .toBuffer();
  }
}
