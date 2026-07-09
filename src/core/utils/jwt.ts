import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

/**
 * JWT payload ichida saqlanadigan ma'lumotlar
 */
export interface JwtPayload {
  id: string;
  role: Role;
}

/**
 * GenerateToken - access va refresh tokenlarni yaratish hamda tekshirish uchun servis.
 * Bu servis @Global modul ichida ro'yxatdan o'tgani uchun har qanday joyda inject qilinaveradi.
 */
@Injectable()
export class GenerateToken {
  constructor(private readonly jwtService: JwtService) {}

  // Qisqa muddatli (odatda 30 daqiqa) access token yaratadi - har bir so'rovda foydalanuvchini tanish uchun
  async generateAccessToken(id: string, role: Role): Promise<string> {
    return this.jwtService.sign(
      { id, role } as JwtPayload,
      // "expiresIn" turi ("30m", "7d" kabi) jsonwebtoken kutubxonasining maxsus
      // literal-string turiga ega, shuning uchun .env dan kelayotgan oddiy "string" ni shu turga moslaymiz
      { expiresIn: (process.env.JWT_ACCESS_EXPIRES || '30m') as any },
    );
  }

  // Uzoq muddatli (odatda 7 kun) refresh token yaratadi - access token muddati tugaganda yangilash uchun
  async generateRefreshToken(id: string, role: Role): Promise<string> {
    return this.jwtService.sign(
      { id, role } as JwtPayload,
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES || '7d') as any },
    );
  }

  // Tokenni tekshiradi va ichidagi payload (id, role) ni qaytaradi. Token noto'g'ri/eskirgan bo'lsa xatolik tashlaydi
  async verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verify<JwtPayload>(token, { secret: process.env.JWT_SECRET });
  }
}
