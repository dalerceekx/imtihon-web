import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

/**
 * PrismaService - Prisma ORM orqali PostgreSQL bazasi bilan ishlash uchun asosiy servis.
 * Butun ilova davomida bitta connection pool ishlatiladi (@Global modul sifatida ulanadi).
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // PostgreSQL uchun connection pool yaratamiz va uni Prisma adapteriga uzatamiz
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);

    super({ adapter, log: ['error', 'warn'] });
  }

  // Nest moduli ishga tushganda bazaga ulanish o'rnatiladi
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Baza bilan aloqa muvaffaqiyatli o\'rnatildi!');
  }

  // Ilova to'xtaganda baza bilan aloqa yopiladi (resurslarni tejash uchun)
  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Baza bilan aloqa uzildi!');
  }
}
