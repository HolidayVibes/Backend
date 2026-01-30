import { S3Client } from '@aws-sdk/client-s3';

export function createS3Client(): S3Client {
  const accessKeyId = process.env.YC_ACCESS_KEY;
  const secretAccessKey = process.env.YC_SECRET_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'YC_ACCESS_KEY and YC_SECRET_KEY environment variables must be defined',
    );
  }

  return new S3Client({
    region: 'ru-central1', // регион Yandex Cloud
    endpoint: 'https://storage.yandexcloud.net', // Yandex S3 endpoint
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}
