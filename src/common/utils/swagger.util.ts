import { INestApplication } from '@nestjs/common';
import { getSwaggerConfig } from '../config/swagger.config';
import { SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = getSwaggerConfig();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/docs', app, document, {
    jsonDocumentUrl: '/swagger.json',
    yamlDocumentUrl: '/swagger.yaml',
    customSiteTitle: 'Holiday vibes api docs',
  });
}
