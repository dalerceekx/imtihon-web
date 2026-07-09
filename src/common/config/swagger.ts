import { DocumentBuilder } from '@nestjs/swagger';

// Swagger UI orqali API hujjatlarini ko'rish uchun konfiguratsiya (/swagger manzilida ochiladi)
export const swaggerConfig = new DocumentBuilder()
  .setTitle('Kinolar sayti API')
  .setDescription('Kino ko\'rish, sevimlilar, obuna va admin panel uchun backend API')
  .setVersion('1.0')
  .addBearerAuth() // Swagger'da "Authorize" tugmasi orqali Bearer token kiritish imkoniyati
  .build();
