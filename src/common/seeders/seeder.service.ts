import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedSuperadmin();
    await this.seedSubscriptionPlans();
  }

  private async seedSuperadmin() {
    const email = process.env.SUPERADMIN_EMAIL || 'rizoqulov@gmail.com';
    const password = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123';

    const exists = await this.prisma.user.findUnique({ where: { email } });

    if (exists) {
      this.logger.log('Superadmin allaqachon mavjud');
      return;
    }

    await this.prisma.user.create({
      data: {
        username: 'rizoqulov',
        email,
        password_hash: await argon2.hash(password),
        role: Role.SUPERADMIN,
        profile: { create: { full_name: 'Bosh Administrator' } },
      },
    });

    this.logger.log(`Superadmin yaratildi -> email: ${email}, parol: ${password}`);
  }

  private async seedSubscriptionPlans() {
    const count = await this.prisma.subscriptionPlan.count();
    if (count > 0) {
      this.logger.log('Obuna rejalari allaqachon mavjud');
      return;
    }

    await this.prisma.subscriptionPlan.createMany({
      data: [
        {
          name: 'Free',
          price: 0,
          duration_days: 0,
          features: ['SD sifatli kinolar', 'Reklama bilan'],
        },
        {
          name: 'Premium',
          price: 49.99,
          duration_days: 30,
          features: ['HD sifatli kinolar', 'Reklamasiz', 'Yangi kinolar'],
        },
      ],
    });

    this.logger.log('Standart obuna rejalari (Free, Premium) yaratildi');
  }
}
