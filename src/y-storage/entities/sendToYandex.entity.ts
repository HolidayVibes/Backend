export interface SendToYandex {
  key: string;
  contentType: string;
  bucket_name: string;
}

export interface SendToYandexPayload extends SendToYandex {
  file: Buffer;
}

export interface SendToYandexResponse {
  message: string;
  key: string;
}
