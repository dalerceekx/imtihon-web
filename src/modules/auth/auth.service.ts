import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../core/database/prisma.service';
import { GenerateToken } from '../../core/utils/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly generateToken: GenerateToken,
  ) {}

  async register(payload: RegisterDto) {
    const exists = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: payload.email }, { username: payload.username }],
      },
    });

    if (exists) {
      throw new ConflictException('Bu email yoki username allaqachon ro\'yxatdan o\'tgan!');
    }

    const passwordHash = await argon2.hash(payload.password);

    const user = await this.prisma.user.create({
      data: {
        username: payload.username,
        email: payload.email,
        password_hash: passwordHash,
        profile: {
          create: {
            full_name: payload.full_name ?? null,
            phone: payload.phone ?? null,
            country: payload.country ?? null,
          },
        },
      },
    });

    return {
      success: true,
      message: 'Ro\'yxatdan muvaffaqiyatli o\'tdingiz',
      data: {
        user_id: user.id,
        username: user.username,
        role: user.role,
        created_at: user.created_at,
      },
    };
  }


  async login(payload: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: payload.email } });

    if (!user) {
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri!');
    }

    const isPasswordValid = await argon2.verify(user.password_hash, payload.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email yoki parol noto\'g\'ri!');
    }

    const accessToken = await this.generateToken.generateAccessToken(user.id, user.role);
    const refreshToken = await this.generateToken.generateRefreshToken(user.id, user.role);

    const activeSubscription = await this.prisma.userSubscription.findFirst({
      where: { user_id: user.id, status: 'ACTIVE', end_date: { gte: new Date() } },
      include: { plan: true },
      orderBy: { end_date: 'desc' },
    });

    return {
      success: true,
      message: 'Muvaffaqiyatli kirildi',
      data: {
        user_id: user.id,
        username: user.username,
        role: user.role,
        subscription: {
          plan_name: activeSubscription?.plan.name ?? 'Free',
          expires_at: activeSubscription?.end_date ?? null,
        },
        accessToken,
        refreshToken,
      },
    };
  }
  
  async logout() {
    return {
      success: true,
      message: 'Muvaffaqiyatli tizimdan chiqildi',
    };
  }
}
