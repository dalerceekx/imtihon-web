import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule - @Global() dekoratori tufayli boshqa har bir modulda
 * qayta import qilmasdan PrismaService dan foydalanish mumkin.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
