import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import 'reflect-metadata';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { abortOnError: false });
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Karmolog4u-dev')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth() // Додати підтримку авторизації
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document, {
    customSiteTitle: 'Swagger API',
    swaggerOptions: {
      defaultModelRendering: 'example',
      docExpansion: 'none',
      persistAuthorization: true, // 👈 Зберігає токен у sessionStorage
      requestInterceptor: (req) => {
        req.headers['Accept-Charset'] = 'utf-8'; // Ensure UTF-8 headers are set
        return req;
      },
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enables transformations
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter()); // глобальний фільтр для обробки помилок
  app.enableCors();
  app.useLogger(new Logger());
  await app.listen(port || 4499);
}
bootstrap();