import { Module } from '@nestjs/common';
import { PrismaModule } from '../../core/database/prisma.module';
import { SeederService } from './seeder.service';

@Module({
  imports: [PrismaModule],
  providers: [SeederService],
})
export class SeederModule {}
