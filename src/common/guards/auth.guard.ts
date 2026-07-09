import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GenerateToken } from '../../core/utils/jwt';

/**
 * AuthGuard - har bir himoyalangan so'rovda JWT tokenni tekshiradi.
 * Token faqat "Authorization: Bearer <token>" header orqali olinadi.
 * Token to'g'ri bo'lsa, undan chiqqan {id, role} ma'lumoti req.user ga yoziladi.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly generateToken: GenerateToken) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const token = this.extractToken(req);

    if (!token) {
      throw new UnauthorizedException('Token topilmadi, avval tizimga kiring!');
    }

    try {
      const payload = await this.generateToken.verifyToken(token);
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Token yaroqsiz yoki muddati tugagan!');
    }
  }

  private extractToken(req: any): string | undefined {
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    return undefined;
  }
}
