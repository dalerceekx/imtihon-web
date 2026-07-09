import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';

// `pnpm run seed` uchun mustaqil kirish nuqtasi - HTTP serverni ishga tushirmasdan
// faqat SeederModule'ni yaratadi (SeederService.onModuleInit shu yerda avtomatik chaqiriladi)
async function runSeed() {
  const app = await NestFactory.createApplicationContext(SeederModule);
  await app.close();
  Logger.log('Seeding muvaffaqiyatli yakunlandi', 'Seed');
}

runSeed();
