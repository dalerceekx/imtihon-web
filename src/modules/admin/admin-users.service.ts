import { ConflictException, Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Role } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}
  async createAdmin(payload: CreateAdminDto) {
    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: payload.email }, { username: payload.username }],
      },
    });

    if (exists) {
      throw new ConflictException('Bu email yoki username allaqachon ro\'yxatdan o\'tgan!');
    }

    const passwordHash = await argon2.hash(payload.password);

    const admin = await this.prisma.user.create({
      data: {
        username: payload.username,
        email: payload.email,
        password_hash: passwordHash,
        role: Role.ADMIN,
        profile: { create: {} },
      },
    });

    return {
      success: true,
      message: 'Yangi admin muvaffaqiyatli qo\'shildi',
      data: {
        user_id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        created_at: admin.created_at,
      },
    };
  }
}