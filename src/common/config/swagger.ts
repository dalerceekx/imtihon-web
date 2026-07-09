import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Kinolar sayti API')
  .setDescription('Kino ko\'rish, sevimlilar, obuna va admin panel uchun backend API')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
