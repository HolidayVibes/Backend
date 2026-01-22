import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Holiday Vibes API')
    .setDescription('Holiday Vibes documentation')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
}
