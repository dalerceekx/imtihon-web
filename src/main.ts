import "dotenv/config"
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { swaggerConfig } from './common/config/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Har bir kiruvchi so'rovni DTO qoidalari bo'yicha avtomatik tekshiradi
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTOda yo'q maydonlarni so'rovdan olib tashlaydi
      transform: true, // query/param satrlarini (masalan "1") kerakli turga (number) o'giradi
      forbidNonWhitelisted: false,
    }),
  );

  // Barcha endpointlar /api/v1 prefiksi bilan ochiladi (masalan /api/v1/auth/login)
  app.setGlobalPrefix('api/v1');

  // CORS - frontend boshqa domendan so'rov yuborishi uchun
  app.enableCors({
    origin: true,
  });

  // Swagger hujjatlari /swagger manzilida ochiladi
  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, documentFactory, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
