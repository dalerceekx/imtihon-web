import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';


export interface JwtPayload {
  id: string;
  role: Role;
}

@Injectable()
export class GenerateToken {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(id: string, role: Role): Promise<string> {
    return this.jwtService.sign(
      { id, role } as JwtPayload,
      { expiresIn: (process.env.JWT_ACCESS_EXPIRES || '30m') as any },
    );
  }

  async generateRefreshToken(id: string, role: Role): Promise<string> {
    return this.jwtService.sign(
      { id, role } as JwtPayload,
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES || '7d') as any },
    );
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verify<JwtPayload>(token, { secret: process.env.JWT_SECRET });
  }
}
