import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(query: ListUsersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.UserWhereInput = {
      ...(query.role && { role: query.role }),
      ...(query.search && {
        OR: [
          { username: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          subscriptions: {
            orderBy: { created_at: 'desc' },
            take: 1,
            include: { plan: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const now = new Date();

    const effectiveStatus = (sub: { status: string; end_date: Date | null }) =>
      sub.status === 'ACTIVE' && sub.end_date && sub.end_date < now ? 'EXPIRED' : sub.status;

    return {
      success: true,
      data: {
        users: users.map((user) => {
          const latestSubscription = user.subscriptions[0];

          return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            subscription_status: latestSubscription ? effectiveStatus(latestSubscription) : 'NO_SUBSCRIPTION',
            subscription_plan: latestSubscription ? latestSubscription.plan.name : null,
            subscription_end_date: latestSubscription ? latestSubscription.end_date : null,
          };
        }),
        pagination: {
          total,
          page,
          limit,
          pages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    };
  }

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
  async updateAdmin(id: string, payload: UpdateAdminDto) {
    const admin = await this.prisma.user.findUnique({ where: { id } });

    if (!admin || admin.role !== Role.ADMIN) {
      throw new NotFoundException('Admin topilmadi!');
    }

    if (payload.username || payload.email) {
      const exists = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(payload.username ? [{ username: payload.username }] : []),
            ...(payload.email ? [{ email: payload.email }] : []),
          ],
          NOT: { id },
        },
      });

      if (exists) {
        throw new ConflictException('Bu email yoki username allaqachon boshqa admin tomonidan ishlatilmoqda!');
      }
    }

    const data: Record<string, unknown> = {};

    if (payload.username) data.username = payload.username;
    if (payload.email) data.email = payload.email;
    if (payload.password) {
      data.password_hash = await argon2.hash(payload.password);
    }

    const updatedAdmin = await this.prisma.user.update({
      where: { id },
      data,
    });

    return {
      success: true,
      message: 'Admin muvaffaqiyatli yangilandi',
      data: {
        user_id: updatedAdmin.id,
        username: updatedAdmin.username,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        updated_at: updatedAdmin.updated_at,
      },
    };
  }

  async removeAdmin(id: string) {
    const admin = await this.prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { createdMovies: true } } },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      throw new NotFoundException('Admin topilmadi!');
    }

    if (admin._count.createdMovies > 0) {
      throw new ConflictException(
        `Bu admin ${admin._count.createdMovies} ta kino qo'shgan - avval o'sha kinolarni boshqa adminga o'tkazing yoki o'chiring!`,
      );
    }

    await this.prisma.user.delete({ where: { id } });

    return {
      success: true,
      message: 'Admin muvaffaqiyatli o\'chirildi',
    };
  }
}